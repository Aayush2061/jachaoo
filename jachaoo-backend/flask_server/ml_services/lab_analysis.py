# -*- coding: utf-8 -*-

import json
import google.generativeai as genai
#import nbimporter
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

import os
from ml_services.ocr import ocr_function

# Load variables from .env file
load_dotenv()

# Get the API key from the environment
api_key = os.getenv("FINAL_API_KEY")

genai.configure(api_key=api_key)
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")

def download_image_to_temp( cloudinary_url):
    # Step 1: Download image into memory
    response = requests.get(cloudinary_url)
    if response.status_code != 200:
        raise Exception("Failed to download image")

    image_file = BytesIO(response.content)

    # Step 2: Load image using PIL (if your OCR model supports PIL.Image)
    image = Image.open(image_file)
    return image
    
#model set up pani kam bhayo yeha samma aauda chai
def lab_report_analysis(cloudinary_url,health_data = None):
    try:
        image_path = download_image_to_temp(cloudinary_url)
        clean_result = ocr_function(model , image_path)
        clean_result = clean_result.replace("```json", "").replace("```", "").strip()

    except Exception as e:
        print("Error loading or processing image:", e)
        return "Error: Unable to read the image."       

    try:
        data = json.loads(clean_result)

        if "warning" in data:
            return "Invalid image! Please send lab reports only."
        
        extracted = {
        "age": data["patient_info"].get("age"),
        "sex": data["patient_info"].get("sex"),
        "lab_results": data.get("lab_results", [])
        }

        genai.configure(api_key= api_key)
        model2 = genai.GenerativeModel("models/gemini-1.5-flash")

        print(health_data)
        
        # Use provided health data or default values
        diabetes = health_data.get('diabetes', "Don't know") if health_data else "Don't know"
        hypertension = health_data.get('hypertension', "Don't know") if health_data else "Don't know"
        smoker = health_data.get('smoker', "Don't know") if health_data else "Don't know"
        
        eng_prompt = f"""
You are a professional health and fitness advisor.
If the provided input is not a valid lab report then respond with 
"Invalid image! Please send lab reports only."

Your task is to analyze the lab report provided below and generate a clean, well-structured report with medical insights and practical advice. The format should be professional and easy to read. Do not use asterisks, emojis, or markdown symbols.Use simple words not heavy words.

Follow this structure exactly:

1. Lab Report Analysis

- For each test, output a short line in this format:
Test Name – Human-friendly interpretation

- Interpret values specifically based on clinical relevance, severity, and combinations with other test results. Avoid generic phrases like “normal” or “low” unless fully appropriate.
- Ensure different lab results lead to clearly different interpretations.

Example:
Sodium – Level is within normal range  
Creatinine – Slightly elevated, monitor kidney function  
Hemoglobin – Low, possible sign of anemia

Keep each line short, clear, and medically accurate.

- Study the report, analyze the value of the test result and go for the suggestion
- In Exercise section, you can go for the Yoga, Meditation and Breathing give steps in details if you suggest and benefits  in structured way
- In food you can give, food options which can be added on the daily food of the user


2. Personalized Diet Plan

- While suggesting diet plan in Breakfast, Lunch, Dinner focus food local to Nepal rather than fancy foods along with other foods rather than fancy foods
- Donot go for the same food everytime, after having detail insight in report then only provide suggestions
- Considering providing nepali name in brackets if you feel necessary not in every place for only which may be difficult to understand by average nepali
- Focus on suggesting good foods, nepali origin also 
- Provide a list of options of good local and all foods for the user

Breakfast:

Example:
 - Fruit Salad(Apple, Oranges, watermelon)   
 - Selroti          
 - Nuts(almonds , walnuts)  
 - Tea(Herbal teas)                           
 - Lemon water 
 - Yogurt                                        
 - Boiled eggs(With onions)     
 - Banana
                        
Benefits: In this portion show what benefits can be provided by the food related to the tests and test result in short.

- This is just a example donot paste it to the user 
- Strictly follow this structure
- Provide any meal suggestion after analyzing the report deeply 
- You can suggest some foods to add in existing breakfast like - Add 1 honey in milk
- Suggest relevant options. Example: Dhido is heavy food no one eats in breakfast
-Provide around 10 - 12 options of food items as described in above format 

Lunch:

- Same detail as breakfast with diverse, healthy food choices
- Also provide foods that can be locally available and give varities so user can have options
- Provide more options for lunch also like 10 - 12 options

Dinner:

- Just like in breakfast provide 10 - 12 options in format mentioned in breakfast
- Provide more options for the dinner also
- Focus on lighter, easy-to-digest foods
- You can also provide some dessert options according to the lab report result

Additional Diet Tips:

- Provide 2–3 clear dietary recommendations to follow or avoid based on the lab results

3. Exercise Recommendations

- State the primary goal of the exercise plan (e.g., manage blood sugar, support kidney health)

Morning:

- Activity type, duration, intensity, and expected benefits
- While suggesting Yoga or Meditaion provide steps how to perform in steps in each line basis and benefits ex:

Example:
1) Balasana
    - Sit on your knees.
    - Bend forward and touch your forehead to the floor.
    - Stretch your hands forward or keep them near your legs.
    - Close your eyes and breathe slowly.
    - Stay in this position for a while.
    - Slowly come back up.
    Benefits:
    - Relieves stress & anxiety
    - Reduce backpain and tension

- Strictly follow this structure while suggesting Yoga and donot paste balasana everytime provide relevant Yoga, Breathing and Meditation.While suggesting use lines wise comma technique to show clean information.
- Give Meditation options also in the exact same format above in example
- After suggesting each yoga or breathing or meditation provide a line space and go for another options to show clear result


Evening:

- Relaxation or flexibility exercises with detailed examples
- Provide information as you provided in Morning in details

Weekly Plan:

- Outline a detailed 4–5 day exercise schedule
- Include specific activities for each day (e.g., Monday: 30 min brisk walk, Wednesday: strength training with light weights)
- Mention rest or active recovery days
- Provide advice on how to gradually increase intensity or duration over weeks
- Add caution if any lab result suggests reduced physical tolerance or limitations

4. Lifestyle Improvements

Provide at least 6 bullet points with spacing:
- Hydration
- Sleep
- Stress reduction
- Sunlight exposure
- Screen time
- Posture and ergonomic care
- Caffeine/alcohol/smoking considerations

5. Important Health Notes or Warnings
- Provide short and simple 
- If any value is abnormal or concerning, state it clearly with the name, and why it matters
- Recommend professional follow-up (e.g., nephrologist, endocrinologist)
- Keep the tone calm and helpful, not alarming 

The user has shared the following existing health conditions:

- Diabetes: {diabetes}
- High Blood Pressure: {hypertension}
- Smoker: {smoker}

Use this health history to guide your recommendations.
Lab Report:
\"\"\" 
{extracted}
\"\"\"


Rules:
- 
- Strictly follow the above structure
- Do not use asterisks, emojis, markdown, or symbols
- Leave space between sections and bullet points
- Leave two line spaces after each main heading
- Leave one line space after each subheading
- Be accurate and base all advice on the provided lab data only
- Use clear headings and bullet points to organize information
- Ensure that **interpretations and advice vary noticeably** depending on the values and the condition shown in the report. Avoid repeating phrasing from one report to another if the context changes.
"""

        response = model2.generate_content(eng_prompt)
        return response
    except json.JSONDecodeError:
        return {"error": "Failed to parse analysis results"}
    except Exception as e:
        raise Exception(f"Analysis error: {str(e)}")
