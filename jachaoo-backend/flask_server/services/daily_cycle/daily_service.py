import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os
# Load variables from .env file
load_dotenv()

# Get the API key from the environment
api_key = os.getenv("GENAI_API_KEY2")

API_KEY = api_key

class DailyCycleService:
    def __init__(self):
        genai.configure(api_key=API_KEY)  # Use your key
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def analyze(self, permanent_data, daily_data):
        prompt = self.build_prompt(permanent_data, daily_data)
        response = self.model.generate_content(prompt)
        return response.text

    def build_prompt(self, permanent, daily):
        cycle_length = permanent.get("cycleLength", 28)
        period_duration = permanent.get("duration", 4)
        last_period = permanent.get("lastPeriodDate")
        
        try:
            start_date = datetime.strptime(last_period[:10], "%Y-%m-%d")
            today = datetime.today()
            cycle_day = (today - start_date).days + 1

            if cycle_day <= period_duration:
                phase = "Menstrual Phase"
            elif cycle_day <= (cycle_length // 2):
                phase = "Follicular Phase"
            elif cycle_day <= (cycle_length - 14):
                phase = "Ovulation Phase"
            else:
                phase = "Luteal Phase"
        except:
            phase = "Unknown Phase"
            cycle_day = "?"

        prompt = f'''
You are a menstrual health assistant. Given the user's permanent menstrual profile and today's daily tracking data, generate a detailed daily tracking summary in the following structured format in very simple language:

🗓️ Date: {today.strftime('%B %d, %Y')}
📍 Cycle Day: {cycle_day} of {phase}
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
List symptoms from: {daily.get('symptoms', [])}
Mention if any match conditions: {permanent.get('conditions', [])} if donot match then donot print this line

🧠 Mood Check
Moods Logged: {daily.get('moods', [])}
Give likely hormonal cause in short and simple.

Provide mental health tip in points With Heading - "Mental Health Tips"
- use points and provide practical tips 

🔍 What This Means Today
Give in points daily context using both sets of data.
- Don't give long points, just short and sweet 
- Give one point helping user considering the daily note: "{daily.get('dailyNote')}"

📌 Today’s Recommendations
Give 4–5 practical lifestyle or self-care tips.
- You can suggest food names which can support during this condition
- Also suggest Local(Nepali) food
- Only suggest good foods
- Give some options for food considering both permanent and daily data
- For lifestyle and self-care tips, give relevant tips considering daily data

🌼 Encouragement
You're doing great! Remember to listen to your body and prioritize self-care.

🩺 Medical Attention
Suggest user to visit doctor if any emergency or attention is required in short and sweet 
Donot print this portion if there is no condition for medical attention
    '''
        return prompt