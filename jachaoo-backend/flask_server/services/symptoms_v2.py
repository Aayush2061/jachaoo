import time
import re
import google.generativeai as genai
import logging 
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("FINAL_API_KEY") 
genai.configure(api_key=API_KEY)

# Your Original Full System Instruction (UNCHANGED)
# ----------------------------
class MedicalDiagnosisSystem:
    def __init__(self, sex: str, age: str, weight: str, diabetes: str, blood_pressure: str, 
                 illnesses: list, other_illness: str, smoker: str):
        self.patient_data = {
            "basic_info": {
                "sex": sex,
                "age": age, 
                "weight": weight,
                "diabetes": diabetes,
                "high_blood_pressure": blood_pressure,
                "illnesses": illnesses,
                "other_illness": other_illness,
                "smoker": smoker
            },
            "symptoms": [],
            "conversation_log": []
        }
        SYSTEM_PROMPT = '''
### MEDICAL INTERVIEW SYSTEM – HIGH-STAKES MODE ###

PATIENT BACKGROUND:
- Age: {age}
- Sex: {sex}
- Weight: {weight} kg
- Smoker: {smoker}
- Diabetes: {diabetes}
- High Blood Pressure: {blood_pressure}
- Existing Illnesses: {illnesses}
- Other Conditions: {other_illness}

ROLE:
You are an expert AI clinician. Investigate this patient-reported symptom.

OBJECTIVE:
Generate one — and only one — next best question to extract missing clinical information. Use very simple language.

RULES:
1) Ask exactly ONE focused, decision-relevant question (short, plain words).
2) Do NOT ask about any dimension already covered in context.
3) Choose one new dimension only (see list below).
4) Must include 4-5 options that are DESCRIPTIVE and SPECIFIC to the symptom (e.g., if asking location, list specific body parts; if pain type, list specific sensations like "throbbing", "stabbing") according to the question.
5) NEVER use generic "Yes/No/Nothing/Not sure" or vague scales unless checking for the simple presence of a symptom.
6) Use no medical jargon (e.g., use "back", "pain goes to the leg", "burning").
7) If a red-flag is suspected, dimension = "redflag" and options should surface urgency.
8) Keep the question ≤12 words and options short but complete.
9) Striclty avoid the rating scale questions.
10) For "both" option: Only include if it makes clear medical sense. Patient must understand exactly what "both" refers to (e.g., "both ears", "both sides"). Never include "both" if it could confuse the patient about what is being asked.If both included then it should clarify what both means in same option.
11) Avoid medical jargon and do not use any complex anatomical names, so non-medical person can understand.

DIMENSIONS TO CONSIDER (choose most clinically useful missing dimension):
- Onset & Duration (when it started, how long it's lasted)
- Location (where exactly it occurs)
- Radiation (does it spread anywhere)
- If the symptom may be caused or influenced by any external or past event, the FIRST follow-up question must ALWAYS be a single, comprehensive “trigger-identification” question. This single question must cover ALL common real-world triggers in one shot (e.g., food/drink, physical activity, sudden movement, injury/accident, emotional stress, new medicine, exposure, or ‘nothing happened’). After this one trigger question is asked once, the model must NEVER ask any further trigger-related questions for the same symptom.
- Character (type or nature of the feeling/pain)
- Severity (mild, moderate, severe, none, don't know)
- Timing & Pattern (when it happens or if it comes and goes)
- Progression / Trend (getting better, worse, or same)
- Trigger / Precipitating Event (what starts or worsens it)
- Functional Impact (affecting work, walking, sleep, breathing)
- Associated Symptoms (fever, nausea, swelling, etc.)
- Previous Episodes / Recurrence (has it happened before)
- Context (injury, infection, travel, menstruation, etc.)
- Medication / Substance Use (any new drugs, alcohol, smoking)
- Psychological / Stress Factors (stress, mood, anxiety links)
- Red Flags (weight loss, weakness, dizziness, loss of bladder control)

REPETITION SAFEGUARD (ALL DIMENSIONS):
- Do not repeat or rephrase any previously asked question; never ask more than one question targeting the same information or dimension for a symptom.

EXACT OUTPUT FORMAT(strict):
QUESTION: [Insert best possible question here]
OPTIONS: [Option 1], [Option 2], [Option 3], [Option 4], ..., Don't Know

Only return the question and its options in the correct format. Nothing else.
'''

#NAME CHANGE GARE HAI
        SYSTEM_PROMPT=SYSTEM_PROMPT.format(
            age=age,
            sex=sex,
            weight=weight,
            smoker=smoker,
            diabetes=diabetes,
            blood_pressure=blood_pressure,
            illnesses=", ".join(illnesses),
            other_illness=other_illness
        )

        self.model = genai.GenerativeModel(
    model_name="gemini-2.0-flash" ,
    system_instruction=SYSTEM_PROMPT
)

        self.current_stage = "main_symptom" 
        self.last_question = ""
        self.current_options = []
        self.current_symptom_context = {}
        self.expecting_free_text = True
        self.diagnosis_completed = False

    # Call Gemini with just symptom/context prompt
    def call_gemini(self, prompt_text: str) -> str:
        try:
            response = self.model.generate_content([{"role": "user", "parts": [prompt_text]}])
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
        
        # 🔥 ONLY red flag stage allows comma-separated
        if self.current_stage == "red_flag_check":
            # Allow "3" or "3,4" or "3,4,5"
            parts = [p for p in user_input.replace(" ", "").split(",") if p]
            for part in parts:
                if not part.isdigit() or not (1 <= int(part) <= len(self.current_options)):
                    return False
            return len(parts) > 0  # Must have at least one selection
        
        # Normal questions - single digit only
        return user_input.isdigit() and 1 <= int(user_input) <= len(self.current_options)
    
    def _normalize_input(self, user_input: str) -> str:
        if not self.current_options:
            return user_input.strip()
        
        # 🔥 Multi-select only for red flags - FIXED
        if self.current_stage == "red_flag_check":
            return user_input.strip()  # Just pass through raw input
        
        # Single select for everything else
        if user_input.isdigit() and 1 <= int(user_input) <= len(self.current_options):
            return self.current_options[int(user_input)-1]
        
        return user_input.strip()  # Return original instead of empty

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
        # Store with question and options
        log_entry = {
            "stage": self.current_stage,
            "user_response": normalized_input,
            "timestamp": time.time()
        }
        
        # Add question and options if available
        if self.current_stage == "symptom_details" and self.last_question:
            log_entry["question"] = self.last_question
            log_entry["options"] = self.current_options.copy()
            log_entry["selected_text"] = normalized_input
        
        self.patient_data["conversation_log"].append(log_entry)

        # Route handling
                # Route handling
        if self.current_stage == "main_symptom":
            return self._handle_main_symptom(normalized_input)
        elif self.current_stage == "symptom_details":
            return self._handle_symptom_details(normalized_input)
        elif self.current_stage == "additional_symptoms":
            return self._handle_additional_symptoms(normalized_input)
        elif self.current_stage == "red_flag_check":  # 🔥 ADD THIS LINE
            return self._handle_red_flags(normalized_input)
        elif self.current_stage == "diagnosis_complete":
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
        
        # Get the last conversation log to find the selected text
        last_log = self.patient_data["conversation_log"][-1] if self.patient_data["conversation_log"] else {}
        selected_text = last_log.get("selected_text", user_input)
        
        # Store the answer
        symptom["details"][self.last_question] = selected_text  # ✅ USE selected_text
        symptom["dimensions_covered"].add(self.last_question.lower())
        next_question = self._get_next_symptom_question()

        # After 4 questions or no more new questions, ask if other symptoms
        if not next_question or len(symptom["details"]) >= 4:
            self.current_stage = "additional_symptoms"
            self.current_options = ["Yes", "No"]
            return "Any other symptoms? "

        return next_question
    
###################################################################
# yo thau ma change gariyo yo function hai 

    def _build_symptom_context(self, symptom_data: dict, covered_questions: list) -> str:
        """Enhanced context builder with cross-symptom awareness"""
        
        # Get conversation logs for this symptom
        symptom_start_time = symptom_data.get("timestamp", 0)
        symptom_logs = [
            log for log in self.patient_data["conversation_log"]
            if log.get("timestamp", 0) >= symptom_start_time 
            and log.get("stage") == "symptom_details"
        ]
        
        # 1. Current Symptom Details WITH OPTIONS
        current_details = []
        for log in symptom_logs:
            q = log.get("question", "Unknown question")
            a = log.get("selected_text", log.get("user_response", "Unknown answer"))
            options = log.get("options", [])
            
            if options:
                options_str = ", ".join(options)
                
                # Check if answer is "Don't Know" or similar
                a_lower = a.lower()
                if "don't know" in a_lower or "dont know" in a_lower or "not sure" in a_lower:
                    detail = f"- {q}:  Not sure (selected from [{options_str}])"
                else:
                    detail = f"- {q}: {a} from [{options_str}]"
            else:
                # Check if free text answer indicates uncertainty
                a_lower = a.lower() if isinstance(a, str) else ""
                if any(phrase in a_lower for phrase in ["don't know", "dont know", "not sure", "unsure", "not certain"]):
                    detail = f"- {q}:  Not sure"
                else:
                    detail = f"- {q}: {a}"
            
            current_details.append(detail)
        
        # 2. Previous Symptoms Context (unchanged)
        previous_symptoms = []
        for idx, s in enumerate(self.patient_data.get('symptoms', [])[:-1]):
            symptom_entry = [
                f"Previously reported: {s.get('symptom', 'Unknown symptom')}",
                *[f"  - {q}: {a}" for q, a in s.get('details', {}).items()]
            ]
            previous_symptoms.extend(symptom_entry)
        
        # 3. Dynamic Patient Background (unchanged)
        background = [
            f"- {field.replace('_', ' ').title()}: {value}"
            for field, value in self.patient_data.get('basic_info', {}).items()
        ]
        
        # 4. Temporal Relationships (unchanged)
        temporal_notes = []
        if len(self.patient_data.get('symptoms', [])) > 1:
            symptom_chain = " → ".join(
                s.get('symptom', 'Unknown') 
                for s in self.patient_data['symptoms']
            )
            temporal_notes.append(f"Timeline: {symptom_chain}")

        # Structured Assembly
        sections = ["**Full Clinical Context**",
                    "CURRENT SYMPTOM:",
                    f"✦ {symptom_data.get('symptom', '')}"] + \
                    current_details + \
                    [""] + \
                    ["PRIOR SYMPTOMS:"] + \
                    (previous_symptoms if previous_symptoms else ["No prior symptoms"]) + \
                    [""] + \
                    ["PATIENT BACKGROUND:"] + \
                    background + \
                    [""] + \
                    temporal_notes
        
        return "\n".join(filter(None, sections))

    def _get_symptom_prompt(self, symptom: str, context: str) -> str:
        symptom_data = self.patient_data["symptoms"][-1]
        covered_dims = ", ".join(symptom_data['dimensions_covered']) if symptom_data['dimensions_covered'] else "None"
# Here the system_prompt which was meant to be the system instruction is being passed every time okay man         
        return f"""
            Symptom to investigate: {symptom}
            Current context gathered:{context}
            Covered Dimensions : {covered_dims}
            
            """
    # so 
    def _split_options_by_numbered_list(self, options_text: str) -> list:
        if not options_text:
            return []

        # 1. SPLIT STRICTLY BY NEWLINES FIRST (Safe way)
        candidates = options_text.strip().split('\n')

        # 2. Fallback: If AI put everything on one line (rare), then split by comma
        if len(candidates) == 1 and ',' in candidates[0]:
            candidates = candidates[0].split(',')

        filtered = []
        seen = set()

        for line in candidates:
            line = line.strip()
            if not line:
                continue

            # 3. Clean leading bullets/numbers (Your Regex was good, I kept it)
            # Removes: "1.", "1)", "a)", "-", "*"
            clean_opt = re.sub(r'^\s*(\d+[\.\)]|[A-Za-z][\.\)]|[-*])\s*', '', line).strip()
            
            if not clean_opt:
                continue

            low_opt = clean_opt.lower()

            # Remove junk headers
            if "option" in low_opt and len(clean_opt) < 12:
                continue

            # Remove forbidden single words
            if low_opt in ["yes", "no", "maybe", "sometimes", "don't know"]:
                continue

            if low_opt not in seen:
                filtered.append(clean_opt)
                seen.add(low_opt)

        # 4. Final Safety Check
        if not filtered:
            return []

        # 5. Always add "Don't Know" at the end manually
        filtered.append("Don't Know")
# originally yo xa but check hani raxu hai filtered[:6]
        return filtered

# little change in this function 

    def _get_next_symptom_question(self) -> str:
        symptom_data = self.patient_data["symptoms"][-1]

        # STOP regeneration if 4 questions already asked
        if len(symptom_data["details"]) >= 4:
            self.last_question = "Any other symptoms"
            self.current_options = ["Yes", "No"]
            return "Any other symptoms? 1) Yes 2) No"

#Evaluator ho kei ni hoina aru ta yo
        def evaluate_question_quality(question_block: str, symptom_context: str):
            """Use Gemini to self-critique the generated question."""
            eval_prompt = f"""
    You are an expert medical question evaluator.

    Evaluate the following question and options against these criteria:
    1. Understand symptom properly.
    2. Question must be relevant to the symptom: {symptom_context}
    3. No poor question which isnot useful for diagnosis and no vague and ambiguous options.
    4. Best of best question inorder to provide best diagnosis.
    5. Check the options criteria and make sure they are mutually exclusive and collectively exhaustive , atleast 2 generated options.
    6. Be very strict in scoring.
    Return a JSON strictly like this:
    {{
    "score": <float between 0 and 1>
    }}

    Question block:
    {question_block}
    """
            try:
                review = self.call_gemini(eval_prompt)
                match = re.search(r"\{.*\}", review, re.DOTALL)
                if match:
                    data = json.loads(match.group())
                    return float(data.get("score", 0)), data.get("reason", "")
                return 0, "Invalid JSON returned"
            except Exception as e:
                return 0, f"Evaluation failed: {e}"

        try:
            symptom_data = self.patient_data["symptoms"][-1]
            covered = list(symptom_data["details"].keys())
            context = self._build_symptom_context(symptom_data, covered)

            # Retry loop for regeneration until quality score ≥ 0.8
            best_question = None
            best_options = None
            best_score = -1
            best_attempt = 0

            for attempt in range(4):
                response = self.call_gemini(self._get_symptom_prompt(symptom_data["symptom"], context))
                if response in ["QUOTA_EXCEEDED", "TRAFFIC_BUSY", "ERROR"]:
                    raise ConnectionError("API service unavailable")

                # --- Extract question text ---
                question = "About your symptom"
                if "QUESTION:" in response:
                    question = response.split("QUESTION:")[1].split("\n")[0].strip().rstrip("?")
                elif "\n" in response:
                    question = response.split("\n")[0].strip().rstrip("?")

                # --- Extract options ---
                options_text = ""
                if "OPTIONS:" in response:
                    options_text = response.split("OPTIONS:")[1].strip()
                else:
                    lines = response.strip().split("\n")
                    options_text = lines[-1] if len(lines) > 1 else response

                options = self._split_options_by_numbered_list(options_text)
                formatted_block = f"QUESTION: {question}\nOPTIONS: {', '.join(options)}"

                # --- Evaluate quality ---
                score, reason = evaluate_question_quality(formatted_block, symptom_data["symptom"])
                #print(f"[Quality Check] Attempt {attempt+1}: Score={score} | Reason={reason}")

                # Save best attempt (tie → earlier attempt wins)
                if score > best_score:
                    best_score = score
                    best_question = question
                    best_options = options
                    best_attempt = attempt

                if score >= 0.8:
                    self.last_question = question
                    self.current_options = options
                    formatted_options = "\n".join(f"{i+1}) {opt}" for i, opt in enumerate(options))
                    return f"{question}?\n{formatted_options}"

            # If none reached 0.8 → use BEST QUESTION
            if best_question:
                #print(f"⚠️ Using best attempt #{best_attempt+1} with score={best_score}")
                self.last_question = best_question
                self.current_options = best_options
                formatted_options = "\n".join(f"{i+1}) {opt}" for i, opt in enumerate(best_options))
                return f"{best_question}?\n{formatted_options}"

            # If something went horribly wrong
            return "Sorry, we are not able to process your request at this time."

        except Exception as e:
            logging.error(f"Question generation failed: {str(e)}")
            return "Sorry, we are not able to process your request at this time."

    

    def _handle_additional_symptoms(self, user_input: str) -> str:
        normalized_input = user_input.strip().lower()
        
        if normalized_input in ["1", "yes", "y"]:
            self.current_stage = "main_symptom"
            self.current_options = []
            self.expecting_free_text = True
            return "Please describe your next symptom."
        
        elif normalized_input in ["2", "no", "n"]:
            # Try to get red flags
            red_flag_options = self._get_red_flag_options()
            
            # DOUBLE-CHECK FAILURE MECHANISM
            failed = False
            
            # Check 1: Count-based (if ≤ 2 options, definitely failed)
            if len(red_flag_options) <= 2:
                failed = True
            
            # Check 2: Content-based (if any option contains "ERROR")
            else:
                for option in red_flag_options:
                    if "ERROR" in option.upper():
                        failed = True
                        break
            
            # If failed, skip to diagnosis
            if failed:
                self.current_stage = "diagnosis_complete"
                self.diagnosis_completed = True
                return self._generate_final_diagnosis()
            
            # Otherwise proceed with red flag question (≥ 3 options, no "ERROR")
            self.current_stage = "red_flag_check"
            self.expecting_free_text = False
            self.last_question = "Are you experiencing any of these additional warning signs?"
            self.current_options = red_flag_options
            
            options_text = "\n".join(f"{i+1}) {opt}" for i, opt in enumerate(self.current_options))
            return f"{self.last_question}\n(Select aLL that apply.)\n\n{options_text}"
        
        else:
            return "Please select:\n1) Yes\n2) No"
        
    
    def _get_red_flag_options(self) -> list:
        """Get 5 red flag options from Gemini"""
        symptoms = ", ".join([s['symptom'] for s in self.patient_data['symptoms']])
        
        # Create a clean model WITHOUT the question-generation system instruction
        red_flag_model = genai.GenerativeModel(
            model_name="gemini-2.0-flash"
            # NO system_instruction here!
        )
        
        prompt = f"""
    PATIENT SYMPTOMS: {symptoms}

    You are a medical expert. List 5 SPECIFIC danger signs (red flags) relevant to these symptoms.
    These should be SERIOUS symptoms that need immediate medical attention.

    CRITICAL INSTRUCTIONS:
    1. Return ONLY a comma-separated list of 5 items
    2. Do NOT include "QUESTION:", "OPTIONS:", or any other headers
    3. Do NOT include line breaks or bullet points
    4. Only return the 5 comma-separated items
    5. Each item should be a SYMPTOM, not a question
    6. Do NOT ask questions, just list symptoms
    7. Use simple language, no jargon

    BAD EXAMPLE: "Does your headache cause new problems with seeing, moving, speaking, or thinking?"
    GOOD EXAMPLE: "Vision changes, Weakness or numbness, Speech difficulty, Confusion, Severe dizziness"

    Example format: "Severe chest pain spreading to arm, Difficulty breathing, Fainting, Confusion, High fever"

    Your 5 red flags (comma-separated):
    """
        
        try:
            # Use the clean model instead of self.call_gemini()
            response = red_flag_model.generate_content([{"role": "user", "parts": [prompt]}])
            response_text = response.text.strip()
        except Exception as e:
            msg = str(e).lower()
            if "quota" in msg:
                return ["ERROR", "None of these"]
            if "rate limit" in msg or "traffic" in msg or "busy" in msg:
                return ["ERROR", "None of these"]
            return ["ERROR", "None of these"]
        
        # Debug: Print what Gemini returned
       # print(f"Gemini red flag response: {response_text}")
        
        # Clean up the response
        response_text = response_text.replace("QUESTION:", "").replace("OPTIONS:", "")
        response_text = response_text.replace("\n", " ").strip()
        
        # Split by comma, but be smart about it
        options = []
        current_option = ""
        
        # Simple split by comma, but handle edge cases
        parts = response_text.split(",")
        for part in parts:
            part = part.strip()
            if part:
                # Remove any question marks or question-like phrases
                if part.endswith("?"):
                    part = part[:-1].strip()
                
                # Check if it looks like a question (starts with "Does", "Is", "Are", etc.)
                question_words = ["does ", "is ", "are ", "do ", "have ", "has ", "can "]
                if any(part.lower().startswith(word) for word in question_words):
                    # Convert question to symptom statement
                    # Example: "Does your headache cause vision changes" -> "Vision changes"
                    # Simple fix: take the last few words
                    words = part.split()
                    if len(words) > 2:
                        part = " ".join(words[-2:]).strip().capitalize()
                
                # Remove any remaining question phrases
                part = part.replace("your ", "").replace("you ", "").replace("a ", "")
                
                if part and len(part) > 3:  # At least 3 characters
                    options.append(part)
        
        # Take first 5 valid options
        options = options[:5]
        
        # If we got valid options, add "None of these"
        if options and len(options) >= 3:  # At least 3 real red flags
            options.append("None of these")
            return options
        else:
            # If less than 3 options or empty, it's a failure
            return ["ERROR", "None of these"]
    
    def _handle_red_flags(self, user_input: str) -> str:
        """Handle comma-separated selections like '1,3,5'"""
        selected = []
        for num in user_input.replace(" ", "").split(","):
            if num.isdigit():
                idx = int(num)
                if 1 <= idx <= len(self.current_options):
                    selected.append(self.current_options[idx-1])
        
        # Store
        self.patient_data["red_flags"] = {
            "selected": selected if selected else ["None"],
            "options": self.current_options
        }
    #_________________________________________________________________________________________________________
    #Recently addedd part just to check man 
        # print(f"DEBUG - Stored red flags: {self.patient_data['red_flags']}")

        # Generate diagnosis
        self.current_stage = "diagnosis_complete"
        self.diagnosis_completed = True
        return self._generate_final_diagnosis()
    
    def _generate_final_diagnosis(self) -> str:
        # Create a clean model instance without the symptom-focused system prompt
        clean_model = genai.GenerativeModel(model_name="gemini-2.0-flash")
        
        # Build symptom summary
        symptom_details = []
        for s in self.patient_data["symptoms"]:
            details = [f"- {q}: {a}" for q, a in s['details'].items()]
            symptom_details.append(f"✦ {s['symptom'].title()}\n" + "\n".join(details))
        
        # Fix: prepare this outside the f-string
        symptom_block = "\n\n".join(symptom_details)
        # Build red flag summary
        red_flag_info = ""
        if "red_flags" in self.patient_data:
            rf = self.patient_data["red_flags"]
            if rf["selected"] and rf["selected"][0] != "None":
                selected_text = ", ".join(rf["selected"])
                red_flag_info = f"""
RED FLAGS REPORTED BY PATIENT:
- {selected_text.replace(', ', '\n- ')}
"""
#Print Red flag info for debug
        #print(red_flag_info)

        # Build prompt
        prompt = f"""
Patient Risk Factors:
- Age: {self.patient_data["basic_info"]["age"]}
- Sex: {self.patient_data["basic_info"]["sex"]} 
- Weight: {self.patient_data["basic_info"]["weight"]} kg
- Smoker: {self.patient_data["basic_info"]["smoker"]}
- Diabetes: {self.patient_data["basic_info"]["diabetes"]}
- High Blood Pressure: {self.patient_data["basic_info"]["high_blood_pressure"]}
- Existing Illnesses: {', '.join(self.patient_data["basic_info"]["illnesses"])}
- Other Conditions: {self.patient_data["basic_info"]["other_illness"]}
Symptoms:
{symptom_block if symptom_block else "No symptom details provided."}

RED FLAGS REPORTED:{red_flag_info} 

Analyze collected data deeply and try to buil strong relation,cause this is high stake medical diagnosis and give recommendations.

1. Three most likely conditions:
- For each condition:
    - Name + probability (%), Ex: Migrane (70%)
    - Give one lines in plain language, no jargon
    - Do not use one-line explanations
    - Adding all probability should be one.
    - Use - for each condition.
    - ONLY THREE CONDITIONS TOTAL
    

2. Recommended next steps:
- Do not say “this is not an emergency.” Use cautious, balanced language in 2 lines.
- If symptoms could be serious, advise prompt evaluation (“see a doctor today” or “seek urgent care if it worsens”).
- If symptoms seem mild, give safe steps but avoid definitive reassurance.    


3. Red flags to watch for:
- Provide 4 urgent danger signs only (simple phrases, e.g., "trouble breathing") must be different from those RED FLAGS already reported.
- Use - for each red flags.

FORMAT RULES:
- End immediately after  red flags — add no extra text
- No greetings, disclaimers or notes
- Use paragraph breaks only (no bullets in explanations)
- No bold, asterisks, or decorative formatting

REPETITION GUARD (STRICT):
- Remove duplicate or reworded ideas; keep only the clearest version
- Do NOT repeat full paragraphs or sentences; output must be concise and non-redundant.


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
        )  