from ml_services.lab_analysis import lab_report_analysis
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_medical_report(image_url,health_data=None):
    try:
        logger.info(f"Starting analysis for image: {image_url[:50]}...")
        
        # Call ML service for analysis
        analysis = lab_report_analysis(image_url, health_data)
        
        # Return structured response
        return {
            'status': 'success',
            'analysis': analysis.text,  # The Gemini response
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        return {
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }