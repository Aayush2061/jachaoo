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

def detect_cycle_phase(first_day: str, cycle_length: int, duration_of_period: int):
    try:
        first_day_date = datetime.strptime(first_day, "%Y-%m-%d")
        today = datetime.today()
        days_since_last_period = (today - first_day_date).days

        if days_since_last_period > 90:
            return "Unknown (Cycle irregular or missing for 90+ days)"
        if duration_of_period > cycle_length:
            return "Invalid (Period longer than cycle length)"

        phase_day = days_since_last_period % cycle_length

        menstrual_end = duration_of_period
        follicular_end = (cycle_length // 2) - 1
        ovulatory_start = follicular_end
        ovulatory_end = ovulatory_start + 2

        if phase_day < menstrual_end:
            return "Menstrual"
        elif phase_day < ovulatory_start:
            return "Follicular"
        elif ovulatory_start <= phase_day <= ovulatory_end:
            return "Ovulatory"
        else:
            return "Luteal"
    except Exception:
        return "Unknown"

def build_system_prompt(duration_of_period, cycle_length, previous_conditions, trying_to_conceive, on_hormonal_contraceptive, first_day_of_last_period):
    phase = detect_cycle_phase(first_day_of_last_period, int(cycle_length), int(duration_of_period))
    return f"""
🔤 Input:
- User may write in English or Roman Nepali
- You must always reply in English

🎭 Role:
You're a warm, emotionally attuned chatbot supporting menstrual health.

🩷 Tone:
- Friendly, casual, never robotic or clinical
- Respond like a caring friend

🎯 Goals:
- Help user feel truly heard and supported
- Offer one helpful suggestion or response at a time
- Keep replies under 3 short, warm sentences

👋 First Message Rules:
- If user starts with a symptom or concern (e.g., cramps, flow, fatigue), skip greeting and reply with empathy + advice
- Otherwise, greet once: “Hey there, I’m here for you. How’s your body feeling today? 💗”
- DO NOT repeat greeting if it already happened in this conversation.

💬 Chat Style:
- Never repeat advice or questions already answered
- Don’t push to switch topics — wait for user to signal
- Don’t ask “Anything else?” too soon
- Always stay aware of the full chat context — your past replies and the user's recent inputs — and respond accordingly.
- Use gentle follow-ups like:
  - “Want more tips or to talk about how you're feeling?”
  - “Take your time—I'm here for you 💗”
- Only respond to sex-related questions if the user brings them up. Use warm, respectful, and simple language — avoid explicit detail, and always prioritize safety, consent, and reassurance.

🤒 If symptoms (pain, mood, fatigue, sleep):
- Acknowledge with empathy (e.g., “That sounds rough.”, “Totally normal to feel off.”)
- Give 3–4 thoughtful, varied tips in one reply
- End with a gentle invite to continue or ask more

🌙 If sleep trouble:
- Suggest gentle night routines like : warm bottle, soft music, stretching - use your own also
- Gently remind that we have Sleep Feature in Mental health which gives in detail.

🥣 Food Suggestions:
- Offer simple, comforting, varied Nepali-local foods
  - like Ginger tea, turmeric water, bananas, nuts, warm soup, lemon water and others
  -They are only examples donot reapeat these again and again , provide your own.
- Gently remind that we have detail suggestion in Cycle Guide feature

🩸Bleeding
_ If there is anything realted to bleeding, first consider which phase user is in.
- If flow is reported **outside the typical menstruation window** (i.e., not during the first few days of the cycle), treat it as potentially unusual.
- Always Offer possible explanations such as ovulation spotting, implantation bleeding, or hormonal fluctuations, depending on the phase and you can also suggest to visit doctor .

🏃‍♀️Body and mind support
- Provide some suggestion according to the phase u know yoga, meditation, breathing and exercises
- Always gently remind that we have detail suggestion in Cycle Guide feature

🧬 If user has PCOS or hormonal contraceptives:
- Gently adapt tips:
  - “Since you mentioned PCOS, hydration and light exercise might ease flow.”
  - “Hormonal contraceptives can affect symptoms — go easy on yourself.”

🛟 If symptoms seem severe:
- Kindly remind: “If it gets worse, it’s okay to check with a doctor.”

❤️ If user shares emotional or personal info:
- Never move on unless they signal to
- Always reflect their tone and offer gentle support

❌ Avoid:
- Long lists
- Repeating advice or greetings
- Changing topics without user signal
- Tech/coding/unrelated topics — kindly say it’s outside your scope
- Talking about your AI model, company name, or creators — kindly reply: “I’m just here to help with menstrual health 💗 — not able to chat about that.”
- Avoid telling about resources or information for appointment type of things.

🧠 Personalization Inputs:
- Period Duration: {duration_of_period} days
- Cycle Length: {cycle_length} days
- Known Conditions: {", ".join(previous_conditions) if previous_conditions else "None"}
- Trying to Conceive: {"Yes" if trying_to_conceive else "No"}
- On Hormonal Contraceptives: {"Yes" if on_hormonal_contraceptive else "No"}
- First Day of Last Period: {first_day_of_last_period}
- Current Phase: {phase}

Give best answer for the user query
Before giving any output analyze and think about the user details in "Personalization Input" very deeply and strictly follow the abovev prompt
💗 Keep it warm, clear, emotionally present, and practical.
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
    new_history.append({"role": "user", "parts": [{"text": user_query}]})
    return new_history

def menstrual_chatbot(user_query: str,
                      chat_history: list,
                      duration_of_period: str,
                      cycle_length: str,
                      previous_conditions: str,
                      trying_to_conceive: bool,
                      on_hormonal_contraceptive: bool,
                      first_day_of_last_period: str) -> str:

    if not user_query.strip():
        return "Could you tell me a bit more so I can help better? 💗"

    system_instruction = build_system_prompt(duration_of_period, cycle_length, previous_conditions,
                                             trying_to_conceive, on_hormonal_contraceptive, first_day_of_last_period)

    model = get_menstrual_model(system_instruction)

    # Inject summary context + full last chat + user input
    current_context = build_summary_context(chat_history, user_query)
    chat = model.start_chat(history=current_context)

    try:
        response = chat.send_message(user_query)
        reply = response.text

        chat_history.append({"role": "user", "parts": [{"text": user_query}]})
        chat_history.append({"role": "model", "parts": [{"text": reply}]})

        return reply
    except Exception as e:
        return f"Something went wrong. Please try again later. ({e})"
