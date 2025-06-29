from flask import Blueprint, request, jsonify
from datetime import datetime
from services.daily_cycle.daily_service import DailyCycleService

daily_bp = Blueprint('daily_analysis', __name__, url_prefix='/api/daily-analysis')
daily_service = DailyCycleService()

@daily_bp.route('/', methods=['POST'])
def analyze_daily_data():
    try:
        data = request.json
        
        # Validate required data
        if not data or 'permanent_data' not in data or 'daily_data' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        permanent_data = data['permanent_data']
        daily_data = data['daily_data']
        
        # Perform analysis
        result = daily_service.analyze(permanent_data, daily_data)
        
        return jsonify({
            'success': True,
            'result': result,
            'date': datetime.now().strftime('%Y-%m-%d')
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500