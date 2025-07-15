import requests
from dotenv import load_dotenv
import os
# Load variables from .env file
load_dotenv()

# Get the API key from the environment
api_key = os.getenv("GENAI_API_KEY")

API_KEY = api_key
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def call_gemini_api(prompt: str) -> str:
    headers = {
        "Content-Type": "application/json",
    }

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ]
    }

    params = {
        "key": API_KEY
    }

    response = requests.post(API_ENDPOINT, headers=headers, params=params, json=payload)

    if response.status_code == 200:
        result = response.json()
        try:
            return result["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return "Error: Unexpected API response format."
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return "Sorry, I couldn't process your request."

conversation_history = []

def build_prompt(conversation_history, user_input):
    conversation_summary = ""
    for turn in conversation_history:
        role = "User" if turn['role'] == 'user' else "Assistant"
        conversation_summary += f"{role}: {turn['content']}\n"

    system_instruction="""
You are a warm, helpful first aid assistant built specifically for people in Nepal. You help users with calm, kind support — especially in emergencies or health-related worries. Your job is to ask at most 4–5 highly relevant and clear questions to understand the situation. After that, you give the best first aid advice in simple, direct bullet points, avoiding unnecessary info or overexplaining.

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
-If the user asks anything clearly unrelated to first aid or medical emergencies (such as jokes, general topics, tech help, or small talk), respond politely in the correct language.
-If the user responds with irrelevant emojis or nonsense, remind them politely it is first aid help.
-Ask strictly only one short, relevant medical question at a time, based on what the user said- Also avoid overlapping the questions keep one by one. 
-Do not ask scale level question -user will become confused.
- If the user asks for more details after first aid tips, and ask emotional and serious questions show some suport and sympathy to the user.
- If the user respond with blank or no understanding reply then respond 'Sorry, I didn’t understand that. Could you repeat or clarify?'
- Analyze the context very deeply and give best of the best questions and answer.
- After asking the user any question, DO NOT answer it yourself. WAIT for the user's response before giving any first aid instruction or moving to the next step. NEVER assume an answer. Only provide first aid guidance based on the user’s reply.
-Never give unwanted symbols and all information in well format
- After gathering info, if the person is unconscious and not breathing or has no pulse, explain CPR in simple steps like this:
CPR INSTRUCTIONS (For Everyone – Trained & Untrained)

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
    prompt = system_instruction + conversation_summary + f"User: {user_input}\nAssistant:"
    return prompt

def chat_step(user_input):
    global conversation_history

    prompt = build_prompt(conversation_history, user_input)
    ai_reply = call_gemini_api(prompt)

    # Add a graceful exit if the user says "no" or "thanks" after receiving first aid
    user_input_lower = user_input.strip().lower()
    if user_input_lower in ["no", "thanks", "thank you", "thx"]:
        if any("Do you want more details" in turn["content"] for turn in conversation_history if turn["role"] == "assistant"):
            closing_message = "You're welcome. I’m glad I could help. Stay safe!"
            conversation_history.append({'role': 'user', 'content': user_input})
            conversation_history.append({'role': 'assistant', 'content': closing_message})
            return closing_message + "\n\nThank you for using the First Aid Assistant. Goodbye!"

    # Check for [END] token (in case you want to use it for programmatic endings)
    if "[END]" in ai_reply:
        ai_reply = ai_reply.replace("[END]", "").strip()
        conversation_history.append({'role': 'user', 'content': user_input})
        conversation_history.append({'role': 'assistant', 'content': ai_reply})
        return ai_reply + "\n\nThank you for using the First Aid Assistant. Stay safe!"

    conversation_history.append({'role': 'user', 'content': user_input})
    conversation_history.append({'role': 'assistant', 'content': ai_reply})

    return ai_reply



if __name__ == "__main__":
    print("First Aid Assistant using Gemini 1.5 Flash API. Type 'exit' to quit.")
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break
        reply = chat_step(user_input)
        print("Assistant:", reply)