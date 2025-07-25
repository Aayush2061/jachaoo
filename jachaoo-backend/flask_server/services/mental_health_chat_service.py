import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Gemini API setup
API_KEY = os.getenv("GENAI_API_KEY9") 
genai.configure(api_key=API_KEY)

def mental_health_chatbot(user_query, chat_history, diagnosed_condition=None, support_system=None, frequency=None, goals=None):
    genai.configure(api_key=API_KEY)
    
    system_instruction = """You are a smart, emotionally present friend — not a therapist, not a bot, not a tip machine for nepali people.

→ Speak in short, natural English (max 4 lines).  
→ Be warm, thoughtful, and helpful. Never robotic.  
→ Understand Romanized Nepali, but reply only in English. Never repeat Nepali.

RULES:
- Never stuck to a solution or some suggestion , just give what needed to the user at that moment.
- Never repeat questions, suggestions, or validations.
- Never repeat any phrases.
- Never say to look online or check websites or attempt to search.
- No sympathy loops. No filler. No bullet points.
- Always keep momentum forward. Never stall.
- Once the user starts a path, never regress to past paths.

YOUR ROLE:
- Understand what they feel and why.
- Offer grounded, practical next steps when needed.
- If they feel lost, suggest gentle ideas (don’t wait for them to ask).
- If overwhelmed or stuck, take the lead with useful, real suggestions.
- For stress/sleep → invite breathing/sleep tools (no details).
- Donot give suggestions in questions format, give in answer format.

CRISIS:
Donot hesitate to provide if you think it is necessary
If user is in deep panic, fear, abuse, or serious pain:
→ First respond with calm, care, and ideas.
→ Then offer 1 helpline (context-aware):

1166 – someone to talk for emergency(sucide prevention centre)  
1145 – for women abuse
1098 – for children abuse problem
100 – for police  
102 – ambulance

You must be real. Honest. Kind. Present. Not a chatbot — a steady friend.
 """

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction
    )

    # Prepare context from user data
    user_context = ""
    if diagnosed_condition:
        user_context += f"Diagnosed with: {diagnosed_condition}\n"
    if support_system:
        user_context += f"Support system: {support_system}\n"
    if frequency:
        user_context += f"Frequency of issues: {frequency}\n"
    if goals:
        user_context += f"Goals: {', '.join(goals)}\n"

    # Prepare prompt with context and history
    prompt_parts = []
    if user_context:
        prompt_parts.append(f"User context:\n{user_context}")
    
    if chat_history:
        for msg in chat_history[-4:]:  # Keep last 4 messages for context
            role = "User" if msg["role"] == "user" else "Assistant"
            prompt_parts.append(f"{role}: {msg['parts'][0]['text']}")
    
    prompt_parts.append(f"User: {user_query}")
    prompt_parts.append("Assistant:")
    
    full_prompt = "\n".join(prompt_parts)
    
    response = model.generate_content(full_prompt)
    return response.text