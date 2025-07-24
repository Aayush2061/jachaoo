import time
import re
import google.generativeai as genai
import logging 
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GENAI_API_KEY2") 
# ----------------------------
# Your Original Full System Instruction (UNCHANGED)
# ----------------------------
SYSTEM_PROMPT = '''
### MEDICAL INTERVIEW SYSTEM – HIGH-STAKES MODE ###

ROLE:
You are an expert AI clinician trained in diagnostic reasoning. Your task is to investigate this patient-reported symptom: **{symptom}**

OBJECTIVE:
Generate **one and only one** next best question to extract missing clinical information — no guessing, no repetition.
Use very simple langauge 

CONTEXT:
The following has already been gathered:
{context}
And Do not repeat what already has been gathered.

RULESET:

1. ❌ Do NOT ask about dimensions that are already covered. If “Duration” has been asked, NEVER ask again.
2. 💡 Ask only one **focused, medically relevant** question at a time.
3. ✅ Question must be about a **new, unasked** clinical dimension.
4. 🧠 Think like a sharp physician — dig into what changes decisions: onset, radiation, red flags, impact, triggers, type, location, etc.
5. 🗣️ Keep language **clear**, **non-technical**, and **easily understood** by patients.
6. 💬 Generate clear, distinct, and easily understandable answer choices for the question avoiding vague options .  
    Use plain language with complete phrases. Avoid vague or ambiguous options like "maybe" or "sometimes."  
    Make options mutually exclusive and cover the most relevant possibilities clearly.  
    At least 3 options and include a final option like "Don't Know" to allow uncertainty .  
    Focus on helping a non-medical user confidently pick the best answer.
7. ⛔ NEVER use "Yes", "No", "Maybe", "Sometimes", "I think", or multi-meaning options like “green/yellow/brown”.
8. 🔁 Do NOT repeat a question. Avoid any variation of questions already asked (even if phrased differently).

PATIENT IS NON-MEDICAL:
Use plain everyday words only. NO medical terms like “radiates”, “localized”, “onset”, “lumbar”, “inflammation”, etc.
Examples:
- Use “back” instead of “lumbar”
- Say “pain goes to the leg” instead of “radiates”
- Use “burning” instead of “neuropathic”

DIMENSIONS TO CONSIDER (choose one that's still missing):
- Duration (only once)
- Location
- Radiation
- Character (type of pain/sensation)
- Severity (only once: Mild, Moderate, Severe, None, Don't Know)
- Timing (when is it worse? morning/night)
- Trigger (what starts or worsens it)
- Relief (what makes it better)
- Functional impact (walking, sleeping, breathing)
- Associated symptoms (fever, nausea, swelling)
- Red flags (weight loss, weakness, dizziness, loss of bladder control)

REPETITION SAFEGUARD (ALL DIMENSIONS):
- Do not repeat or rephrase any previously asked question; never ask more than one question targeting the same information or dimension for a symptom.

EXACT OUTPUT FORMAT:
QUESTION: [Insert best possible question here]
OPTIONS: [Option 1], [Option 2], [Option 3], [Option 4], ..., Don't Know

NOW THINK, ANALYZE, AND GENERATE:
Only return the question and its options in the correct format. Nothing else.
'''

# ----------------------------
# Configure Gemini model once with system instruction
# ----------------------------
# Replace with your actual Gemini API key
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=SYSTEM_PROMPT
)

class MedicalDiagnosisSystem:
    def __init__(self, smoker: str, diabetes: str, blood_pressure: str):
        self.patient_data = {
            "basic_info": {
                "smoker": smoker,
                "diabetes": diabetes,
                "high_blood_pressure": blood_pressure
            },
            "symptoms": [],
            "conversation_log": []
        }
        self.current_stage = "main_symptom"
        self.last_question = ""
        self.current_options = []
        self.current_symptom_context = {}
        self.expecting_free_text = True  # Only allow text when asking symptom description
        self.diagnosis_completed = False  

    # Call Gemini with just symptom/context prompt
    def call_gemini(self, prompt_text: str) -> str:
        try:
            response = model.generate_content([{"role": "user", "parts": [prompt_text]}])
            return response.text.strip()
        except Exception as e:
            msg = str(e).lower()
            if "quota" in msg:
                return "QUOTA_EXCEEDED"
            if "rate limit" in msg or "traffic" in msg or "busy" in msg:
                return "TRAFFIC_BUSY"
            return "ERROR"

    def _validate_input(self, user_input: str) -> bool:
        if not self.current_options:
            return True
        user_input = user_input.strip()
        return user_input.isdigit() and 1 <= int(user_input) <= len(self.current_options)

    def _normalize_input(self, user_input: str) -> str:
        if not self.current_options:
            return user_input.strip()
        if user_input.isdigit() and 1 <= int(user_input) <= len(self.current_options):
            return self.current_options[int(user_input)-1]
        return ""

    def _format_options(self, options: list) -> str:
        if not options:
            return ""
        return "\n" + "\n".join([f"{i+1}) {opt}" for i, opt in enumerate(options)])

    # Use Gemini to normalize symptom description (optional, can be simplified)
    def _normalize_symptom_via_prompt(self, symptom: str) -> str:
        prompt = f"Please normalize this symptom description for medical analysis:\n{symptom}\n\nReturn only the normalized version, nothing else."
        return self.call_gemini(prompt)

    def process_response(self, user_input: str) -> str:
        # Check for completion first
        if getattr(self, 'diagnosis_completed', False):
            return self._generate_final_diagnosis()
        
        if getattr(self, 'last_question', "") == "FINAL_REPORT":
            return self._generate_final_diagnosis()

        # Rest of the existing validation
        if self.expecting_free_text:
            normalized_input = user_input.strip()
        else:
            if not self._validate_input(user_input):
                return f"Please select a number between 1-{len(self.current_options)}:\n{self._format_options(self.current_options)}"
            normalized_input = self._normalize_input(user_input)


        self.patient_data["conversation_log"].append({
            "stage": self.current_stage,
            "user_response": normalized_input,
            "timestamp": time.time()
        })

        # Route handling
        if self.current_stage == "main_symptom":
            return self._handle_main_symptom(normalized_input)
        elif self.current_stage == "symptom_details":
            return self._handle_symptom_details(normalized_input)
        elif self.current_stage == "additional_symptoms":
            return self._handle_additional_symptoms(normalized_input)
        elif self.current_stage == "diagnosis_complete":  # Add this condition
            return self._generate_final_diagnosis()
        else:
            return "Something went wrong. Restarting..."

    def _handle_main_symptom(self, user_input: str) -> str:
        # Empty input check
        if not user_input:
            return "Please describe your main symptom (e.g., 'headache')."

        # Symptom understanding check BEFORE processing further
        try:
            if not self.is_symptom_understood(user_input):
                return "Sorry, I didn’t understand that. Can you describe your main symptom more clearly?"
        except ConnectionError:
            return "Sorry, the service is currently unavailable. Please try again in a moment."

        # Normalization after validation
        normalized_symptom = self._normalize_symptom_via_prompt(user_input)
        self.current_symptom_context = {
            "symptom": normalized_symptom,
            "details": {},
            "dimensions_covered": set(),
            "timestamp": time.time()
        }

        self.patient_data["symptoms"].append(self.current_symptom_context)
        self.expecting_free_text = False
        self.current_stage = "symptom_details"

        return self._get_next_symptom_question()

    
    def is_symptom_understood(self, symptom: str) -> bool:
        prompt = f"""
    Is this a valid and understandable human symptom or health complaint? 
    Reply only "YES" or "NO".

    Symptom: {symptom}
    """
        response = self.call_gemini(prompt)
        if response in ["QUOTA_EXCEEDED", "TRAFFIC_BUSY", "ERROR"]:
            raise ConnectionError("Gemini service is currently unavailable.")
        return "YES" in response.strip().upper()

    def _handle_symptom_details(self, user_input: str) -> str:
        symptom = self.patient_data["symptoms"][-1]
        symptom["details"][self.last_question] = user_input
        symptom["dimensions_covered"].add(self.last_question.lower())

        next_question = self._get_next_symptom_question()

        # After 4 questions or no more new questions, ask if other symptoms
        if not next_question or len(symptom["details"]) >= 4:
            self.current_stage = "additional_symptoms"
            self.current_options = ["Yes", "No"]
            return "Any other symptoms? 1) Yes 2) No"

        return next_question

    def _build_symptom_context(self, symptom_data, covered_questions) -> str:
        context_lines = [
            f"**Symptom Analysis: {symptom_data['symptom']}**",
            "Collected Details:",
        ]

        for q, a in symptom_data["details"].items():
            context_lines.append(f"- {q}: {a}")

        context_lines.append("\n**Patient Background**")
        for key, value in self.patient_data["basic_info"].items():
            context_lines.append(f"- {key.replace('_', ' ').title()}: {value}")

        context_lines.append("\n**Diagnostic Progress**")
        context_lines.append(f"- Current stage: {self.current_stage}")
        if covered_questions:
            context_lines.append(f"- Already asked about: {', '.join(covered_questions)}")

        return "\n".join(context_lines)

    def _get_symptom_prompt(self, symptom: str, context: str) -> str:
        return SYSTEM_PROMPT.replace("{symptom}", symptom).replace("{context}", context)

    def _split_options_by_numbered_list(self, options_text: str) -> list:
        if not options_text:
            return []

        # Split by comma, newline, or semicolon (covers most formats)
        raw_opts = re.split(r'[\n,;]+', options_text.strip())

        filtered = []
        seen = set()

        for opt in raw_opts:
            opt = opt.strip()
            if not opt:
                continue

            # Remove numbering like "1)", "2.", etc.
            opt = re.sub(r'^\d+[\.\)]\s*', '', opt)

            low_opt = opt.lower()

            # Skip vague or banned words
            if any(bad_word in low_opt for bad_word in ["yes", "no", "maybe", "sometimes", "option"]):
                continue

            # Skip duplicates
            if low_opt in seen:
                continue

            filtered.append(opt)
            seen.add(low_opt)

        # Only add "Don't Know" if at least 2 valid options exist
        if len(filtered) >= 2:
            filtered.append("Don't Know")

        # Return max 6
        return filtered[:6]





    def _get_next_symptom_question(self) -> str:
        try:
            symptom_data = self.patient_data["symptoms"][-1]
            covered = list(symptom_data["details"].keys())
            context = self._build_symptom_context(symptom_data, covered)

            response = self.call_gemini(self._get_symptom_prompt(symptom_data["symptom"], context))

            if response in ["QUOTA_EXCEEDED", "TRAFFIC_BUSY", "ERROR"]:
                raise ConnectionError("API service unavailable")

            # Extract question
            question = "About your symptom"  # fallback
            if "QUESTION:" in response:
                question = response.split("QUESTION:")[1].split("\n")[0].strip().rstrip("?")
            elif "\n" in response:
                question = response.split("\n")[0].strip().rstrip("?")

            # Extract options text
            options_text = ""
            if "OPTIONS:" in response:
                options_text = response.split("OPTIONS:")[1].strip()
            else:
                # fallback: last line or comma separated
                lines = response.strip().split("\n")
                options_text = lines[-1] if len(lines) > 1 else response

            options = self._split_options_by_numbered_list(options_text)

            # Ensure minimum options guaranteed by _split_options_by_numbered_list

            # Store question and options for validation and next steps
            self.last_question = question
            self.current_options = options

            # Format output as single column list (for simplicity & clarity)
            formatted_options = "\n".join(f"{i+1}) {opt}" for i, opt in enumerate(options))

            return f"{question}?\n{formatted_options}"

        except Exception as e:
            logging.error(f"Question generation failed: {str(e)}")
            self.last_question = "About your symptom"
            self.current_options = ["Describe in your words", "Option 2", "Don't Know"]
            return "Sorry, we are not able to process your request at this time."


    def _handle_additional_symptoms(self, user_input: str) -> str:
        normalized_input = user_input.strip().lower()
        
        if normalized_input in ["1", "yes", "y"]:
            self.current_stage = "main_symptom"
            self.current_options = []
            self.expecting_free_text = True
            return "Please describe your next symptom."
        elif normalized_input in ["2", "no", "n"]:
            self.current_stage = "diagnosis_complete"
            self.diagnosis_completed = True
            self.current_options = []
            self.expecting_free_text = False
            return self._generate_final_diagnosis()
        else:
            return "Please select:\n1) Yes\n2) No"
    
    def _generate_final_diagnosis(self) -> str:
        # Create a clean model instance without the symptom-focused system prompt
        clean_model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        # Build symptom summary
        symptom_details = []
        for s in self.patient_data["symptoms"]:
            details = [f"- {q}: {a}" for q, a in s['details'].items()]
            symptom_details.append(f"✦ {s['symptom'].title()}\n" + "\n".join(details))
        
        # Fix: prepare this outside the f-string
        symptom_block = "\n\n".join(symptom_details)

        # Build prompt
        prompt = f"""
Patient Risk Factors:
Smoker = {self.patient_data["basic_info"]["smoker"]}, 
Diabetes = {self.patient_data["basic_info"]["diabetes"]}, 
High BP = {self.patient_data["basic_info"]["high_blood_pressure"]}

Symptoms:
{symptom_block if symptom_block else "No symptom details provided."}

1. Three most likely conditions:
- For each condition:
    • Name + confidence percentage (e.g., 65%) Example format: Migrane (80%)
    • 2 full lines in simple, everyday language
    • No medical jargon or technical terms
    • Do not use short or one-line explanations

2. Recommended next steps:
- Clearly state whether it's an emergency
- Give specific, actionable advice (e.g., “See a doctor today”, “Go to hospital now”)
- Use clear, direct language

3. Red flags to watch for:
- 5 points in bulletin list only urgent danger signs that need immediate help 
- Use simple phrases (e.g., "trouble breathing", "very high fever")

FORMAT RULES:
- End immediately after the red flags — do not add any text after that
- No greetings, disclaimers, notes, or extra messages
- Use paragraph breaks only (no bullets in explanations)
- No bold, asterisks, or decorative formatting

REPETITION GUARD (STRICT):
- Before finalizing, scan all parts for repeated ideas
- If the same concept appears more than once (even reworded), keep only the clearest version
- Delete all duplicate/rephrased content — do NOT say the same thing twice
- Do NOT repeat any full paragraphs or sentences; your output must be concise and free of loops.
"""



        try:
            response = clean_model.generate_content(prompt)
            diagnosis = response.text.strip()
        except Exception as e:
            diagnosis = f"Error generating diagnosis: {str(e)}"
        
        # Clear all state to prevent further questions
        self.current_options = []
        self.diagnosis_completed = True

        return (
            "MEDICAL ASSESSMENT REPORT\n"
            f"{diagnosis}\n\n"
        )  # like now the code is running well but that error should be handled man