# api/mental_health_chat.py
from flask import Blueprint, request, jsonify
from services.mental_health_chat_service import mental_health_chatbot

mental_chat_bp = Blueprint('mental_chat', __name__)

@mental_chat_bp.route('/send', methods=['POST'])
def handle_mental_chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        
        # Extract data
        message = data.get('message', '').strip()
        chat_history = data.get('chat_history', [])
        user_context = data.get('user_context', {})

        print(user_context)
        
        # Call the chatbot
        response = mental_health_chatbot(
            user_query=message,
            chat_history=chat_history,
            diagnosed_condition=user_context.get('diagnosed'),
            support_system=user_context.get('support'),
            frequency=user_context.get('frequency'),
            goals=user_context.get('goals', [])
        )
        
        # Update chat history
        updated_history = chat_history + [
            {"role": "user", "parts": [{"text": message}]},
            {"role": "model", "parts": [{"text": response}]}
        ]
        
        return jsonify({
            'success': True,
            'response': response,
            'chat_history': updated_history
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': "We encountered an error processing your request"
        }), 500