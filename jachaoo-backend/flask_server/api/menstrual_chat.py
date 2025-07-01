from flask import Blueprint, request, jsonify
from services.menstrual_chat.chat_service import MenstrualChatService
import traceback

chat_bp = Blueprint('menstrual_chat', __name__, url_prefix='/api/menstrual-chat')
chat_service = MenstrualChatService()

@chat_bp.route('/init', methods=['POST'])
def init_chat():
    try:
        user_context = request.json.get('user_context')
        chat_history = chat_service.initialize_chat(user_context)
        return jsonify({
            'success': True,
            'chat_history': chat_history
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chat_bp.route('/send', methods=['POST'])
def send_message():
    try:
        data = request.json
        message = data.get('message')
        chat_history = data.get('chat_history', [])  # Don't modify this yet
        user_context = data.get('user_context', {})

        # Get response FIRST (service will handle history)
        response = chat_service.get_response(
            user_query=message,
            chat_history=chat_history,  # Pass original history
            user_context=user_context
        )

        # Now build the updated history to return
        updated_history = chat_history.copy()
        updated_history.append({
            "role": "user",
            "parts": [{"text": message}]
        })
        updated_history.append({
            "role": "model",
            "parts": [{"text": response}]
        })

        return jsonify({
            'success': True,
            'response': response,
            'chat_history': updated_history
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500