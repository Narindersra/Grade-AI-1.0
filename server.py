"""
GradeAI – Handwritten Answer Grader Backend
============================================
A Flask backend that uses Google Gemini AI to grade handwritten answers.

Requirements:
    pip install flask flask-cors google-generativeai pillow

Usage:
    python server.py

API Endpoints:
    GET  /        - Health check
    POST /evaluate - Grade a handwritten answer
"""

import os
import base64
import io
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# Import Google Generative AI
import google.generativeai as genai

# ============================================
# CONFIGURATION
# ============================================

# API Key - Set your API key here or use environment variable
# Option 1: Set directly (not recommended for production)
GEMINI_API_KEY = "AIzaSyDQu2YPBDfoCEqZUs33gL-TXVlyTKOH8R4"

# Option 2: Use environment variable (recommended)
# Set environment variable: export GEMINI_API_KEY="AIzaSyDQu2YPBDfoCEqZUs33gL-TXVlyTKOH8R4"
# Then uncomment the line below:
# GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDQu2YPBDfoCEqZUs33gL-TXVlyTKOH8R4")

# Model Configuration
GEMINI_MODEL = "gemini-3-flash-preview"  # Use the latest Gemini Pro model for best performance

# Flask Configuration
HOST = "0.0.0.0"
PORT = 5000
DEBUG = True

# ============================================
# INITIALIZE FLASK APP
# ============================================

app = Flask(__name__)

# Enable CORS for all routes and origins (for local development)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ============================================
# CONFIGURE GEMINI AI
# ============================================

def configure_gemini():
    """Configure the Gemini AI with API key."""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        return True
    except Exception as e:
        print(f"❌ Error configuring Gemini: {e}")
        return False

# ============================================
# HELPER FUNCTIONS
# ============================================

def decode_base64_image(base64_string):
    """
    Decode a base64 image string to PIL Image.
    
    Args:
        base64_string: Base64 encoded image (with or without data URI prefix)
    
    Returns:
        PIL Image object
    """
    try:
        # Remove data URI prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        return image
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


def prepare_image_for_gemini(image):
    """
    Prepare PIL Image for Gemini API.
    
    Args:
        image: PIL Image object
    
    Returns:
        Bytes of the image in JPEG format
    """
    try:
        # Convert to RGB if necessary (handles PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Save to bytes buffer
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        return buffer.getvalue()
    except Exception as e:
        raise ValueError(f"Failed to prepare image: {str(e)}")


def extract_json_from_response(text):
    """
    Extract JSON from Gemini response text.
    
    Args:
        text: Response text from Gemini
    
    Returns:
        Parsed JSON object
    """
    try:
        # Try to find JSON in code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Try to find raw JSON object
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group(0))
        
        # If no JSON found, create a structured response from text
        return None
    except json.JSONDecodeError:
        return None


def create_grading_prompt(question, model_answer, max_marks):
    """
    Create a detailed prompt for Gemini to grade the answer.
    
    Args:
        question: The question being answered
        model_answer: The ideal/model answer
        max_marks: Maximum marks for the question
    
    Returns:
        Formatted prompt string
    """
    prompt = f"""You are an expert educational evaluator and grading assistant. Your task is to evaluate a student's handwritten answer by comparing it with the model answer.

## QUESTION:
{question}

## MODEL ANSWER (Ideal Answer):
{model_answer}

## MAXIMUM MARKS: {max_marks}

## YOUR TASK:
1. First, carefully read and extract the text from the handwritten answer image provided.
2. Compare the student's answer with the model answer.
3. Evaluate based on:
   - Accuracy of content
   - Completeness of the answer
   - Key concepts covered
   - Clarity of explanation
   - Relevance to the question

## GRADING GUIDELINES:
- Award marks proportionally based on how well the student's answer matches the model answer
- Give partial credit for partially correct answers
- Consider the meaning and intent, not just exact wording
- Be fair but maintain academic standards

## REQUIRED OUTPUT FORMAT:
You MUST respond with a valid JSON object in this exact format:
```json
{{
    "extracted_text": "The text you extracted from the handwritten answer",
    "marks_awarded": <number between 0 and {max_marks}>,
    "max_marks": {max_marks},
    "percentage": <percentage score>,
    "feedback": "Detailed feedback explaining the grade",
    "strengths": ["List of things the student did well"],
    "improvements": ["List of areas where the student can improve"],
    "key_points_matched": ["Key concepts from model answer that were covered"],
    "key_points_missed": ["Key concepts from model answer that were missing"]
}}
```

IMPORTANT: 
- Respond ONLY with the JSON object, no additional text
- Ensure marks_awarded is a number, not a string
- Be constructive and encouraging in feedback
- If the handwriting is unclear, make your best interpretation and note it in feedback

Now, analyze the handwritten answer image and provide your evaluation:"""
    
    return prompt


# ============================================
# API ENDPOINTS
# ============================================

@app.route("/", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON message confirming the server is running
    """
    return jsonify({
        "message": "GradeAI Gemini backend is running",
        "status": "healthy",
        "model": GEMINI_MODEL,
        "endpoints": {
            "GET /": "Health check",
            "POST /evaluate": "Evaluate handwritten answer"
        }
    })


@app.route("/evaluate", methods=["POST"])
def evaluate_answer():
    """
    Evaluate a handwritten answer using Gemini AI.
    
    Expected JSON body:
        {
            "question": "The question text",
            "modelAnswer": "The ideal/model answer",
            "maxMarks": 10,
            "image": "base64 encoded image string"
        }
    
    Returns:
        JSON with evaluation results
    """
    try:
        # ---- Step 1: Validate Request ----
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Request must be JSON"
            }), 400
        
        data = request.get_json()
        
        # Check required fields
        required_fields = ["question", "modelAnswer", "maxMarks", "image"]
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        question = data["question"]
        model_answer = data["modelAnswer"]
        max_marks = int(data["maxMarks"])
        image_base64 = data["image"]
        
        # Validate max_marks
        if max_marks <= 0:
            return jsonify({
                "success": False,
                "error": "maxMarks must be a positive number"
            }), 400
        
        # ---- Step 2: Process Image ----
        print("📷 Processing image...")
        try:
            image = decode_base64_image(image_base64)
            image_bytes = prepare_image_for_gemini(image)
            print(f"✅ Image processed: {image.size[0]}x{image.size[1]} pixels")
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 400
        
        # ---- Step 3: Configure Gemini ----
        if not configure_gemini():
            return jsonify({
                "success": False,
                "error": "Failed to configure Gemini AI. Check API key."
            }), 500
        
        # ---- Step 4: Create Prompt ----
        prompt = create_grading_prompt(question, model_answer, max_marks)
        
        # ---- Step 5: Call Gemini API ----
        print("🤖 Calling Gemini API...")
        try:
            model = genai.GenerativeModel(GEMINI_MODEL)
            
            # Create image part for Gemini
            image_part = {
                "mime_type": "image/jpeg",
                "data": image_bytes
            }
            
            # Generate response
            response = model.generate_content([prompt, image_part])
            
            # Get response text
            response_text = response.text
            print(f"✅ Gemini response received: {len(response_text)} characters")
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            return jsonify({
                "success": False,
                "error": f"Gemini API error: {str(e)}"
            }), 500
        
        # ---- Step 6: Parse Response ----
        print("📝 Parsing response...")
        result = extract_json_from_response(response_text)
        
        if result is None:
            # If JSON parsing failed, create a basic response
            print("⚠️ Could not parse JSON, creating basic response")
            result = {
                "extracted_text": "Could not extract text clearly",
                "marks_awarded": 0,
                "max_marks": max_marks,
                "percentage": 0,
                "feedback": response_text,
                "strengths": [],
                "improvements": ["Please try again with a clearer image"],
                "key_points_matched": [],
                "key_points_missed": []
            }
        
        # Ensure marks don't exceed max
        if "marks_awarded" in result:
            result["marks_awarded"] = min(result["marks_awarded"], max_marks)
            result["marks_awarded"] = max(result["marks_awarded"], 0)
        
        # ---- Step 7: Return Success Response ----
        print(f"✅ Evaluation complete: {result.get('marks_awarded', 0)}/{max_marks}")
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500


@app.route("/evaluate", methods=["OPTIONS"])
def evaluate_options():
    """Handle CORS preflight request."""
    return "", 204


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


# ============================================
# MAIN ENTRY POINT
# ============================================

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   ██████╗ ██████╗  █████╗ ██████╗ ███████╗ █████╗ ██╗     ║
    ║  ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██║     ║
    ║  ██║  ███╗██████╔╝███████║██║  ██║█████╗  ███████║██║     ║
    ║  ██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝  ██╔══██║██║     ║
    ║  ╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗██║  ██║██║     ║
    ║   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ║
    ║                                                           ║
    ║           Handwritten Answer Grader Backend               ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    print(f"🚀 Starting GradeAI Backend Server...")
    print(f"📍 Server URL: http://localhost:{PORT}")
    print(f"🤖 AI Model: {GEMINI_MODEL}")
    print(f"🔑 API Key: {'Configured' if GEMINI_API_KEY != 'YOUR_API_KEY_HERE' else '⚠️  NOT SET - Please configure GEMINI_API_KEY'}")
    print(f"\n📋 Available Endpoints:")
    print(f"   GET  /         - Health check")
    print(f"   POST /evaluate - Evaluate handwritten answer")
    print(f"\n{'='*60}\n")
    
    # Run the Flask app
    app.run(host=HOST, port=PORT, debug=DEBUG)
