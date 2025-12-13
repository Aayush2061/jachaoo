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
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

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
        model2 = genai.GenerativeModel("models/gemini-2.0-flash")

        # print(health_data)
        
        # Use provided health data or default values
        diabetes = health_data.get('diabetes', "Don't know") if health_data else "Don't know"
        hypertension = health_data.get('hypertension', "Don't know") if health_data else "Don't know"
        smoker = health_data.get('smoker', "Don't know") if health_data else "Don't know"

        # sex = health_data.get('sex', "")
        # age = health_data.get('age', "")
        weight = health_data.get('weight', "")
        illnesses = health_data.get('illnesses', [])
        other_illness = health_data.get('other_illness', "")

        eng_prompt = f"""
You are a professional health and fitness advisor.

If the input says "Invalid report" then respond with:
"Invalid image! Please send lab reports only."

Your task is to analyze the lab report provided below and produce a **clean, concise, and professional report** in the exact structure shown here. Use simple, clear language. Do not use asterisks, emojis, or markdown symbols. Focus on **clarity and readability**.

The report should have these sections:

1. Lab Report Analysis
- List each test in this format: Test Name – Short interpretation , only if some test is abnormal(Check properly all tests,if not inside the range be strict and list them).
- if all tests are normal, write "All test results are within normal ranges."


2. Personalized Diet Plan
- Include Breakfast, Lunch, Dinner sections.
- Provide 5–10 food options for each meal.
- After each meal, add a short “Benefits” line summarizing their health impact.
- Include 2–3 general diet tips based on the lab report.
- Focus on suggesting good foods especially nepali 
- Prefer locally available Nepali foods, include Nepali names in brackets only if needed.

3. Exercise Recommendations
- Morning and Evening sections.
- Include 2–3 exercises with short description.
- Mention duration and benefits.
- Add a weekly plan with number of active, light, and rest days.

4. Lifestyle Improvements
- Provide 5–6 short bullet points (hydration, sleep, stress, sunlight, screen time, smoking/alcohol).

Use the user’s health conditions to guide your advice:
- weight:{weight} kg
- Diabetes: {diabetes}
- High Blood Pressure: {hypertension}
- illnesses: {', '.join(illnesses) if illnesses else 'None'}
- Other illnesses: {other_illness if other_illness else 'None'}
- Smoker: {smoker}

Lab Report:
\"\"\" 
{extracted}
\"\"\"

Rules:
- Follow the sections and headings exactly as above.
- Do not include instructions or explanations inside the report.
- Keep wording simple and medically accurate.
- Leave a line space between sections for readability.
- Only provide the report text — do not add extra commentary.
"""

        response = model2.generate_content(eng_prompt)
        return response
    except json.JSONDecodeError:
        return {"error": "Failed to parse analysis results"}
    except Exception as e:
        raise Exception(f"Analysis error: {str(e)}")
