from flask import Flask
from flask_cors import CORS
from api.first_aid import first_aid_bp

app = Flask(__name__)
CORS(app)  # Basic CORS setup

# Register routes
app.register_blueprint(first_aid_bp, url_prefix='/api/firstaid')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)