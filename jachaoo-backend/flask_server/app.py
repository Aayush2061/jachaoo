from flask import Flask
from flask_cors import CORS
from api.first_aid import first_aid_bp
from api.reports import reports_bp
from api.menstrual_chat import chat_bp as menstrual_chat_bp
from api.daily_analysis import daily_bp
from api.symptoms import symptoms_bp # v1 (existing)
from api.symptoms_v2 import symptoms_v2_bp  # v2 (new)
from api.mental_health_chat import mental_chat_bp  

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration (you can move these to config.py later)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB upload limit
app.config['JSON_SORT_KEYS'] = False

# Register blueprints
app.register_blueprint(first_aid_bp, url_prefix='/api/firstaid')
app.register_blueprint(reports_bp, url_prefix='/api/reports')
app.register_blueprint(menstrual_chat_bp,url_prefix='/api/menstrual-chat')
app.register_blueprint(daily_bp,url_prefix='/api/daily-analysis')
app.register_blueprint(symptoms_bp, url_prefix='/api/symptoms')        #v1
app.register_blueprint(symptoms_v2_bp, url_prefix='/api/v2/symptoms')  # v2
app.register_blueprint(mental_chat_bp, url_prefix='/api/mental-chat')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)