"""
AI Detection Backend Server
===========================
Uses HuggingFace's roberta-base-openai-detector model to detect AI-generated text.

Installation:
    pip install flask flask-cors transformers torch PyPDF2 python-docx Pillow pytesseract

Run:
    python ai-detection-backend.py

API Endpoint:
    POST /api/detect
    Body: { "text": "your text here" }
    Response: { "prediction": "...", "confidence": 95.5, "ai_score": 95.5, "human_score": 4.5, "label": "Fake" }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import os
import re

# Optional imports for file processing
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("⚠️  PyPDF2 not installed. PDF support disabled.")

try:
    import docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False
    print("⚠️  python-docx not installed. DOCX support disabled.")

try:
    from PIL import Image
    import pytesseract
    OCR_SUPPORT = True
except ImportError:
    OCR_SUPPORT = False
    print("⚠️  Pillow/pytesseract not installed. Image OCR support disabled.")


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize the AI detection model
print("🔄 Loading AI detection model (roberta-base-openai-detector)...")
print("   This may take a few minutes on first run...")

try:
    detector = pipeline(
    "text-classification",
    model="roberta-base-openai-detector",
    device=-1
)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    detector = None


def analyze_text_metrics(text):
    """Analyze text for additional metrics"""
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Unique words ratio (vocabulary diversity)
    unique_words = set(word.lower() for word in words if word.isalpha())
    vocab_diversity = len(unique_words) / len(words) * 100 if words else 0
    
    # Average word length
    avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
    
    # Average sentence length
    avg_sentence_length = len(words) / len(sentences) if sentences else 0
    
    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "vocab_diversity": round(vocab_diversity, 1),
        "avg_word_length": round(avg_word_length, 1),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "character_count": len(text)
    }


def detect_ai(text):
    """
    Detect if text is AI-generated or human-written.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        dict: Detection results with prediction, confidence, and scores
    """
    if detector is None:
        return {
            "error": "Model not loaded. Please restart the server.",
            "prediction": "Error",
            "confidence": 0,
            "ai_score": 0,
            "human_score": 0
        }
    
    if not text or len(text.strip()) < 50:
        return {
            "error": "Text too short. Please provide at least 50 characters.",
            "prediction": "Error",
            "confidence": 0,
            "ai_score": 0,
            "human_score": 0
        }
    
    try:
        # Model works best with text under 512 tokens
        # Process in chunks if text is longer
        text_to_analyze = text[:512]
        
        result = detector(text_to_analyze)[0]
        
        label = result["label"]
        score = result["score"]
        
        # "Fake" = AI Generated, "Real" = Human Written
        if label == "Fake":
            prediction = "AI Generated"
            ai_score = round(score * 100, 2)
            human_score = round((1 - score) * 100, 2)
        else:
            prediction = "Human Written"
            human_score = round(score * 100, 2)
            ai_score = round((1 - score) * 100, 2)
        
        # Get text metrics
        metrics = analyze_text_metrics(text)
        
        # Determine verdict
        if ai_score >= 70:
            verdict = "high_ai"
            verdict_text = "High likelihood of AI-generated content"
        elif ai_score >= 40:
            verdict = "mixed"
            verdict_text = "Mixed content - possibly AI-assisted"
        else:
            verdict = "human"
            verdict_text = "Likely human-written content"
        
        return {
            "success": True,
            "prediction": prediction,
            "confidence": round(score * 100, 2),
            "ai_score": ai_score,
            "human_score": human_score,
            "label": label,
            "verdict": verdict,
            "verdict_text": verdict_text,
            "metrics": metrics
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "prediction": "Error",
            "confidence": 0,
            "ai_score": 0,
            "human_score": 0
        }


def extract_text_from_file(file):
    """Extract text from uploaded file"""
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.txt'):
            return file.read().decode('utf-8')
        
        elif filename.endswith('.pdf'):
            if not PDF_SUPPORT:
                return None, "PDF support not available. Install PyPDF2."
            
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        
        elif filename.endswith('.docx'):
            if not DOCX_SUPPORT:
                return None, "DOCX support not available. Install python-docx."
            
            doc = docx.Document(file)
            text = "\n".join([para.text for para in doc.paragraphs])
            return text
        
        elif filename.endswith(('.png', '.jpg', '.jpeg')):
            if not OCR_SUPPORT:
                return None, "Image OCR not available. Install Pillow and pytesseract."
            
            image = Image.open(file)
            text = pytesseract.image_to_string(image)
            return text
        
        else:
            return None, "Unsupported file format"
            
    except Exception as e:
        return None, str(e)


# ==================== API ROUTES ====================

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "service": "GradeAI - AI Detection API",
        "model": "roberta-base-openai-detector",
        "endpoints": {
            "POST /api/detect": "Detect AI-generated text",
            "POST /api/detect-file": "Detect AI in uploaded file",
            "GET /api/health": "Health check"
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": detector is not None,
        "pdf_support": PDF_SUPPORT,
        "docx_support": DOCX_SUPPORT,
        "ocr_support": OCR_SUPPORT
    })


@app.route('/api/detect', methods=['POST'])
def detect_endpoint():
    """
    Main AI detection endpoint.
    
    Expects JSON body: { "text": "your text here" }
    Returns: Detection results
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field in request body",
                "success": False
            }), 400
        
        text = data['text']
        
        if not text or len(text.strip()) < 50:
            return jsonify({
                "error": "Text must be at least 50 characters long",
                "success": False
            }), 400
        
        result = detect_ai(text)
        
        if "error" in result and result.get("prediction") == "Error":
            return jsonify(result), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@app.route('/api/detect-file', methods=['POST'])
def detect_file_endpoint():
    """
    AI detection endpoint for file uploads.
    
    Expects: multipart/form-data with 'file' field
    Returns: Detection results
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                "error": "No file uploaded",
                "success": False
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "success": False
            }), 400
        
        # Extract text from file
        text = extract_text_from_file(file)
        
        if isinstance(text, tuple):
            # Error occurred
            return jsonify({
                "error": text[1],
                "success": False
            }), 400
        
        if not text or len(text.strip()) < 50:
            return jsonify({
                "error": "Could not extract enough text from file (minimum 50 characters)",
                "success": False
            }), 400
        
        result = detect_ai(text)
        result["extracted_text_preview"] = text[:500] + "..." if len(text) > 500 else text
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


# ==================== MAIN ====================

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 GradeAI - AI Detection Server")
    print("="*50)
    print(f"📡 Server running at: http://localhost:5001")
    print(f"📝 API Endpoint: POST http://localhost:5001/api/detect")
    print(f"📁 File Upload: POST http://localhost:5001/api/detect-file")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
