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
api_key = os.getenv("GENAI_API_KEY2")

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
def lab_report_analysis(cloudinary_url):
    try:
        image_path = download_image_to_temp(cloudinary_url)
        clean_result = ocr_function(model , image_path)
        clean_result = clean_result.replace("```json", "").replace("```", "").strip()

        data = json.loads(clean_result)
        extracted = {
        "age": data["patient_info"].get("age"),
        "sex": data["patient_info"].get("sex"),
        "lab_results": data.get("lab_results", [])
        }
        genai.configure(api_key="AIzaSyAKvz5Gt9W3hAuFUPbFQ4huvXkAQzydA0c")
        model2 = genai.GenerativeModel("models/gemini-1.5-flash")

        eng_prompt1 = f"""
        You are a professional health and fitness advisor.

        Your task is to analyze the lab report provided below and generate a clean, well-structured report with medical insights and practical advice. The format should be professional and easy to read. Do not use asterisks, emojis, or markdown symbols.

        Follow this structure exactly:

        1. Lab Report Analysis

        - For each test, output a single line in this format:
        Test Name – Result – Human-friendly interpretation

        Example:
        Sodium – 138 mmol/L – Level is within normal range
        Creatinine – 1.4 mg/dL – Slightly elevated, monitor kidney function
        Hemoglobin – 10.2 g/dL – Low, possible sign of anemia

        Keep each line short, clear, and medically accurate.

        2. Personalized Diet Plan

        Breakfast:
        - Provide a detailed, point-wise description of a complete meal
        - Include specific food items, portion sizes (e.g., 1 cup oatmeal), and nutritional benefits relevant to the lab findings
        - Explain briefly why these foods are suitable or beneficial for the patient’s condition

        Lunch:
        - Same detail as breakfast with diverse, healthy food choices
        - Include preparation suggestions if relevant (e.g., grilled, steamed)
        - Explain how this meal supports the patient's health status based on lab data

        Dinner:
        - Detailed, balanced meal plan
        - Focus on lighter, easy-to-digest foods
        - Include specific items, portion sizes, and the rationale for inclusion

        Additional Diet Tips:
        - Provide 2–3 clear dietary recommendations to follow or avoid based on the lab results

        3. Exercise Recommendations

        - State the primary goal of the exercise plan (e.g., manage blood sugar, support kidney health)
        - Morning:
        - Activity type, duration, intensity, and expected benefits
        - Evening:
        - Relaxation or flexibility exercises with detailed examples
        - Weekly Plan:
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

        - If any value is abnormal or concerning, state it clearly with the name, value, and why it matters
        - Recommend professional follow-up (e.g., nephrologist, endocrinologist)
        - Keep the tone calm and helpful, not alarming

        Lab Report:
        \"\"\"
        {extracted}
        \"\"\"

        Rules:
        - Do not use asterisks, emojis, markdown, or symbols
        - Leave space between sections and bullet points
        - Be accurate and base all advice on the provided lab data only
        - Use clear headings and bullet points to organize information
        """
        
        eng_prompt = f"""
        You are a professional health and fitness advisor.

        Your task is to analyze the lab report provided below and generate a clean, well-structured report with medical insights and practical advice. The format should be professional and easy to read. Do not use asterisks, emojis, or markdown symbols.

        Follow this structure exactly:

        1. Lab Report Analysis


        - For each test, output a single line in this format:
        Test Name – Human-friendly interpretation

        Example:
        Sodium – Level is within normal range
        Creatinine – Slightly elevated, monitor kidney function
        Hemoglobin – Low, possible sign of anemia

        Keep each line short, clear, and medically accurate.

        2. Personalized Diet Plan


        Breakfast:

        - Provide a detailed, point-wise description of a complete meal
        - Include specific food items, portion sizes (e.g., 1 cup oatmeal), and nutritional benefits relevant to the lab findings
        - Explain briefly why these foods are suitable or beneficial for the patient’s condition

        Lunch:

        - Same detail as breakfast with diverse, healthy food choices
        - Include preparation suggestions if relevant (e.g., grilled, steamed)
        - Explain how this meal supports the patient's health status based on lab data

        Dinner:

        - Detailed, balanced meal plan
        - Focus on lighter, easy-to-digest foods
        - Include specific items, portion sizes, and the rationale for inclusion

        Additional Diet Tips:

        - Provide 2–3 clear dietary recommendations to follow or avoid based on the lab results

        3. Exercise Recommendations


        - State the primary goal of the exercise plan (e.g., manage blood sugar, support kidney health)

        Morning:

        - Activity type, duration, intensity, and expected benefits

        Evening:

        - Relaxation or flexibility exercises with detailed examples

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


        - If any value is abnormal or concerning, state it clearly with the name, and why it matters
        - Recommend professional follow-up (e.g., nephrologist, endocrinologist)
        - Keep the tone calm and helpful, not alarming

        Lab Report:
        \"\"\"
        {extracted}
        \"\"\"

        Rules:
        - Do not use asterisks, emojis, markdown, or symbols
        - Leave space between sections and bullet points
        - Leave two line spaces after each main heading
        - Leave one line space after each subheading
        - Be accurate and base all advice on the provided lab data only
        - Use clear headings and bullet points to organize information
        """


        eng_prompt2 = f"""
        You are a professional health and fitness advisor.

        Your task is to analyze the lab report provided below and generate a clean, well-structured report with medical insights and practical advice. The format should be professional and easy to read. Do not use asterisks, emojis, or markdown symbols.

        Follow this structure exactly:

        1. Lab Report Analysis

        - For each test, output a single line in this format:
        Test Name (value) – Human-friendly interpretation

        Example:
        Sodium (140 mmol/L) – Level is within normal range
        Creatinine (1.3 mg/dL) – Slightly elevated, monitor kidney function
        Hemoglobin (12.4 g/dL) – Low, possible sign of anemia

        Keep each line short, clear, and medically accurate.

        2. Personalized Diet Plan

        Breakfast:

        - Provide a detailed, point-wise description of a complete meal
        - Include specific food items, portion sizes (e.g., 1 cup oatmeal), and nutritional benefits relevant to the lab findings
        - Explain briefly why these foods are suitable or beneficial for the patient’s condition

        Lunch:

        - Same detail as breakfast with diverse, healthy food choices
        - Include preparation suggestions if relevant (e.g., grilled, steamed)
        - Explain how this meal supports the patient's health status based on lab data

        Dinner:

        - Detailed, balanced meal plan
        - Focus on lighter, easy-to-digest foods
        - Include specific items, portion sizes, and the rationale for inclusion

        Additional Diet Tips:

        - Provide 2–3 clear dietary recommendations to follow or avoid based on the lab results

        3. Exercise Recommendations

        - State the primary goal of the exercise plan (e.g., manage blood sugar, support kidney health)

        Morning:

        - Activity type, duration, intensity, and expected benefits

        Evening:

        - Relaxation or flexibility exercises with detailed examples

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

        - If any value is abnormal or concerning, state it clearly with the name, and why it matters

        - Recommend professional follow-up (e.g., nephrologist, endocrinologist)

        - Keep the tone calm and helpful, not alarming

        Lab Report:
        \"\"\"
        {extracted}
        \"\"\"

        Rules:
        - Do not use asterisks, emojis, markdown, or symbols
        - Leave space between sections and bullet points
        - Leave two line spaces after each main heading
        - Leave one line space after each subheading
        - Be accurate and base all advice on the provided lab data only
        - Use clear headings and bullet points to organize information

        Output the entire response as a JSON object with keys:

        {{
        "lab_report_analysis": "...",

        "personalized_diet_plan": {{

            "breakfast": "...",

            "lunch": "...",

            "dinner": "...",

            "additional_diet_tips": ["...", "..."]
        }},

        "exercise_recommendations": {{

            "primary_goal": "...",

            "morning": "...",

            "evening": "...",

            "weekly_plan": "..."
        }},

        "lifestyle_improvements": ["...", "...", "...", "...", "...", "..."],

        "important_health_notes": "..."
        }}
        """


        nep_prompt = f"""
        तपाईं एक व्यावसायिक स्वास्थ्य र फिटनेस सल्लाहकार हुनुहुन्छ।

        तल दिइएको ल्याब रिपोर्टको विश्लेषण गरी एक सफा, राम्ररी संरचित रिपोर्ट तयार गर्नुहोस् जसमा चिकित्सकीय जानकारी र व्यावहारिक सल्लाहहरू समावेश गरियोस्। ढाँचा व्यावसायिक र सजिलै पढ्न मिल्ने हुनुपर्छ। कृपया तारांकन चिन्ह (*), इमोजीहरू, वा मार्कडाउन प्रतीकहरू प्रयोग नगर्नुहोस्।

        यस संरचनालाई ठीक त्यस्तै पालना गर्नुहोस्:

        १. ल्याब रिपोर्ट विश्लेषण

        - प्रत्येक परीक्षणका लागि एउटा पंक्तिमा यसरी लेख्नुहोस्:
        परीक्षण नाम – परिणाम – सरल र बुझ्न मिल्ने व्याख्या

        उदाहरण:
        सोडियम – १३८ mmol/L – स्तर सामान्य दायराभित्र छ
        क्रिएटिनिन – १.४ mg/dL – थोरै बढी, मृगौला स्वास्थ्यको निगरानी आवश्यक
        हिमोग्लोबिन – १०.२ g/dL – कम, सम्भावित एनिमियाको संकेत

        छोटो, स्पष्ट र चिकित्सकीय रूपमा सही राख्नुहोस्।

        २. व्यक्तिगत आहार योजना

        बिहानको खाना:
        - पूर्ण भोजनको बुँदागत विस्तृत विवरण दिनुहोस्
        - विशिष्ट खाना सामग्री, मात्रा (जस्तै १ कप ओटमील) र ल्याब रिपोर्टका आधारमा पोषण लाभ उल्लेख गर्नुहोस्
        - यी खाद्य वस्तुहरू किन उपयुक्त वा लाभदायक छन् संक्षिप्तमा बताउनुहोस्

        दिउँसोको खाना:
        - बिहानको खानाजस्तै विस्तृत र विविध स्वस्थ विकल्पहरू
        - पकाउने तरिका उल्लेख गर्नुहोस् (जस्तै ग्रिल्ड, स्टीम गरिएको)
        - कसरी यो भोजनले स्वास्थ्यमा सहयोग गर्छ भन्ने व्याख्या गर्नुहोस्

        साँझको खाना:
        - सन्तुलित र सजिलै पच्ने भोजन
        - विशिष्ट खाद्य वस्तु, मात्रा र समावेशीकरणको कारण उल्लेख गर्नुहोस्

        थप आहार सुझावहरू:
        - ल्याब रिपोर्ट अनुसार २–३ स्पष्ट सल्लाहहरू (जस्तै सोडियम कम गर्नु, प्रोटिन बढाउनु)

        ३. व्यायाम सिफारिसहरू

        - व्यायाम योजनाको मुख्य उद्देश्य बताउनुहोस् (जस्तै रक्तचिनी नियन्त्रण, मृगौला स्वास्थ्य)
        - बिहान:
        - व्यायाम प्रकार, अवधि, गहनता र अपेक्षित लाभ
        - साँझ:
        - विश्राम वा लचिलोपन सम्बन्धी अभ्यासहरू र उदाहरणहरू
        - साप्ताहिक योजना:
        - ४–५ दिनको विस्तृत तालिका
        - प्रत्येक दिनका गतिविधिहरू (जस्तै सोमबार: ३० मिनेट छिटो हिँडाइ, बुधबार: हल्का तौल प्रशिक्षण)
        - विश्राम वा सक्रिय पुनःस्थापनाका दिनहरू
        - हप्ताहरूमा गहनता वा अवधि बढाउने सुझावहरू
        - कुनै ल्याब परिणामले शारीरिक सहनशीलता कम भएको संकेत गरेमा सावधानी

        ४. जीवनशैली सुधारहरू

        कम्तीमा ६ बुँदा फराकिलो स्थान सहित दिनुहोस्:
        - हाइड्रेशन
        - निद्रा
        - तनाव व्यवस्थापन
        - घाममा बस्नु
        - स्क्रिन टाइम नियन्त्रण
        - आसन र एर्गोनोमिक्स
        - कफी, मदिरा, धुम्रपान सम्बन्धी विचार

        ५. महत्वपूर्ण स्वास्थ्य नोटहरू वा चेतावनीहरू

        - कुनै मान सामान्यभन्दा बाहिर वा चिन्ताजनक भए स्पष्ट रूपमा नाम, मान र कारण उल्लेख गर्नुहोस्
        - पेशेवर अनुगमनको सिफारिस गर्नुहोस् (जस्तै नेफ्रोलोजिस्ट, एन्डोक्रिनोलोजिस्ट)
        - टोन शान्त र सहयोगी राख्नुहोस्, डराउने होइन

        ल्याब रिपोर्ट:
        \"\"\"
        {extracted}
        \"\"\"

        नियमहरू:
        - तारांकन, इमोजी, मार्कडाउन वा अन्य प्रतीक प्रयोग नगर्नुहोस्
        - खण्डहरू र बुँदाबीच ठाउँ राख्नुहोस्
        - सल्लाह मात्र दिइएको ल्याब डेटा अनुसार होस्
        - स्पष्ट शीर्षक र बुँदाहरूको प्रयोग गरी जानकारी व्यवस्थित गर्नुहोस्
        """

        response = model2.generate_content(eng_prompt)
        return response
    except json.JSONDecodeError:
        return {"error": "Failed to parse analysis results"}
    except Exception as e:
        raise Exception(f"Analysis error: {str(e)}")

