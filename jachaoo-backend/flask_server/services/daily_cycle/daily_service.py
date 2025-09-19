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
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def analyze(self, permanent_data, daily_data):
        prompt = self.build_prompt(permanent_data, daily_data)
        response = self.model.generate_content(prompt)
        return response.text

    def build_prompt(self , permanent, daily):
    # Extract cycle info
        cycle_length = permanent.get("cycleLength", 28)
        period_duration = permanent.get("duration", 4)
        last_period = permanent.get("lastPeriodDate")
        start_date = datetime.strptime(last_period[:10], "%Y-%m-%d")
        today = datetime.today()
        days_since = (today - start_date).days
        cycle_day = (days_since % cycle_length) + 1

        # Phase estimation
        ovulation_day = cycle_length - 14  # Approximate ovulation timing

        if cycle_day <= period_duration:
            phase = "Menstrual Phase"
        elif cycle_day <= ovulation_day - 1:
            phase = "Follicular Phase"
        elif cycle_day <= ovulation_day + 1:
            phase = "Ovulation Phase"
        else:
            phase = "Luteal Phase"



        symptoms_str = ", ".join(daily.get("symptoms", []))
        moods_str = ", ".join(daily.get("moods", []))
        # Prompt template
        prompt = f'''
    - Strictly follow the below prompt
    You are a menstrual health assistant. Given the user's permanent menstrual profile and today's daily tracking data, generate a detailed daily tracking summary in the following structured format in very simple and easy language :

    🗓️ Date: {today.strftime('%B %d, %Y')}
    📍 Cycle Day: {cycle_day} , {phase}
    🔄 Cycle Trend: Assume Regular 
    🩸 Flow: {daily.get("flow", "Not logged")}
    🌡️ Body Temp: {daily.get("bodyTemp", "Not logged")}°C
    🛌 Sleep Quality: {'✅ Good' if daily.get('sleepQuality') else '❌ Poor'}
    ☕ Caffeine on Empty Stomach: {'⚠️ Yes' if daily.get('caffeineEmptyStomach') else '✅ No'}
    ❤️ Sex Today: {'✅ Yes' if daily.get('hadSex') else '❌ No'}
    🚽 Toilet Habits: {'✅ Regular' if daily.get('toiletHabit') else '❌ Irregular'}
    💊 Contraceptive Use: {'✅ Yes' if permanent.get('contraceptive') == 'Yes' else '❌ No'}
    👶 Trying to Conceive: {permanent.get('tryingToConceive')}


    😣 Symptoms Experienced
    List symptoms from: {symptoms_str}
    Mention if any match conditions: {permanent.get('conditions', [])} if donot match then donot print this line

    🧠 Mood Check
    Moods Logged: {moods_str}
    Give likely hormonal cause in short and simple .

    Provide  mental health tip in points With Heading-"Mental Health Tips"
    -use points and provide practical tips 


    🔍 What This Means Today
    Give in points daily context using both sets of data.
    - Don't give long points, just short and sweet 
    - Give one point helping user considering the daily note 
    Always interpret the reported menstrual flow in relation to the user’s current cycle phase.

    - If flow is reported **outside the typical menstruation window** (i.e., not during the first few days of the cycle), treat it as potentially unusual.
    - Offer possible explanations such as ovulation spotting, implantation bleeding, or hormonal fluctuations, depending on the phase.
    - Reassure the user that occasional light bleeding can be normal, but encourage tracking the pattern or seeking medical advice if it becomes frequent or concerning.
    - Do not assume every flow means menstruation. Cross-reference with cycle day and phase before interpretation.


    📌 Today’s Recommendations
    Give 4–5 practical lifestyle or self-care tips.
    -You can suggest food names  which can support during this condition -Also suggest Local(Nepali) food
    - Only suggest good foods, you donot have to specify the time to have food
    - Give many options for food considering both permanent and daily data which may be helpful(Put that in context )
    - For lifestyle and self-care tips, give relevant tips considering daily data.
    - Never use unwanted asterisk  and any unwanted symbol everywhere

    🌼 Encouragement
    You're doing great! Remember to listen to your body and prioritize self-care.

    🩺  Medical Attention
    🩺 Medical Attention
    - If today’s flow is logged but the phase is not menstrual (e.g., bleeding during follicular, ovulatory, or early luteal), then:
    "You may be experiencing irregular bleeding. If this continues or worsens, it’s a good idea to consult a doctor."
    - If flow is heavy and symptoms like severe cramps or dizziness are also present, then:
    "Since you’re having heavy flow and strong symptoms, please consider seeking medical help if it doesn’t improve."
    - If user has a permanent condition (like PCOS, endometriosis, etc.) and logs any unusual symptoms, then:
    "Because of your known condition, any irregular symptoms should be discussed with your doctor for safety."
    - Do **not print this section** if everything is normal and within expected menstrual phase.
    Suggest user to visit doctor if any emergency or attention is required in short and sweet 
    - Clear output without unwanted symbols and in very structured and clear form
    '''



        return prompt
    
