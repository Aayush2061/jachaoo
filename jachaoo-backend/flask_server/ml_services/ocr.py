import google.generativeai as genai
import os
from PIL import Image
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

api_key = os.getenv("GENAI_API_KEY")

# Set your Gemini API Key
os.environ["GOOGLE_API_KEY"] = api_key

# Configure Gemini with the API key
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Load Gemini 1.5 Flash model
#model1 = genai.GenerativeModel(model_name="gemini-1.5-flash")
#image_path =r"C:\Users\anjil\OneDrive\Desktop\ml work folder\Image folder\urea_img (1).jpg"

def ocr_function(model, img_input):
    # Accept either a file path or a PIL.Image
    if isinstance(img_input, str):
        image = Image.open(img_input)
    elif isinstance(img_input, Image.Image):
        image = img_input
    else:
        raise ValueError("img_input must be a file path (str) or PIL.Image")

    prompt = """
    You are a medical OCR assistant. From this lab report image, extract the patient details, lab test results, and hospital details clearly. Return the result in structured JSON format like this:
    
    {
      "laboratory": {
        "name": "Name of the hospital or lab (if present)",
        "address": "Hospital or lab address (if visible)",
        "phone": "Phone number (if visible)",
        "website": "Website (if visible)",
        "email": "Email (if visible)"
      },
      "patient_info": {
        "name": "Full name (if present)",
        "patient_no": "Patient number (if available)",
        "age": "Age (if available)",
        "sex": "Sex (if available)",
        "date_time": "Date and time (if available)",
        "address": "Patient address (if available)",
        "prescriber": "Name of doctor or prescriber (if mentioned)"
      },
      "lab_results": [
        {
          "test": "Test name",
          "value": "Result value",
          "unit": "Unit (if any)",
          "reference_range": "Normal range (if visible)"
        }
      ]
    }

    If the image is **not a lab report**, Never attempt extraction. Instead, respond with `"warning"` key only like this:


    Rules:
    - Do not guess or fill fields unless clearly visible in the image.
    - Always return structured JSON as shown above, no matter the input.
    - Keep fields empty if data is not present.
    - Extraction from lab report only, avoid Marksheets/transcripts, Receipts/bills, ID cards/passports .
    """

    # Generate response
    response = model.generate_content(
        [prompt, image],
        generation_config={"temperature": 0.2}
    )

    return response.text

#print(ocr_function(model1 , image_path))