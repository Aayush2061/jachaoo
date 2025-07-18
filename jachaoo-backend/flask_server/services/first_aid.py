import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GENAI_API_KEY6") 
genai.configure(api_key=API_KEY)

# Initialize the model with system instructions
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="""You are a warm, helpful first aid assistant built specifically for people in Nepal. You help users with calm, kind support — especially in emergencies or health-related worries. Your job is to ask at most 4–5 highly relevant and clear questions to understand the situation. After that, you give the best first aid advice in simple, direct bullet points, avoiding unnecessary info or overexplaining.

- Always respond in English but understand Romanized Nepali naturally and correctly.
- Do not ask more than 5 questions, unless the user clearly wants to keep talking.
- Focus on what matters most — ask only useful, non-repetitive, and clear questions that help you figure out how to guide the user.
- Strictly only one simple question at a time without overlapping.
- After gathering enough info, provide good first aid steps in clear bullet points without unnecessary symbols and in good format, using calm and friendly language. Do not use overly technical or clinical words.
- After giving first aid steps, add this line 'Call 102 for an ambulance in Nepal.'.
- After giving first aid, end with this question: 
  "Do you want more details about any  of these steps?"
- Never shame the user or repeat sympathy phrases. Be gentle, real, and emotionally supportive.
- Keep responses short, warm, and meaningful — like a close friend who knows first aid well.
- If the user asks anything clearly unrelated to first aid or medical emergencies (such as jokes, general topics, tech help, or small talk), respond politely in the correct language.
- If the user responds with irrelevant emojis or nonsense, remind them politely it is first aid help.
- Ask strictly only one short, relevant medical question at a time, based on what the user said- Also avoid overlapping the questions keep one by one. 
- Do not ask scale level question -user will become confused.
- If the user asks for more details after first aid tips, and ask emotional and serious questions show some support and sympathy to the user.
- If the user respond with blank or no understanding reply then respond 'Sorry, I didn’t understand that. Could you repeat or clarify?'
- Analyze the context very deeply and give best of the best questions and answer.
- After asking the user any question, DO NOT answer it yourself. WAIT for the user's response before giving any first aid instruction or moving to the next step. NEVER assume an answer. Only provide first aid guidance based on the user’s reply.
- Never give unwanted symbols and all information in well format
- DOnot give any medicine suggestion okay gently deny that.
- When a user reports someone unconscious, do NOT assume CPR is needed immediately.
- First, ask only one question at a time seperately:
   1. "Is the person breathing normally?"
   2. Wait for the user's reply.
   3. If the person is not breathing normally (no breathing or only gasping), ask: "Do you feel a pulse?"
   4. Wait for user's reply.
- Only if the person is unconscious AND not breathing normally OR has no pulse, respond ONLY with:
  "Start CPR immediately." and nothing else.
- Do not explain CPR steps here; the system will inject them after you say "Start CPR immediately."
- Do not include “Call 102” or “Do you want more details…” in the same message as "Start CPR immediately."
- After CPR is shown, wait for user reply before continuing.
- If user asks for clarification after CPR, respond calmly without repeating CPR steps unless specifically asked.
"""
)

# Global chat session storage (in production, use a proper session management system)
active_chats = {}

CPR_INSTRUCTIONS = """CPR INSTRUCTIONS (For Everyone – Trained & Untrained)

WHEN TO START CPR:
- Start CPR if the person is unconscious and not breathing or only gasping.

Step 1: Check the Person
- Tap the shoulder and shout: “Are you okay?”
- If there is no response, move to Step 2.

Step 2: Call for Help
- Call 102 (Ambulance – Nepal).
- Or ask someone nearby to make the call.
- Then begin CPR immediately.

Step 3: Start Chest Compressions
(This step is the same for trained and untrained people)

1. Lay the person flat on their back.
2. Kneel beside their chest.
3. Place the heel of one hand in the center of the chest (between the nipples).
4. Place the other hand on top, keep elbows straight.
5. Push hard and fast:
   - Depth: At least 5 cm (2 inches)
   - Rate: 100–120 compressions per minute
   - Allow the chest to rise fully after each push

→ Do 30 compressions

Step 4: What to Do Next (Based on Training)

IF YOU ARE UNTRAINED (or not confident):
- Do not give rescue breaths.
- Continue giving chest compressions without stopping.
- Keep going until:
   - Emergency help arrives
   - The person starts breathing or moving
   - You are too exhausted to continue

IF YOU ARE TRAINED IN CPR:
- After every 30 compressions, give 2 rescue breaths:
   1. Tilt the head back slightly
   2. Pinch the nose shut
   3. Breathe gently into the mouth
      - The chest should rise with each breath
- Repeat the cycle: 30 compressions → 2 breaths

How Long Should You Continue CPR?

Continue CPR without stopping until one of these happens:
1. Emergency medical services (102) arrive and take over
2. The person starts breathing or moving
3. You become too tired to continue
4. An AED (automated external defibrillator) is ready to use — follow its voice instructions

IMPORTANT:
- CPR may need to be performed for several minutes to 30 minutes or more.
- Never stop just because "too much time has passed."

Chest compressions keep blood and oxygen flowing to the brain and heart.
They keep the person alive until medical help arrives.
"""

def initialize_chat_session(session_id):
    """Initialize a new chat session for a user"""
    chat = model.start_chat(history=[])
    active_chats[session_id] = {
        'chat': chat,
        'shown_cpr': False
    }
    return chat

def get_chat_for_session(session_id):
    """Get or create a chat session for a user"""
    if session_id not in active_chats:
        return initialize_chat_session(session_id)
    return active_chats[session_id]['chat']

def chat_step(user_input, session_id="default"):
    """
    Process user input and generate a response
    Args:
        user_input: The user's message
        session_id: Unique identifier for the conversation session
    Returns:
        str: The assistant's response
    """
    # Get or create chat session
    chat = get_chat_for_session(session_id)
    session_data = active_chats[session_id]
    
    # Handle exit/end conditions
    user_input_lower = user_input.strip().lower()
    if user_input_lower in ["no", "thanks", "thank you", "thx"]:
        if any("Do you want more details" in msg.parts[0].text for msg in chat.history if msg.role == "model"):
            return "You're welcome. I'm glad I could help. Stay safe!\n\nThank you for using the First Aid Assistant. Goodbye!"
    
    # Send message to Gemini
    try:
        response = chat.send_message(user_input)
        response_text = response.text
        
        # Handle CPR case
        if not session_data['shown_cpr'] and "start cpr immediately" in response_text.lower():
            session_data['shown_cpr'] = True
            response_text = f"{response_text}\n\n{CPR_INSTRUCTIONS}\n\nCall 102 for an ambulance in Nepal.\nDo you want more details about any of these steps?"
        
        return response_text
    
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}. Please try again."

def reset_conversation(session_id="default"):
    """Reset the conversation history for a session"""
    if session_id in active_chats:
        del active_chats[session_id]
    return True