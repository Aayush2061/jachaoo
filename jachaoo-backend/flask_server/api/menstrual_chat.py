from flask import Blueprint, request, jsonify
from services.menstrual_chat.chat_service import MenstrualChatService

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
        chat_history = data.get('chat_history', [])
        user_context = data.get('user_context', {})

        # print("Received request data:", data) 
        # print("User context received:", user_context)

        if not message:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        if not user_context:
            return jsonify({'success': False, 'error': 'User context is required'}), 400

        # Add user message to history
        chat_history.append({
            "role": "user",
            "parts": [{"text": message}]
        })

        # Get bot response
        response = chat_service.get_response(
            user_query=message,
            chat_history=chat_history,
            user_context=user_context
        )

        # Add bot response to history
        chat_history.append({
            "role": "model",
            "parts": [{"text": response}]
        })

        return jsonify({
            'success': True,
            'response': response,
            'chat_history': chat_history
        })

    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500