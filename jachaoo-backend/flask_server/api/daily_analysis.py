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

        # Validate daily notes length
        if 'dailyNote' in daily_data and len(daily_data.get('dailyNote', '')) > 300:
            return jsonify({
                'error': 'Daily notes cannot exceed 500 characters'
            }), 400
        
         # Validate daily Temperature length
        if 'bodyTemp' in daily_data and len(daily_data.get('bodyTemp', '')) > 10:
            return jsonify({
                'error': 'Temperature cannot exceed 10 characters'
            }), 400
        
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