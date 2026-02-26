# 📄 Resume Skill Gap Analyzer

A full-stack web application that analyzes a resume (PDF) against a job description and calculates skill match percentage using structured text processing.

This project demonstrates backend API development, file handling, and frontend-backend integration.

---

## 🚀 Project Overview

Recruiters manually compare resumes with job descriptions, which is time-consuming and inconsistent.

This system:

- Extracts text from uploaded resume PDFs  
- Identifies technical skills using keyword-based matching  
- Compares them with job description skills  
- Calculates match percentage  
- Displays missing skills  

---

## 🛠 Tech Stack

### Frontend
- React
- Axios
- HTML/CSS
- FormData API

### Backend
- FastAPI
- Python
- PyPDF2
- Regular Expressions (Regex)
- Uvicorn

---

## ⚙️ Features

- Upload resume in PDF format
- Paste job description
- Extract predefined technical skills
- Calculate skill match percentage
- Identify missing skills
- Automatic Swagger API documentation

---

## 🧠 How It Works

1. User uploads a resume (PDF).
2. Backend extracts text using PyPDF2.
3. Resume skills are identified using keyword matching.
4. Job description skills are extracted.
5. Set intersection logic calculates:
   - Matched skills
   - Missing skills
   - Match percentage
6. Results are returned via REST API and displayed in UI.

---

## 📂 Project Structure

```
resume-skill-gap-analyzer/
 ├── resume-analyzer-backend/
 │    ├── main.py
 │    ├── requirements.txt
 │
 └── resume-analyzer-frontend/
      ├── src/
      ├── public/
      └── package.json
```

---

## 🧪 Run Locally

### Backend Setup

```
cd resume-analyzer-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API Docs:
```
http://127.0.0.1:8000/docs
```

---

### Frontend Setup

```
cd resume-analyzer-frontend
npm install
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

## 📊 Sample API Response

```json
{
  "match_percentage": 75,
  "matched_skills": ["python", "react", "fastapi"],
  "missing_skills": ["aws"]
}
```
