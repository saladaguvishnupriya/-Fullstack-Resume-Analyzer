from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import re

# Try to import spacy, but operate without it if not available
try:
    import spacy
    SPACY_AVAILABLE = True
    nlp = None
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        print("Warning: spacy model not found. Run: python -m spacy download en_core_web_sm")
        SPACY_AVAILABLE = False
except ImportError:
    SPACY_AVAILABLE = False
    nlp = None
    print("Warning: spacy not installed. Run: pip install spacy && python -m spacy download en_core_web_sm")

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# List of common technical skills to check
SKILLS = ["python", "react", "sql", "fastapi", "aws", "docker"]

def clean_text(text):
    """Convert text to lowercase for comparison"""
    return text.lower()

def extract_keywords(text):
    """Extract keywords using spacy NLP or fallback to simple word extraction"""
    if SPACY_AVAILABLE and nlp:
        doc = nlp(text)
        keywords = set()
        
        # Extract nouns, proper nouns, and verbs
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN', 'VERB'] and len(token.text) > 2:
                keywords.add(token.text.lower())
        
        # Also extract named entities
        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'ORG', 'PRODUCT', 'GPE']:
                keywords.add(ent.text.lower())
        
        return keywords
    else:
        # Fallback: simple word extraction
        words = text.split()
        return set([w.lower() for w in words if len(w) > 2])

def check_skills_in_text(text, skills_list):
    """Check which skills from the list are present in the text"""
    text_lower = clean_text(text)
    found_skills = []
    
    for skill in skills_list:
        # Check if skill is mentioned in text (word boundary check)
        if re.search(r'\b' + skill.lower() + r'\b', text_lower):
            found_skills.append(skill)
    
    return found_skills

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Read PDF
        pdf = PyPDF2.PdfReader(file.file)
        resume_text = ""
        
        for page in pdf.pages:
            resume_text += page.extract_text() or ""
        
        # Check which skills are present in resume and job description
        resume_skills = check_skills_in_text(resume_text, SKILLS)
        jd_skills = check_skills_in_text(job_description, SKILLS)
        
        # Calculate which skills are matched
        matched_skills = list(set(resume_skills) & set(jd_skills))
        missing_skills = list(set(jd_skills) - set(resume_skills))
        
        # Calculate match percentage based on skills
        match_percentage = 0
        if jd_skills:
            match_percentage = (len(matched_skills) / len(jd_skills)) * 100
        
        return {
            "match_percentage": round(match_percentage, 2),
            "matched_keywords": matched_skills,
            "missing_keywords": missing_skills,
            "total_resume_keywords": len(resume_skills),
            "total_jd_keywords": len(jd_skills)
        }
    
    except Exception as e:
        return {
            "error": f"Error processing resume: {str(e)}",
            "match_percentage": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "total_resume_keywords": 0,
            "total_jd_keywords": 0
        }

@app.get("/")
async def root():
    return {"message": "Resume Analyzer API is running"}
