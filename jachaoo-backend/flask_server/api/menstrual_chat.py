from flask import Blueprint, request, jsonify
from services.menstrual_chat_service import menstrual_chatbot

chat_bp = Blueprint('menstrual_chat', __name__)

@chat_bp.route('/send', methods=['POST'])
def handle_chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'success': False, 'error': 'Message is required'}), 400
        
        # Extract and format data
        message = data.get('message', '').strip()
        chat_history = data.get('chat_history', [])
        user_context = data.get('user_context', {})
        
        # Convert previous_conditions to list if needed
        prev_conditions = user_context.get('previous_conditions', '')
        if isinstance(prev_conditions, str):
            prev_conditions = [c.strip() for c in prev_conditions.split(',') if c.strip()]
        
        # Call the chatbot
        response = menstrual_chatbot(
            user_query=message,
            chat_history=chat_history,
            duration_of_period=str(user_context.get('duration_of_period', '5')),
            cycle_length=str(user_context.get('cycle_length', '28')),
            previous_conditions=prev_conditions,
            trying_to_conceive=bool(user_context.get('trying_to_conceive', False)),
            on_hormonal_contraceptive=bool(user_context.get('on_hormonal_contraceptive', False)),
            first_day_of_last_period=user_context.get('first_day_of_last_period', '2025-01-01'),
            current_cycle_phase=user_context.get('current_cycle_phase', 'Unknown')
        )
        
        # Update and return chat history
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