from flask import Blueprint, request, jsonify
from services.first_aid import chat_step

first_aid_bp = Blueprint('first_aid', __name__)

@first_aid_bp.route('/', methods=['POST'])
def handle_first_aid():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    
    if not user_input:
        return jsonify({'error': 'Message cannot be empty'}), 400
    
    reply = chat_step(user_input)
    return jsonify({'reply': reply, 'status': 'success'})