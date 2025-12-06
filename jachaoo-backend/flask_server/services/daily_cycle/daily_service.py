import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os
# Load variables from .env file
load_dotenv()

# Get the API key from the environment
api_key = os.getenv("FINAL_API_KEY")

API_KEY = api_key


class DailyCycleService:
    def __init__(self):
        genai.configure(api_key=API_KEY)  # Use your key
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    def analyze(self, permanent_data, daily_data):
        prompt = self.build_prompt(permanent_data, daily_data)
        response = self.model.generate_content(prompt)
        return response.text

    def build_prompt(self , permanent, daily):


    # Extract cycle info
        cycle_length = permanent.get("cycleLength", 28)
        last_period = permanent.get("lastPeriodDate")
        start_date = datetime.strptime(last_period[:10], "%Y-%m-%d")
        today = datetime.today()
        days_since = (today - start_date).days
        cycle_day = (days_since % cycle_length) + 1



        # Format symptoms properly
        symptoms_list = daily.get("symptoms", [])
        symptoms_str = ", ".join(symptoms_list) if symptoms_list else "No symptoms logged"

        # Format moods
        moods_list = daily.get("moods", [])
        moods_str = ", ".join(moods_list) if moods_list else "No moods logged"

        # Get permanent conditions - FIXED THIS PART
        conditions_list = permanent.get("conditions", [])
        conditions_str = ", ".join(conditions_list) if conditions_list else "None"
        # Prompt template

        prompt = f"""
            You are a menstrual health assistant. Using the user’s permanent profile and today’s tracking data below, generate a **short, friendly, and human-like daily summary** in **simple and natural language**.

            ### User Data (for internal reference only — do NOT display directly):
            - Date: {today.strftime('%B %d, %Y')}
            - Cycle Day: {cycle_day}, {permanent.get("currentCyclePhase")}
            - Cycle Trend: Assume Regular
            - Flow: {daily.get("flow", "Not logged")}
            - Body Temp: {daily.get("bodyTemp", {}).get("value", "Not logged")}{daily.get("bodyTemp", {}).get("unit", "")}
            - Sleep Quality: {'Good' if daily.get('sleepQuality') else 'Poor'}
            - Caffeine on Empty Stomach: {'Yes' if daily.get('caffeineEmptyStomach') else 'No'}
            - Sex Today: {'Yes' if daily.get('hadSex') else 'No'}
            - Toilet Habits: {'Regular' if daily.get('toiletHabit') else 'Irregular'}
            - Contraceptive Use: {permanent.get('contraceptive')}
            - Trying to Conceive: {permanent.get('tryingToConceive')}
            - Symptoms: {symptoms_str}
            - Logged Conditions: {conditions_str}
            - Moods Logged: {moods_str}

            ---

            ### 🩷 Output Format (this is exactly what the user should see):
            Do **not** show the raw data above. Start directly with the insight.

             🌸 Daily Summary 
                 {today.strftime('%B %d, %Y')}

            **💡 Quick Insight:**  
                - Give short insight of user todays phase
                - prioritize the flow if it is outside mensuration period
                - compulsory provide a message for unusual situations(analyze deeply) if anything is unusual in daily syptoms like(for ex: Heavy flow outside mensuration period and like anything that can affect her health based on her permanent conditions)

            **✨ Today’s Tips:**  
            - [Give 4 short, practical suggestions — include  foods or self-care tip, one movement tip, rest, hydration tip(Nepali context drinks) and other. you may mention local foods where relevant.]

            **❤️ Reminder:**  
             - If emergency situation is analyzed from the symptoms then gently remind the user to visit doctor(Compulsory if such situation arises).
                for ex: if heavy bleeding is analyzed or has previous coniditon (like PCOS) which may effect her health then mention it with small remainder
             - Prioritize flow if its outside mensuration period
             - Use the data properly cause it may risk the user health, so analyze properly and if no such situation then end with a kind reassurance. 
             - only one message okay either alert or reassurance not both in 10 words max.
            ---

          o  ### Tone & Style Guidelines:
            - Analyze the condition of the user
            - Focuses on user emergency situations if any  
            - Keep it short .
            - Avoid nepali texts in brackets, can use romanized nepali if necessary
            - No data tables, no bullet overload.  
            - Write in a warm, conversational, and supportive tone — like a helpful health app message, not a medical report.  
            - Avoid emojis except for light use (🌸, 💡, ❤️, ⚕️).
            - Provide in good format  
            """



        return prompt
    
