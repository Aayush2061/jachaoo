# -------- Menstrual_cycle_chat.py --------
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Gemini API setup
API_KEY = os.getenv("FINAL_API_KEY") 
genai.configure(api_key=API_KEY)

def get_menstrual_model(system_instruction):
    return genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=system_instruction
    )


def build_system_prompt(duration_of_period, cycle_length, previous_conditions, trying_to_conceive, on_hormonal_contraceptive, first_day_of_last_period,current_cycle_phase):
    print(duration_of_period, cycle_length, previous_conditions, trying_to_conceive, on_hormonal_contraceptive, first_day_of_last_period,current_cycle_phase)
    #phase = detect_cycle_phase(first_day_of_last_period, int(cycle_length), int(duration_of_period))
    if isinstance(previous_conditions, (list, tuple)):
        known_conditions = ", ".join(previous_conditions) if previous_conditions else "None"
    else:
        known_conditions = previous_conditions if previous_conditions else "None"

    return f"""
# 1. CORE IDENTITY
- Role: A warm, supportive friend for menstrual health.
- Tone: Casual, empathetic, and personal 💗. Never clinical or robotic.
- Language: Understands English & Roman Nepali. **Must reply in simple English.**

# 2. OUTPUT RULES (MANDATORY)
- **NEVER exceed 3 short sentences.**
- Each sentence should be simple (max ~10 words).
- Give helpful suggestions or response .
- Start replies naturally; never sound robotic.

# 3. CONVERSATION FLOW
- First Message: If user sends a symptom, skip greeting and help immediately. Otherwise, Respond wisely.
- Follow-ups: Use gentle, non-pushy invites.
- Repetition: Never repeat advice or sympathy.
- Emotional: If user shares feelings, just reflect and validate.

# 4. HOW TO HELP (THE LOGIC)
- Symptoms (Pain, Mood, Sleep): Acknowledge with empathy. Give 1-2 simple, practical tips.
- Food Tips: Suggest simple, comforting, varied Nepali-local foods(in simple english) . Do not repeat the same food examples.
- Features: Gently mention the 'Sleep Feature' or 'Cycle Guide' features in app if relevant, but don't push.
- Severe Symptoms: If it sounds bad, gently suggest: "If it gets worse, it's always okay to check with a doctor."

# 5. CRITICAL MEDICAL LOGIC
- Bleeding: **Check the {current_cycle_phase} variable.** If bleeding is reported *outside* the menstrual phase, be cautious. Suggest possibilities (e.g., ovulation spotting, hormonal changes) and gently suggest seeing a doctor.
- Personalization: Acknowledge {known_conditions} (like PCOS) or {on_hormonal_contraceptive} and adapt advice. 

# 6. BOUNDARIES (DO NOT DO)
- Do NOT give long lists, links, or external resources.
- Do NOT discuss tech, AI, or your creators. Reply: "I'm just here to help with menstrual health 💗."
- Do Not discuss unrelevant topics (politics, sports, etc.).
- Do NOT discuss sex unless the user does; keep it safe and respectful.

# 7. USER DATA (Use this for context)
- Period Duration: {duration_of_period} days
- Cycle Length: {cycle_length} days
- Known Conditions: {known_conditions}
- Trying to Conceive: {"Yes" if trying_to_conceive else "No"}
- On Hormonal Contraceciples: {"Yes" if on_hormonal_contraceptive else "No"}
- First Day of Last Period: {first_day_of_last_period}
- Current Phase: {current_cycle_phase}
"""

def build_summary_context(chat_history, user_query):
    summary = []
    if len(chat_history) >= 4:
        summary = chat_history[:-2]
    elif len(chat_history) == 3:
        summary = chat_history[:1]

    # Get the last full user+model exchange
    last_user_model = chat_history[-2:] if len(chat_history) >= 2 else []

    # Combine for prompt context
    new_history = summary + last_user_model
    return new_history
# REMOVE the global _chat_session variable!
# _chat_session = None  ← DELETE THIS LINE

def menstrual_chatbot(user_query: str,
                      chat_history: list,
                      duration_of_period: str,
                      cycle_length: str,
                      previous_conditions: str,
                      trying_to_conceive: bool,
                      on_hormonal_contraceptive: bool,
                      first_day_of_last_period: str,
                      current_cycle_phase:str) -> str:

    if not user_query.strip():
        return "Could you tell me a bit more so I can help better? 💗"

    # STEP 1: Build system instruction for THIS user
    system_instruction = build_system_prompt(duration_of_period, cycle_length, previous_conditions,
                                             trying_to_conceive, on_hormonal_contraceptive, first_day_of_last_period, current_cycle_phase)
    model = get_menstrual_model(system_instruction)

    # STEP 2: STRATEGY - Use summary after 3 exchanges, else normal history
    if len(chat_history) >= 6:  # 3+ exchanges (6 messages = 3 user + 3 assistant)
        # Generate summary of entire conversation
        summary = generate_conversation_summary(chat_history)
        
        # Prepare context: Summary + current query
        context = f"Previous conversation summary: {summary}\n\nCurrent question: {user_query}"
        
        # Send only summary + current query (no conversation history)
        gemini_history = []
        final_query = context
    else:
        # For first 3 exchanges, use normal limited history
        MAX_EXCHANGES = 3
        max_messages = MAX_EXCHANGES * 2
        
        if len(chat_history) > max_messages:
            limited_history = chat_history[-max_messages:]
        else:
            limited_history = chat_history

        # Convert history to Gemini format
        gemini_history = []
        for msg in limited_history:
            if msg["role"] == "user":
                gemini_history.append({"role": "user", "parts": [{"text": msg["parts"][0]["text"]}]})
            elif msg["role"] == "model":
                gemini_history.append({"role": "model", "parts": [{"text": msg["parts"][0]["text"]}]})
        
        final_query = user_query

    # STEP 3: Create NEW session for THIS user
    chat_session = model.start_chat(history=gemini_history)

    try:
        response = chat_session.send_message(final_query)
        reply = response.text

        # STEP 4: Update the user's chat_history
        chat_history.append({"role": "user", "parts": [{"text": user_query}]})
        chat_history.append({"role": "model", "parts": [{"text": reply}]})

        return reply
    except Exception as e:
        return f"Something went wrong. Please try again later. ({e})"

def generate_conversation_summary(chat_history):
    """Generate 250-char summary of entire conversation"""
    try:
        conversation_text = ""
        for msg in chat_history:
            if msg["role"] == "user":
                conversation_text += f"User: {msg['parts'][0]['text']}\n"
            else:
                conversation_text += f"Assistant: {msg['parts'][0]['text']}\n"
        
        # Use Gemini to create concise summary
        summary_model = genai.GenerativeModel("gemini-2.0-flash")
        summary_session = summary_model.start_chat(history=[])
        
        summary_prompt = f"""
        Summarize this menstrual chat in ≤250 characters. 
        Include: symptoms, concerns, key advice. Keep it brief and factual.

        Conversation:
        {conversation_text}
        """
        
        response = summary_session.send_message(summary_prompt)
        summary = response.text.strip()
        
        # Ensure max 250 characters
        if len(summary) > 250:
            summary = summary[:247] + "..."
            
        return summary
        
    except Exception as e:
        # Fallback: simple concatenation if summary fails
        main_points = []
        for msg in chat_history[-6:]:  # Last 3 exchanges as fallback
            if msg["role"] == "user" and len(msg['parts'][0]['text']) < 50:
                main_points.append(msg['parts'][0]['text'][:40])
        
        fallback_summary = "User discussed: " + ", ".join(main_points)
        return fallback_summary[:250]
