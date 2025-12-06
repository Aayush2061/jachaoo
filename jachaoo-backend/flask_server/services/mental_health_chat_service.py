import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Gemini API setup
API_KEY = os.getenv("FINAL_API_KEY") 
genai.configure(api_key=API_KEY)

SYSTEM_INSTRUCTION = """
You are a warm, emotionally present friend for Nepali users.
You understand Romanized Nepali but always reply in simple, natural English.

STYLE:
- Short messages (1–3 lines).
- Casual, human tone.
- No repeated phrases, no repeated questions, no filler.
- No bullet points, no long paragraphs.
- Never say to search online or check websites.

BEHAVIOR:
- Understand the feeling beneath their words.
- Make them feel heard and cared for.
- Keep the conversation moving forward, understand the situation ask very relevant, questions(based on previous conversation and summary) and respond accoringly.
- Ask the best questions which arenot related to any previous questions so that user won't feel looped and donot ask too much questions.
- Don't ask too much questions okay.
- If they feel lost, gently guide analyzing situations.
- If overwhelmed, take the lead with simple ideas.
- For stress/sleep, invite a breathing or sleep moment (no steps).
- Follow the direction they choose; never go back to old paths.

CRISIS:
If they show deep panic, fear, abuse, or serious emotional pain:
- Calm them with steady, simple words.
- Give one grounded action they can do now.
- Then suggest one fitting Nepali helpline:
  1166 suicide prevention,
  1145 women abuse,
  1098 child abuse,
  100 police,
  102 ambulance.

ENERGY:
Be real, warm, honest. A caring friend — not a therapist and not a chatbot.
"""

def mental_health_chatbot(user_query, chat_history=None, diagnosed_condition=None, 
                         support_system=None, frequency=None, goals=None):
    """
    Main chatbot function for mental health support
    """
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        # Convert chat_history to prompt format
        conversation_context = ""
        if chat_history:
            for msg in chat_history:
                if msg['role'] == 'user':
                    conversation_context += f"User: {msg['parts'][0]['text']}\n"
                elif msg['role'] == 'model':
                    conversation_context += f"Assistant: {msg['parts'][0]['text']}\n"
        
        # Add user context
        context_info = ""
        if diagnosed_condition or support_system or frequency or goals:
            context_info = f"\nUser Context: diagnosed={diagnosed_condition}, support={support_system}, frequency={frequency}, goals={goals}"
        
        # Build final prompt
        prompt = f"{conversation_context}User: {user_query}{context_info}"
        
        # Generate response with retry logic
        for attempt in range(3):
            try:
                response = model.generate_content(prompt)
                return response.text.strip()
            except:
                if attempt < 2:
                    time.sleep(2)
                    continue
                else:
                    return "I'm here for you. Let's continue our conversation when you're ready."
                    
    except Exception as e:
        return "I'm feeling a bit overwhelmed right now. Could we try again in a moment?"

# Keep your original CLI function unchanged
def run_mental_health_chat():
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_INSTRUCTION
    )

    chat = model.start_chat(history=[])
    NEW_TURNS_BUFFER = []
    running_summary = ""

    def update_summary_from_chat(turns, summary_so_far):
        if len(turns) < 2:
            return summary_so_far
        history_chunk = turns[:-1]
        text_chunk = ""
        for turn in history_chunk:
            text_chunk += f"User: {turn['user']}\n"
            if "assistant" in turn:
                text_chunk += f"Assistant: {turn['assistant']}\n"

        summarise_prompt = (
            f"Previous summary:\n{summary_so_far or '[None]'}\n\n"
            f"Conversation chunk:\n{text_chunk.strip()}\n\n"
            "Create best summary under 400 characters capturing key points, user feelings and important context without forgetting past context totally."
        )

        for attempt in range(3):
            try:
                return model.generate_content(summarise_prompt).text.strip()
            except:
                if attempt < 2:
                    time.sleep(2)
                    continue
                else:
                    return summary_so_far

    def get_last_full_turn(turns):
        if len(turns) < 2:
            return None
        return turns[-2]

    print("\U0001F9E0 Mental Health Friend Chat (Gemini Flash 2.0)")
    print("Type 'exit' to end the chat.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in {"exit", "quit"}:
            print("Chat ended. Take care of yourself. 💛")
            break

        NEW_TURNS_BUFFER.append({"user": user_input})

        if len(NEW_TURNS_BUFFER) >= 2:
            running_summary = update_summary_from_chat(NEW_TURNS_BUFFER, running_summary)

        last_turn = get_last_full_turn(NEW_TURNS_BUFFER)
        last_turn_text = (
            f"User: {last_turn['user']}\nAssistant: {last_turn['assistant']}"
            if last_turn else "[No prior full turn]"
        )
        
        prompt_for_reply = (
            f"Summary:\n{running_summary or '[none]'}\n\n"
            f"{last_turn_text}\n\n"
            f"User: {user_input}\n"
            "2 sentence with max 12 words each. Sound like a real close friend. "
            "Understand the user's exact emotion and respond with warmth. "
            "Maintain the flow and keep engaging without looping."
            "Guide gently without overthinking."
        )
        
        for attempt in range(3):
            try:
                assistant_text = model.generate_content(prompt_for_reply).text.strip()
                break
            except:
                if attempt < 2:
                    time.sleep(2)
                    continue
                else:
                    assistant_text = "Sorry for the interruption. Please try again after some time."
        
        print("Friend:", assistant_text, "\n")

        NEW_TURNS_BUFFER[-1]["assistant"] = assistant_text  # is this ready