from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from services.first_aid import chat_step

first_aid_bp = Blueprint('first_aid', __name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,  # or use a user_id if authenticated
    default_limits=["15 per day", "1 per 5 seconds"]  # 15/day, 1 msg every 5 sec
)

@first_aid_bp.route('/', methods=['POST'])
@limiter.limit("5 per minute")
def handle_first_aid():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    session_id = data.get('session_id', 'default')  # Default session if none provided
    
    if not user_input:
        return jsonify({'error': 'Message cannot be empty'}), 400
    
    try:
        reply = chat_step(user_input, session_id)
        return jsonify({
            'reply': reply,
            'status': 'success',
            'session_id': session_id
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@first_aid_bp.route('/reset', methods=['POST'])
def reset_chat():
    session_id = request.get_json().get('session_id', 'default')
    try:
        from services.first_aid import reset_conversation
        reset_conversation(session_id)
        return jsonify({
            'status': 'success',
            'message': 'Conversation reset',
            'session_id': session_id
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500