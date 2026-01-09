import google.generativeai as genai
from dotenv import load_dotenv
import os
from typing import Dict, Tuple
from threading import Lock

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("FINAL_API_KEY") 
genai.configure(api_key=API_KEY)


# Thread-safe session storage for multi-user production
chat_sessions = {}
cpr_status = {}
session_lock = Lock()

CPR_INSTRUCTIONS = """Start CPR if the person is unconscious and not breathing.

1) Start Chest Compressions
   i) Lay the person flat.
  ii) Kneel beside the chest.
 iii) Put your hands in the center of the chest.
  iv) Push hard and fast.

* Depth: 5 cm
* Rate: 100–120 per minute
* Let the chest rise fully each time.

If untrained:
Do only chest compressions without stopping.

If trained:
30 compressions → 2 breaths, repeat.

Continue CPR until:
- Emergency help arrives
- They start breathing
"""

SYSTEM_INSTRUCTION = """
You are a calm, warm first aid assistant for people in Nepal. You respond kindly and clearly during emergencies. Ask at most 4–5 short, useful questions to understand the case, one at a time, never overlapping or repeating. 

After you have enough info, give simple first aid steps in clean bullet points, friendly tone, and easy English—no symbols, no medical jargon, no overexplaining. Then say:
'Call 102 for an ambulance in Nepal.'
and
'Do you want more details about any of these steps?'

Strict Rules:
- Don't greet user if he starts with the condition.
- Understand Romanized Nepali but always reply in English.
- Ask only one short, relevant question at a time.
- Give short responses (1-2 sentences) maximum.
- If the user gives unclear or blank replies: say "Sorry, I didn't understand that. Could you repeat?"
- Don't give medicines; politely deny if asked.
- If user talks about unrelated things (tech, jokes, etc.), answer politely but stay on first aid focus.
- If user becomes emotional or serious after first aid, respond with warmth and support.
- Never repeat sympathy phrases; stay real and kind.
- Never assume answers — wait for user replies.
- Never give unwanted symbols and all information in well format
- If someone is unconscious:
   1. Ask: "Is the person breathing normally?"
   2. If not, ask: "Do you feel a pulse?"
   3. If no breathing and no pulse → reply only: "Start CPR immediately." (nothing else)
- Do not include "Call 102" or "Do you want more details…" in the same message as "Start CPR immediately."
- After CPR is shown by the system, wait for the user reply before continuing.
- Never provide info like you are calling ambulance, no you cannot call 

Be deeply analytical, emotionally calm, and keep all responses clean, short, and human-like.
"""

def get_chat_model():
    return genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_INSTRUCTION
    )

def chat_step(user_input, session_id='default'):
    with session_lock:  # Thread-safe session access
        # Initialize session if it doesn't exist
        if session_id not in chat_sessions:
            model = get_chat_model()
            chat_sessions[session_id] = model.start_chat(history=[])
            cpr_status[session_id] = False
    
        chat = chat_sessions[session_id]
        shown_cpr = cpr_status[session_id]
    
    # Get response from Gemini (this is thread-safe per session)
    response = chat.send_message(user_input)
    assistant_response = response.text
    
    # Check if CPR should be shown
    if not shown_cpr and "start cpr immediately" in assistant_response.lower():
        with session_lock:
            cpr_status[session_id] = True
        return f"{assistant_response}\n\nCPR INSTRUCTIONS:\n\n{CPR_INSTRUCTIONS}\n\nCall 102 for an ambulance in Nepal.\nDo you want more details about any of these steps?"
    
    return assistant_response

def reset_conversation(session_id='default'):
    with session_lock:  # Thread-safe session cleanup
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        if session_id in cpr_status:
            del cpr_status[session_id]

# Keep your original CLI function unchanged
def run_first_aid_chat():
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_INSTRUCTION
    )

    chat = model.start_chat(history=[])
    shown_cpr = False
    conversation_history = []
    
    MAX_HISTORY_EXCHANGES = 4

    print("🧠 First Aid")
    print("Type 'exit' to end the chat.\n")

    def build_conversation_summary(history, cpr_shown=False):
        summary_parts = []
        
        # JUST ONE LINE for CPR context
        if cpr_shown:
            summary_parts.append("[CPR instructions given]")
        
        for exchange in history:
            summary_parts.append(f"User: {exchange.get('user', '')}")
            summary_parts.append(f"Assistant: {exchange.get('assistant', '')}")
        
        return " | ".join(summary_parts)

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Chat ended. Take care of yourself. 💛")
            break

        # Build prompt
        conversation_summary = build_conversation_summary(conversation_history, shown_cpr)
        prompt = f"Recent: {conversation_summary}\n\nCurrent: {user_input}" if conversation_summary else user_input

        response = chat.send_message(prompt)
        assistant_response = response.text
        print("Assistant:", assistant_response)

        # Add to history
        conversation_history.append({'user': user_input, 'assistant': assistant_response})
        if len(conversation_history) > MAX_HISTORY_EXCHANGES:
            conversation_history = conversation_history[-MAX_HISTORY_EXCHANGES:]

        # CPR trigger
        if not shown_cpr and "start cpr immediately" in assistant_response.lower():
            print("\nCPR INSTRUCTIONS:\n")
            print(CPR_INSTRUCTIONS)
            print("\nCall 102 for an ambulance in Nepal.")
            print("Do you want more details about any of these steps?\n")
            shown_cpr = True
            conversation_history[-1]['assistant'] = "Start CPR immediately. [CPR shown]"