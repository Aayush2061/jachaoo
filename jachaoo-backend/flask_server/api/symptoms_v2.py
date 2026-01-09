from flask import Blueprint, request, jsonify
from services.symptoms_v2 import MedicalDiagnosisSystem
import uuid
MAX_INPUT_LENGTH = 300


# # At the top of symptoms.py
# import logging
# logging.basicConfig(level=logging.DEBUG)

symptoms_v2_bp = Blueprint('symptoms_v2', __name__)

# Store active sessions
active_sessions = {}

@symptoms_v2_bp.route('/start', methods=['POST'])
def start_diagnosis():
    try:
        data = request.get_json()

        # logging.info(f"Received start request: {data}")  # ADD THIS

        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        session_id = str(uuid.uuid4())
        system = MedicalDiagnosisSystem(
            data.get("sex", "male"),
            data.get("age", 30),
            data.get("weight", 70),
            data.get("diabetes","Don't know" ),
            data.get("blood_pressure","Don't know"),
            data.get("illness",[]),
            data.get("other_illness",""),
            data.get("smoker","Don't know"),
        )
        
        active_sessions[session_id] = system
        
        return jsonify({
            "status": "ready_for_symptoms",
            "message": "Please describe your main symptom.",
            "session_id": session_id
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to start diagnosis"
        }), 500

@symptoms_v2_bp.route('/answer', methods=['POST'])
def answer_question():
    data = request.json

    # logging.info(f"Received answer request: {data}")  # ADD THIS
    
    session_id = data.get("session_id")
    user_input = data.get("answer")

      # Add input length validation
    if user_input and len(user_input) > MAX_INPUT_LENGTH:
        return jsonify({
            "error": f"Input exceeds maximum length of {MAX_INPUT_LENGTH} characters",
            "message": "Please shorten your response"
        }), 400
    
    system = active_sessions.get(session_id)
    if not system:
        return jsonify({"error": "Invalid or expired session ID"}), 400

    result = system.process_response(user_input)
    
   # Add more conditions to detect final diagnosis
    if ("Assessment Result" in result or 
        "Three likely conditions" in result or
        "MEDICAL ASSESSMENT REPORT" in result or
        "[End of Report]" in result):
        del active_sessions[session_id]
        return jsonify({
            "diagnosis": result,
            "session_over": True
        })
    
    return jsonify({
        "question": result.split('\n')[0] if '\n' in result else result,
        "options": system.current_options,
        "session_over": False
    })