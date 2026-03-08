# Grade-AI-1.0
This is AI project for Teacher.

# 🎓 GradeAI – Intelligent Answer Grading Platform

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Python-3.9+-yellow.svg" alt="Python">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
</p>

<p align="center">
  <strong>Transform your grading workflow with intelligent OCR and AI-powered evaluation.</strong><br>
  Upload handwritten answers, compare with model solutions, and get instant accurate marks.
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Technologies Used](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **AI Grading** | Automatically grade handwritten answers using AI |
| **OCR Technology** | Extract text from handwritten images with 98% accuracy |
| **AI Detection** | Detect AI-generated content in assignments |
| **Feedback Generation** | Generate detailed, constructive feedback instantly |
| **Analytics Dashboard** | Track student progress with comprehensive reports |

### 🔐 Authentication System

- ✅ Sign In / Sign Up pages
- ✅ Password strength indicator
- ✅ Social login (Google, GitHub)
- ✅ Form validation
- ✅ Remember me functionality
- ✅ Forgot password flow

### 🤖 AI Detection Module

- ✅ Text analysis for AI-generated content
- ✅ File upload support (PDF, DOCX, TXT, Images)
- ✅ Confidence scoring
- ✅ Detailed metrics (vocabulary diversity, perplexity)
- ✅ Downloadable reports

### 📝 Feedback System

- ✅ Star rating
- ✅ Emoji satisfaction selector
- ✅ Category selection
- ✅ File attachments
- ✅ Anonymous submission option

---

## 🚀 Demo

### Live Demo
Visit: [GradeAI Demo](#) *(http://127.0.0.1:3000/frontend/index.html)*

### Local Demo
```bash
# Clone the repository
git clone https://github.com/Narindersra/Grade-AI-1.0

# Open index.html in browser
open index.html
```

---

## 📁 Project Structure

```
gradeai/
│
├── 📄 index.html              # Main landing page
├── 🎨 styles.css              # Global CSS styles
├── ⚡ script.js               # Main JavaScript
│
├── 📁 auth/                   # Authentication pages
│   ├── login.html             # Sign In page
│   ├── signup.html            # Sign Up page
│   ├── auth.css               # Auth-specific styles
│   └── auth.js                # Auth JavaScript
│
├── 🤖 ai-detection.html       # AI Content Detection page
├── 🐍 ai-detection-backend.py # Flask backend server
│
├── 💬 feedback.html           # Feedback form page
│
├── 📋 requirements.txt        # Python dependencies
└── 📖 README.md               # Documentation
```

---

## 🛠️ Installation

### Prerequisites

- Python 3.9 or higher
- Node.js (optional, for development)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/gradeai.git
cd gradeai
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Install Tesseract OCR (Optional - for image processing)

**Windows:**
```
Download from: https://github.com/UB-Mannheim/tesseract/wiki
Add to PATH: C:\Program Files\Tesseract-OCR
```

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### Step 4: Run Backend Server

```bash
python ai-detection-backend.py
```

Server will start at: `http://localhost:5000`

### Step 5: Open Frontend

Open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Visit: `http://localhost:8080`

---

## 📖 Usage

### 1. AI Grading (Demo)

1. Navigate to the **Demo** section on the landing page
2. Enter the **Question**
3. Enter the **Model Answer**
4. Set **Maximum Marks**
5. Upload **Student's Handwritten Answer** (image)
6. Click **"Grade with AI"**
7. View the AI-generated score and feedback

### 2. AI Detection

1. Navigate to **AI Detector** in the navigation
2. Choose input method:
   - **Upload File**: PDF, DOCX, TXT, or Image
   - **Paste Text**: Directly paste content
3. Click **"Analyze Content"**
4. View results:
   - AI vs Human percentage
   - Confidence score
   - Detailed metrics
5. Download report if needed

### 3. Authentication

**Sign Up:**
1. Click **"Get Started Free"**
2. Fill in Full Name, Email, Password
3. Check Terms & Conditions
4. Click **"Create Account"**

**Sign In:**
1. Click **"Sign In"**
2. Enter Email and Password
3. (Optional) Check "Remember me"
4. Click **"Sign In"**

### 4. Feedback

1. Navigate to **Feedback** in the navigation
2. Select satisfaction emoji
3. Rate with stars (1-5)
4. Fill in optional details
5. Write your feedback
6. Click **"Submit Feedback"**

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
    "status": "healthy",
    "model_loaded": true,
    "model_name": "roberta-base-openai-detector"
}
```

#### Detect AI (Text)
```http
POST /api/detect
Content-Type: application/json
```

**Request Body:**
```json
{
    "text": "Your text to analyze..."
}
```

**Response:**
```json
{
    "success": true,
    "prediction": "AI Generated",
    "confidence": 87.5,
    "ai_score": 87.5,
    "human_score": 12.5,
    "verdict": "high_ai",
    "verdict_text": "High likelihood of AI-generated content",
    "metrics": {
        "word_count": 245,
        "sentence_count": 12,
        "vocab_diversity": 65.3,
        "avg_word_length": 5.2,
        "avg_sentence_length": 20.4
    }
}
```

#### Detect AI (File)
```http
POST /api/detect-file
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File (PDF, DOCX, TXT, JPG, PNG)

**Response:** Same as `/api/detect`

---

## 📸 Screenshots

### Landing Page
```
┌─────────────────────────────────────────┐
│  🧠 GradeAI    Features  Demo  Pricing  │
├─────────────────────────────────────────┤
│                                         │
│     Grade Answers 10x Faster with AI    │
│                                         │
│  [Start Grading Free]  [Watch Demo]     │
│                                         │
│   50K+ Papers   98% Accuracy   2K+Users │
└─────────────────────────────────────────┘
```

### AI Detection
```
┌─────────────────────────────────────────┐
│  ← Back to GradeAI      AI Detection    │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────────────────────┐│
│ │ Animated│  │  📄 Upload  📝 Paste    ││
│ │  Left   │  │                         ││
│ │  Panel  │  │  [Drop files here]      ││
│ │         │  │                         ││
│ │ 🔍 99%  │  │  [Analyze Content]      ││
│ └─────────┘  └─────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 🔧 Technologies Used

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling & Animations |
| JavaScript (ES6+) | Interactivity |
| Font Awesome | Icons |
| Google Fonts (Inter) | Typography |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.9+ | Backend language |
| Flask | Web framework |
| Transformers | AI/ML models |
| PyTorch | Deep learning |
| PyPDF2 | PDF processing |
| python-docx | DOCX processing |
| Pillow | Image processing |
| Tesseract | OCR |

### AI Models
| Model | Purpose |
|-------|---------|
| RoBERTa OpenAI Detector | AI content detection |
| GPT-based grading | Answer evaluation |

---

## 🎨 Theme Colors

```css
/* Primary Colors */
--color-primary: #6366F1      /* Indigo */
--color-primary-dark: #4F46E5
--color-primary-light: #818CF8

/* Accent Colors */
--color-accent: #06B6D4       /* Cyan */
--color-accent-dark: #0891B2
--color-accent-light: #22D3EE

/* Status Colors */
--color-success: #10B981      /* Green */
--color-warning: #F59E0B      /* Amber */
--color-error: #EF4444        /* Red */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)
--gradient-bg: linear-gradient(135deg, #667eea, #764ba2)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Code Style
- Use consistent indentation (2 spaces for HTML/CSS/JS, 4 spaces for Python)
- Follow PEP 8 for Python code
- Add comments for complex logic
- Test your changes before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 GradeAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

- 📧 Email: support@gradeai.com
- 💬 Discord: [Join our community](#)
- 📖 Documentation: [docs.gradeai.com](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/gradeai/issues)

---

## 🙏 Acknowledgments

- [HuggingFace](https://huggingface.co/) for the AI models
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for Inter font
- All contributors and beta testers

---

<p align="center">
  Made with ❤️ by the GradeAI Team
</p>

<p align="center">
  <a href="#-gradeai--intelligent-answer-grading-platform">⬆️ Back to Top</a>
</p>
