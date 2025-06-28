from datetime import datetime
from .helpers import build_system_prompt, menstrual_chatbot

class MenstrualChatService:
    def __init__(self):
        self.default_context = {
            "duration_of_period": "5",
            "cycle_length": "28",
            "previous_conditions": "None",
            "trying_to_conceive": False,
            "on_hormonal_contraceptive": False,
            "first_day_of_last_period": datetime.now().strftime("%Y-%m-%d")
        }

    def initialize_chat(self, user_context=None):
        context = {**self.default_context, **(user_context or {})}
        
        system_prompt = build_system_prompt(
            duration_of_period=context["duration_of_period"],
            cycle_length=context["cycle_length"],
            previous_conditions=context["previous_conditions"],
            trying_to_conceive=context["trying_to_conceive"],
            on_hormonal_contraceptive=context["on_hormonal_contraceptive"],
            first_day_of_last_period=context["first_day_of_last_period"]
        )
        
        return [{
            "role": "user",
            "parts": [{"text": system_prompt}]
        }]

    def get_response(self, user_query, chat_history, user_context=None):
        context = {**self.default_context, **(user_context or {})}
        
        response = menstrual_chatbot(
            user_query=user_query,
            chat_history=chat_history,
            duration_of_period=context["duration_of_period"],
            cycle_length=context["cycle_length"],
            previous_conditions=context["previous_conditions"],
            trying_to_conceive=context["trying_to_conceive"],
            on_hormonal_contraceptive=context["on_hormonal_contraceptive"],
            first_day_of_last_period=context["first_day_of_last_period"]
        )
        
        return response