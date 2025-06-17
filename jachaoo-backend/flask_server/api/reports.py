from flask import Blueprint, request, jsonify
from services.report_analysis import analyze_medical_report

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/analyze', methods=['POST'])
def analyze_report():
    """Endpoint for analyzing medical reports"""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    image_url = data.get('url')
    
    if not image_url:
        return jsonify({'error': 'Image URL is required'}), 400
    
    try:
        analysis_result = analyze_medical_report(image_url)
        return jsonify(analysis_result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500