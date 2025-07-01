from datetime import datetime
from .helpers import build_system_prompt, menstrual_chatbot

class MenstrualChatService:
    def __init__(self):
        pass

    def initialize_chat(self, user_context=None):
        if not user_context:
            raise ValueError("User context is required for chat initialization")
        
        required_fields = ['duration_of_period', 'cycle_length', 'first_day_of_last_period']
        for field in required_fields:
            if field not in user_context:
                raise ValueError(f"Missing required field: {field}")

        user_context.setdefault('previous_conditions', 'None')
        user_context.setdefault('trying_to_conceive', False)
        user_context.setdefault('on_hormonal_contraceptive', False)
        
        system_prompt = build_system_prompt(
            duration_of_period=str(user_context["duration_of_period"]),
            cycle_length=str(user_context["cycle_length"]),
            previous_conditions=user_context["previous_conditions"],
            trying_to_conceive=bool(user_context["trying_to_conceive"]),
            on_hormonal_contraceptive=bool(user_context["on_hormonal_contraceptive"]),
            first_day_of_last_period=user_context["first_day_of_last_period"]
        )
        
        return [{
            "role": "user",
            "parts": [{"text": system_prompt}]
        }]

    def get_response(self, user_query, chat_history, user_context=None):
        if not user_context:
            raise ValueError("User context is required for chat response")

        # Always rebuild full history with system prompt at the top
        system_prompt = build_system_prompt(
            duration_of_period=str(user_context["duration_of_period"]),
            cycle_length=str(user_context["cycle_length"]),
            previous_conditions=user_context["previous_conditions"],
            trying_to_conceive=bool(user_context["trying_to_conceive"]),
            on_hormonal_contraceptive=bool(user_context["on_hormonal_contraceptive"]),
            first_day_of_last_period=user_context["first_day_of_last_period"]
        )

        working_history = [{
            "role": "user",
            "parts": [{"text": system_prompt}]
        }] + chat_history.copy()  # Insert prompt before prior history

        # Add current user message
        working_history.append({
            "role": "user",
            "parts": [{"text": user_query}]
        })

        # print("\n==== FULL HISTORY SENT TO GEMINI ====")
        # for msg in working_history:
        #     print(f"{msg['role'].upper()}: {msg['parts'][0]['text'][:150]}...\n")

        response = menstrual_chatbot(
            user_query=user_query,
            chat_history=working_history,
            duration_of_period=str(user_context["duration_of_period"]),
            cycle_length=str(user_context["cycle_length"]),
            previous_conditions=user_context["previous_conditions"],
            trying_to_conceive=bool(user_context["trying_to_conceive"]),
            on_hormonal_contraceptive=bool(user_context["on_hormonal_contraceptive"]),
            first_day_of_last_period=user_context["first_day_of_last_period"]
        )

        return response
