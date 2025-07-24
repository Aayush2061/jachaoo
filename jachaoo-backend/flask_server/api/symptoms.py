from flask import Blueprint, request, jsonify
from services.symptoms import MedicalDiagnosisSystem
import uuid
MAX_INPUT_LENGTH = 300

symptoms_bp = Blueprint('symptoms', __name__)

# Store active sessions
active_sessions = {}

@symptoms_bp.route('/start', methods=['POST'])
def start_diagnosis():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
            
        session_id = str(uuid.uuid4())
        system = MedicalDiagnosisSystem(
            data.get("smoker", "No"),
            data.get("diabetes", "No"),
            data.get("blood_pressure", "No")
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

@symptoms_bp.route('/answer', methods=['POST'])
def answer_question():
    data = request.json
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