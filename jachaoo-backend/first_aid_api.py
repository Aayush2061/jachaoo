from flask import Flask, request, jsonify
from first_aid_file import chat_step
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enhanced CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Allow all origins in development
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"]
    }
})

@app.route('/api/firstaid', methods=['POST', 'OPTIONS'])
def handle_first_aid():
    try:
        # Handle OPTIONS request for CORS preflight
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200

        # Get and validate input
        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'No data provided'}), 400

        user_input = data.get('message', '').strip()
        if not user_input:
            logger.error("Empty message received")
            return jsonify({'error': 'Message cannot be empty'}), 400

        logger.info(f"Received message: {user_input}")
        
        # Process the message
        reply = chat_step(user_input)
        
        logger.info(f"Generated reply: {reply[:100]}...")  # Log first 100 chars
        
        return jsonify({
            'reply': reply,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Run the server with better configuration
    app.run(
        host='0.0.0.0',  # Make server publicly available
        port=8000,
        debug=True,  # Only for development
        threaded=True  # Handle multiple requests concurrently
    )