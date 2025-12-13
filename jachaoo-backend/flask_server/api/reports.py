from flask import Blueprint, request, jsonify
from services.report_analysis import analyze_medical_report
import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/analyze', methods=['POST'])
def analyze_report():
    """Enhanced endpoint for analyzing medical reports"""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    image_url = data.get('url')
    report_id = data.get('report_id')  # For re-analyzing existing reports
    
    if not image_url:
        return jsonify({'error': 'Image URL is required'}), 400
    
    try:
        # Get health data from request
        health_data = {
            'diabetes': data.get('diabetes', "Don't know"),
            'hypertension': data.get('hypertension', "Don't know"),
            'smoker': data.get('smoker', "Don't know"),
            'sex': data.get('sex', ""),
            'age': data.get('age', ""),
            'weight': data.get('weight', ""),
            'illnesses': data.get('illnesses', []),
            'other_illness': data.get('other_illness', "")
        }
        
        analysis_result = analyze_medical_report(image_url, health_data)
        
        # Add timestamp and report_id if available
        analysis_result['timestamp'] = datetime.datetime.utcnow().isoformat()
        if report_id:
            analysis_result['report_id'] = report_id
            
        return jsonify(analysis_result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500