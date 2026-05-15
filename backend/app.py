# =========================================================
# AI CV ANALYZER USING NLP
# =========================================================
# FEATURES
# ---------------------------------------------------------
# 1. Upload CV PDF
# 2. Extract PDF Text
# 3. NLP-Based Information Extraction
# 4. Store extracted data in Neo4j Graph Database
# 5. Display Results in Streamlit
#
# =========================================================
# REQUIRED INSTALLATIONS
# =========================================================
#
# pip install flask
# pip install flask-cors
# pip install spacy
# pip install pymupdf
# pip install neo4j
#
# Download spaCy Model:
#   python -m spacy download en_core_web_sm
#
# =========================================================
# RUN APPLICATION
# =========================================================
#
# python app.py
#
# =========================================================
# NEO4J DESKTOP CONNECTION DETAILS
# =========================================================
#
# Instance : CVGraph
# DB Name  : neo4j
# URL      : neo4j://127.0.0.1:7687
# User     : neo4j
# Password : neo4j123
#
# =========================================================


# =========================================================
# IMPORT LIBRARIES
# =========================================================

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import fitz
import spacy
import re
from neo4j import GraphDatabase
import atexit
import os
import uuid
import hashlib
import docx
from functools import wraps
import logging

from nlp_preprocess import normalize_for_match, skill_in_text, text_to_lemma_set, preprocess_cv_text
from behavioral_analysis import analyze_face_image, analyze_voice_audio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Allow both localhost and 127.0.0.1 to prevent common CORS fetch errors
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# =========================================================
# SECURITY CONFIG
# =========================================================
SH_API_KEY = os.getenv("SH_API_KEY", "sh_secret_key_2026")

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.headers.get('x-api-key') != SH_API_KEY:
            return jsonify({"success": False, "error": "Unauthorized: Invalid API Key"}), 401
        return f(*args, **kwargs)
    return decorated_function


# =========================================================
# LOAD SPACY MODEL
# =========================================================

nlp = spacy.load("en_core_web_sm")


# =========================================================
# NEO4J CONNECTION (Env variables for Docker/Production)
# =========================================================

NEO4J_URI      = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
NEO4J_USER     = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j123")

# --- MOCK DATABASE FALLBACK ---
# This allows the site to run even without a live Neo4j instance
import json

class MockSession:
    def __init__(self, db_file="mock_db.json"):
        self.db_file = db_file
        self._load()

    def _load(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, "r") as f:
                    self.data = json.load(f)
            except:
                self.data = {"candidates": {}, "requirements": {}, "skills": set()}
        else:
            self.data = {"candidates": {}, "requirements": {}, "skills": set()}
        if isinstance(self.data.get("skills"), list):
            self.data["skills"] = set(self.data["skills"])

    def _save(self):
        to_save = self.data.copy()
        to_save["skills"] = list(to_save["skills"])
        with open(self.db_file, "w") as f:
            json.dump(to_save, f, indent=2)

    def run(self, query, **kwargs):
        # Extremely simplified Cypher parser for mock mode
        q = query.strip().upper()
        
        if "CREATE CONSTRAINT" in q or "CREATE INDEX" in q:
            return []
            
        if "MERGE (C:CANDIDATE" in q:
            c_id = kwargs.get("id")
            self.data["candidates"][c_id] = {
                "id": c_id,
                "name": kwargs.get("name"),
                "email": kwargs.get("email"),
                "phone": kwargs.get("phone"),
                "match_score": kwargs.get("match_score"),
                "summary": kwargs.get("summary"),
                "skills": [],
                "experience": [],
                "education": []
            }
            self._save()
            
        elif "MERGE (R:REQUIREMENT" in q:
            r_id = kwargs.get("id")
            self.data["requirements"][r_id] = {
                "id": r_id,
                "title": kwargs.get("title"),
                "role": kwargs.get("role"),
                "summary": kwargs.get("summary"),
                "description": kwargs.get("description"),
                "addedAt": str(kwargs.get("addedAt", "2026-05-15")),
                "skills": []
            }
            self._save()

        elif "MERGE (S:SKILL" in q:
            skill = kwargs.get("skill") or kwargs.get("name")
            if skill:
                self.data["skills"].add(skill)
                # Link to candidate if in query
                if "MATCH (C:CANDIDATE" in q:
                    c_id = kwargs.get("id")
                    if c_id in self.data["candidates"] and skill not in self.data["candidates"][c_id]["skills"]:
                        self.data["candidates"][c_id]["skills"].append(skill)
                # Link to requirement if in query
                if "MATCH (R:REQUIREMENT" in q:
                    r_id = kwargs.get("id")
                    if r_id in self.data["requirements"] and skill not in self.data["requirements"][r_id]["skills"]:
                        self.data["requirements"][r_id]["skills"].append(skill)
            self._save()

        elif "MERGE (D:DEGREE" in q:
            c_id = kwargs.get("id")
            if c_id in self.data["candidates"]:
                self.data["candidates"][c_id]["education"].append({
                    "degree": kwargs.get("degree"),
                    "institution": kwargs.get("institution"),
                    "year": kwargs.get("year")
                })
            self._save()

        elif "MERGE (J:JOBROLE" in q:
            c_id = kwargs.get("id")
            if c_id in self.data["candidates"]:
                self.data["candidates"][c_id]["experience"].append({
                    "title": kwargs.get("title"),
                    "company": kwargs.get("company"),
                    "duration": kwargs.get("duration")
                })
            self._save()

        elif "MATCH (C:CANDIDATE)" in q and "RETURN" in q:
            class Record:
                def __init__(self, d): self.d = d
                def __getitem__(self, k): return self.d.get(k)
                def get(self, k, default=None): return self.d.get(k, default)
            return [Record(c) for c in self.data["candidates"].values()]

        elif "MATCH (R:REQUIREMENT)" in q and "RETURN" in q:
            class Record:
                def __init__(self, d): self.d = d
                def __getitem__(self, k): return self.d.get(k)
                def get(self, k, default=None): return self.d.get(k, default)
            return [Record(r) for r in self.data["requirements"].values()]

        elif "DETACH DELETE C" in q:
            c_id = kwargs.get("id")
            if c_id in self.data["candidates"]:
                del self.data["candidates"][c_id]
                self._save()
                class Res:
                    def single(self): return {"cnt": 1}
                return Res()
            class Res:
                def single(self): return {"cnt": 0}
            return Res()

        elif "DETACH DELETE R" in q:
            r_id = kwargs.get("id")
            if r_id in self.data["requirements"]:
                del self.data["requirements"][r_id]
                self._save()
                class Res:
                    def single(self): return {"count": 1}
                return Res()
            class Res:
                def single(self): return {"count": 0}
            return Res()

        return []

    def __enter__(self): return self
    def __exit__(self, exc_type, exc_val, exc_tb): pass

class MockDriver:
    def session(self): return MockSession()
    def close(self): pass

try:
    driver = GraphDatabase.driver(
        NEO4J_URI,
        auth=(NEO4J_USER, NEO4J_PASSWORD)
    )
    # Test connection
    with driver.session() as session:
        session.run("RETURN 1")
    logger.info("Successfully connected to Neo4j.")
    IS_MOCK = False
except Exception as e:
    logger.warning(f"Neo4j connection failed ({e}). Switching to MOCK mode.")
    driver = MockDriver()
    IS_MOCK = True

atexit.register(driver.close)

def init_db():
    if IS_MOCK:
        logger.info("  Mock Mode: Skipping DB Index Initialization.")
        return
        
    print("  Initializing Database Indexes...")
    queries = [
        "CREATE CONSTRAINT candidate_id_unique IF NOT EXISTS FOR (c:Candidate) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT candidate_email_unique IF NOT EXISTS FOR (c:Candidate) REQUIRE c.email IS UNIQUE",
        "CREATE INDEX skill_name_idx IF NOT EXISTS FOR (s:Skill) ON (s.name)",
        "CREATE INDEX company_name_idx IF NOT EXISTS FOR (co:Company) ON (co.name)",
        "CREATE INDEX inst_name_idx IF NOT EXISTS FOR (i:Institution) ON (i.name)",
    ]
    try:
        with driver.session() as session:
            for q in queries:
                session.run(q)
        logger.info("DB constraints and indexes verified/created.")
    except Exception as e:
        logger.warning(f"Constraint/index creation skipped: {e}")

init_db()


# =========================================================
# PDF TEXT EXTRACTION
# =========================================================

def extract_text_from_pdf(uploaded_file):

    text = ""

    pdf_document = fitz.open(
        stream=uploaded_file.read(),
        filetype="pdf"
    )

    for page in pdf_document:
        text += page.get_text()

    return text


# =========================================================
# DOCX TEXT EXTRACTION
# =========================================================

def extract_text_from_docx(file_stream):
    doc = docx.Document(file_stream)
    return "\n".join([para.text for para in doc.paragraphs])


# =========================================================
# AI MATCH SCORING
# =========================================================

def calculate_match_score(skills):
    """
    Intelligently calculate match score against active requirements.
    Uses spaCy similarity (if model supports it) or semantic grouping.
    """
    try:
        req_skills = set()
        with driver.session() as session:
            result = session.run("MATCH (s:Skill)<-[:REQUIRES_SKILL]-(r:Requirement) RETURN collect(DISTINCT s.name) as skills")
            record = result.single()
            if record and record["skills"]:
                req_skills = set(record["skills"])
        
        # Fallback if no requirements exist in DB
        if not req_skills:
            req_skills = {"React", "Python", "Node.js", "AWS", "Docker", "NLP", "Java", "TypeScript", "SQL", "Git"}
            
        skill_set = set(skills)
        
        # 1. Direct Intersection (Exact matches)
        matches = skill_set.intersection(req_skills)
        match_count = len(matches)
        
        # 2. Category-based matching (e.g. 'React' matches 'Frontend')
        # This is a simplified version of semantic matching
        categories = {
            "Frontend": {"React", "Angular", "Vue", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind", "Next.js"},
            "Backend": {"Python", "Django", "Flask", "Node.js", "Express", "Java", "Spring Boot", "Go", "Rust"},
            "Data Science": {"Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Scikit-learn", "Data Analysis"},
            "DevOps": {"Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "CI/CD", "Git", "Linux"},
            "Database": {"SQL", "PostgreSQL", "MySQL", "MongoDB", "Neo4j", "Redis"}
        }
        
        category_overlap = 0
        for cat, items in categories.items():
            if skill_set.intersection(items) and req_skills.intersection(items):
                category_overlap += 1
        
        base_score = 55
        if not req_skills:
            # Weighted score: Exact matches + Bonus for variety
            score = base_score + (match_count * 4) + (category_overlap * 3)
        else:
            # Percentage-based match if we have requirements
            match_pct = (match_count / len(req_skills)) * 45
            cat_bonus = (category_overlap / len(categories)) * 10
            score = base_score + match_pct + cat_bonus
            
        # Add small bonus for variety of skills
        score += min(len(skills) // 2, 8)
        
        return min(round(score), 99)
    except Exception as e:
        logger.warning(f"calculate_match_score fallback triggered: {e}")
        return 75
# EXTRACT EMAIL
# =========================================================

def extract_email(text):

    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    emails  = re.findall(pattern, text)
    return emails[0] if emails else "Not Found"


# =========================================================
# EXTRACT PHONE NUMBER
# =========================================================

def extract_phone(text):

    pattern = r"(\+?\d[\d\s\-\(\)]{7,15}\d)"
    phones  = re.findall(pattern, text)
    return phones[0].strip() if phones else "Not Found"


# =========================================================
# EXTRACT CANDIDATE NAME
# =========================================================

def extract_name(text):
    # Filter out empty lines to avoid wasting the initial line checks
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines: return "Unknown Candidate"

    # Strategy 1: NLP Entity Recognition (PERSON)
    combined = " ".join(lines[:15])
    doc      = nlp(combined)

    blacklist = {
        "curriculum vitae", "resume", "cv", "reference", "references",
        "profile", "summary", "objective", "personal details", "name",
        "page", "skills", "experience", "education", "work history",
        "contact", "details", "address", "declaration", "phone", "email"
    }

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate_name = ent.text.strip()
            # Clean name from common artifacts
            candidate_name = re.sub(r'^(Name|Name:)\s*', '', candidate_name, flags=re.IGNORECASE)
            words = candidate_name.split()
            if (2 <= len(words) <= 4
                    and candidate_name.lower() not in blacklist
                    and not re.search(r'[@\d#\\/]', candidate_name)):
                return candidate_name.title()

    # Strategy 2: First line analysis (common in professional resumes)
    for line in lines[:5]:
        # Skip if it looks like a header or contact info
        if any(kw in line.lower() for kw in blacklist) or "@" in line or re.search(r'\d', line):
            continue
            
        words = line.split()
        if 2 <= len(words) <= 4:
            # Check if it's not a common word and doesn't have numbers
            if line.lower() not in blacklist and not re.search(r'\d', line):
                return line.title()

    # Strategy 3: Email-based fallback (if name extraction fails)
    email = extract_email(text)
    if email != "Not Found":
        name_part = email.split('@')[0]
        # split by dot or underscore
        parts = re.split(r'[._]', name_part)
        if len(parts) >= 2:
            return " ".join(parts).title()
        return name_part.title()

    return "Unknown Candidate"



# =========================================================
# SKILLS DATABASE
# =========================================================

skills_database = [
    "Python", "Java", "C", "C++", "C#", "Ruby", "Go", "Rust", "Swift",
    "Kotlin", "PHP", "R", "MATLAB", "Scala", "Perl",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "Redis",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenCV",
    "Data Analysis", "Data Science", "Statistics", "Data Visualization",
    "React", "Angular", "Vue", "JavaScript", "TypeScript", "Node.js",
    "HTML", "CSS", "Bootstrap", "Tailwind", "Next.js",
    "Django", "Flask", "FastAPI", "Spring Boot", "Express",
    "AWS", "Azure", "Google Cloud", "Cloud Computing", "Docker", "Kubernetes",
    "Git", "Linux", "Bash", "Agile", "Scrum", "DevOps", "CI/CD",
    "Streamlit", "Power BI", "Tableau", "Excel",
    "Artificial Intelligence", "Neo4j", "Spark", "Hadoop",
    "Selenium", "Postman", "QA", "Manual Testing", "Automation Testing", 
    "Jira", "SDLC", "STLC", "Software Testing", "Bug Tracking", "Cucumber"
]


# =========================================================
# EXTRACT SKILLS
# =========================================================

def extract_skills(text):

    found_skills = []
    text_lower   = normalize_for_match(text)
    lemma_set    = text_to_lemma_set(text)

    for skill in skills_database:
        if skill_in_text(skill, text_lower, lemma_set):
            found_skills.append(skill)

    return sorted(set(found_skills))


# =========================================================
# SECTION EXTRACTION
# =========================================================

KNOWN_SECTIONS = [
    "education", "academic", "qualification",
    "experience", "employment", "career", "work history",
    "skills", "technical skills", "competencies",
    "projects", "certifications", "awards",
    "publications", "references", "summary", "objective",
    "profile", "personal", "languages", "interests", "hobbies"
]

def extract_section(text, section_names):

    lines     = text.split('\n')
    extracted = []
    capture   = False

    for line in lines:

        clean_line = line.strip()

        if any(s.lower() in clean_line.lower() for s in section_names):
            capture = True
            continue

        if capture:

            is_other_section = any(
                s.lower() in clean_line.lower()
                for s in KNOWN_SECTIONS
                if not any(
                    target.lower() in clean_line.lower()
                    for target in section_names
                )
            )

            if is_other_section and clean_line:
                break

            extracted.append(clean_line)

    while extracted and not extracted[0]:
        extracted.pop(0)
    while extracted and not extracted[-1]:
        extracted.pop()

    return "\n".join(extracted)


# =========================================================
# EDUCATION EXTRACTION
# =========================================================

def extract_education(text):

    if not text.strip():
        return []

    _hons = r"(?:\s*\(\s*(?:Hons\.?|Honours|Pass|Merit|Distinction)\s*\))?"
    _end  = r"(?=\s*(?:\n|,|\.|at\b|from\b|\u2013|-|$))"

    degree_patterns = [
        r"(Bachelor\s+of\s+[A-Za-z\s&]+"    + _hons + r")" + _end,
        r"(Master\s+of\s+[A-Za-z\s&]+"      + _hons + r")" + _end,
        r"(Doctor\s+of\s+[A-Za-z\s&]+"      + _hons + r")" + _end,
        r"(B\.?Sc\.?"   + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(M\.?Sc\.?"   + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(B\.?Eng\.?"  + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(M\.?Eng\.?"  + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(B\.?A\.?"    + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(M\.?A\.?"    + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(B\.?(?:IT|CS|IS|BA|Com\.?)\s*"   + _hons + r"\s*(?:in\s+[A-Za-z\s&]+?)?)" + _end,
        r"(M\.?B\.?A\.?"  + _hons + r"\s*(?:in\s+[A-Za-z\s&]+?)?)" + _end,
        r"(LL\.?[BM]\.?"  + _hons + r"\s*(?:in\s+[A-Za-z\s&]+?)?)" + _end,
        r"(Ph\.?D\.?"   + _hons + r"\s+(?:in\s+)?[A-Za-z\s&]+?)" + _end,
        r"(Diploma\s+(?:in\s+)?[A-Za-z\s&]+"               + _hons + r")" + _end,
        r"(Higher\s+National\s+Diploma\s+(?:in\s+)?[A-Za-z\s&]+" + _hons + r")" + _end,
        r"(HND\s+(?:in\s+)?[A-Za-z\s&]+"                   + _hons + r")" + _end,
        r"(G\.?C\.?E\.?\s+(?:Advanced|Ordinary)\s+Level[A-Za-z\s,()]*)",
        r"(Advanced\s+Level\s*(?:\([A-Za-z\s,]+\))?)",
        r"(Ordinary\s+Level\s*(?:\([A-Za-z\s,]+\))?)",
    ]

    year_pattern         = r"\b(19\d{2}|20\d{2})\b"
    institution_keywords = [
        r"([A-Z][a-zA-Z\s&']+(?:University|Institute|College|School|Academy|Polytechnic|Faculty)[A-Za-z\s,]*)"
    ]

    doc          = nlp(text)
    org_entities = [ent.text.strip() for ent in doc.ents if ent.label_ == "ORG"]
    education_found = []

    for pattern in degree_patterns:

        for match in re.finditer(pattern, text, re.IGNORECASE):

            degree = match.group(1).strip().rstrip(",\u2013- ")

            if len(degree) < 3 or len(degree) > 120:
                continue

            surrounding = text[max(0, match.start() - 200): match.end() + 200]
            years       = re.findall(year_pattern, surrounding)
            year        = " \u2013 ".join(years[:2]) if years else "Year not specified"
            institution = "Institution not specified"

            for org in org_entities:
                if org in surrounding and len(org) > 3:
                    institution = org
                    break

            if institution == "Institution not specified":
                for inst_pattern in institution_keywords:
                    inst_matches = re.findall(inst_pattern, surrounding)
                    if inst_matches:
                        institution = inst_matches[0].strip()
                        break

            entry = {"degree": degree, "institution": institution, "year": year}

            if not any(e["degree"].lower() == degree.lower() for e in education_found):
                education_found.append(entry)

    return education_found


# =========================================================
# EXPERIENCE EXTRACTION
# =========================================================

def extract_experience(text):

    if not text.strip():
        return []

    job_title_patterns = [
        r"(Senior\s+Software\s+Engineer)",
        r"(Junior\s+Software\s+Engineer)",
        r"(Software\s+Engineer)",
        r"(Full[\s\-]Stack\s+Developer)",
        r"(Front[\s\-]End\s+Developer)",
        r"(Back[\s\-]End\s+Developer)",
        r"(Web\s+Developer)",
        r"(Mobile\s+Developer)",
        r"(Data\s+Scientist)",
        r"(Data\s+Analyst)",
        r"(Business\s+Analyst)",
        r"(Machine\s+Learning\s+Engineer)",
        r"(AI\s+Engineer)",
        r"(DevOps\s+Engineer)",
        r"(Cloud\s+Engineer)",
        r"(System\s+Administrator)",
        r"(Network\s+Engineer)",
        r"(IT\s+Manager)",
        r"(IT\s+Officer)",
        r"(Project\s+Manager)",
        r"(Product\s+Manager)",
        r"(Technical\s+Lead)",
        r"(Team\s+Lead)",
        r"(Senior\s+Lecturer)",
        r"(Lecturer)",
        r"(Research\s+Assistant)",
        r"(Research\s+Engineer)",
        r"(Consultant)",
        r"(Technical\s+Consultant)",
        r"(Intern)",
        r"(Graduate\s+Trainee)",
        r"(Trainee\s+[A-Za-z\s]+)",
        r"(Director\s+of\s+[A-Za-z\s]+)",
        r"(Head\s+of\s+[A-Za-z\s]+)",
        r"(Chief\s+[A-Za-z\s]+Officer)",
    ]

    date_range_pattern = (
        r"("
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?"
        r"|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
        r"[\s,]?\d{4}"
        r"\s*(?:\u2013|-|to)\s*"
        r"(?:Present|Current|Now|"
        r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?"
        r"|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
        r"[\s,]?\d{4})"
        r"|"
        r"\d{4}\s*(?:\u2013|-|to)\s*(?:\d{4}|Present|Current|Now)"
        r")"
    )

    doc          = nlp(text)
    org_entities = [
        ent.text.strip()
        for ent in doc.ents
        if ent.label_ == "ORG" and len(ent.text.strip()) > 2
    ]

    company_keywords = (
        r"([A-Z][a-zA-Z0-9\s&',\.\-]+?"
        r"(?:Ltd|Limited|Inc|LLC|PLC|Corp|Corporation|"
        r"Company|Group|Technologies|Solutions|Systems|"
        r"Services|Consultancy|Agency|Bank|Pvt|Private|"
        r"University|Institute|Hospital|School|Academy)"
        r"\.?)"
    )

    experience_found = []
    lines            = text.split('\n')

    for i, line in enumerate(lines):

        clean_line = line.strip()
        if not clean_line:
            continue

        for pattern in job_title_patterns:

            match = re.search(pattern, clean_line, re.IGNORECASE)

            if match:

                title             = match.group(1).strip()
                surrounding_lines = lines[max(0, i - 3): i + 6]
                surrounding_text  = "\n".join(surrounding_lines)

                duration_match = re.search(
                    date_range_pattern, surrounding_text, re.IGNORECASE
                )
                duration = (
                    duration_match.group(1).strip()
                    if duration_match
                    else "Duration not specified"
                )

                company = "Company not specified"

                for org in org_entities:
                    if org in surrounding_text and org.lower() != title.lower():
                        company = org
                        break

                if company == "Company not specified":
                    comp_match = re.search(company_keywords, surrounding_text)
                    if comp_match:
                        company = comp_match.group(1).strip()

                if company == "Company not specified" and i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if (
                        next_line
                        and len(next_line) < 80
                        and not re.search(date_range_pattern, next_line, re.IGNORECASE)
                        and not re.search(
                            r'\b(duties|responsibilities|worked|managed)\b',
                            next_line, re.IGNORECASE
                        )
                    ):
                        company = next_line

                entry = {"title": title, "company": company, "duration": duration}

                if not any(
                    e["title"].lower() == title.lower()
                    and e["company"].lower() == company.lower()
                    for e in experience_found
                ):
                    experience_found.append(entry)

                break

    return experience_found


# =========================================================
# GENERATE PERSONALIZED SUMMARY
# =========================================================

def generate_summary(name, skills, education, experience):

    edu_text = (
        ", ".join(f"{e['degree']} ({e['institution']})" for e in education)
        if education else "qualifications not detected"
    )
    exp_text = (
        ", ".join(f"{e['title']} at {e['company']}" for e in experience)
        if experience else "experience details not detected"
    )
    skill_text = ", ".join(skills[:10]) if skills else "skills not detected"

    return (
        f"{name} is a candidate with expertise in {skill_text}. "
        f"Educational qualifications include {edu_text}. "
        f"Professional experience includes {exp_text}."
    )


# (Streamlit helper functions removed for React cleanup)


def make_candidate_id(email: str) -> str:
    """
    Generate a deterministic candidate ID based on email.
    Same email always produces the same ID, making Neo4j MERGE truly atomic.
    Falls back to a random UUID when email is not extractable.
    """
    if email and email != "Not Found":
        digest = hashlib.sha256(email.lower().strip().encode()).hexdigest()[:24]
        return f"c_{digest}"
    return str(uuid.uuid4())


# =========================================================
# STORE DATA IN NEO4J
# =========================================================

# =========================================================

def store_candidate_in_neo4j(candidate_id, name, email, phone,
                              skills, education, experience, match_score, summary=""):

    print()
    print("=" * 55)
    print("  NEO4J SAVE STARTED")
    print(f"  Candidate : {name}")
    print(f"  Email     : {email}")
    print(f"  Phone     : {phone}")
    print("=" * 55)

    if not name or name in ("Not Found", "Unknown Candidate"):
        logger.warning(f"  [SKIP] Name not extracted for id={candidate_id} — Neo4j save aborted.")
        return False

    try:

        # plain session() — no database= for Desktop
        with driver.session() as session:

            # ──────────────────────────────────────────────
            # STEP 1 — Candidate node
            # ──────────────────────────────────────────────
            print("  [1/4] Creating Candidate node...")

            session.run("""
                MERGE (c:Candidate {id: $id})
                SET   c.name = $name,
                      c.email = $email,
                      c.phone = $phone,
                      c.match_score = $match_score,
                      c.summary = $summary
            """, id=candidate_id, name=name, email=email, phone=phone,
                 match_score=match_score, summary=summary)

            print(f"        Candidate node created  ->  name='{name}'")

            # ──────────────────────────────────────────────
            # STEP 2 — Skill nodes
            # ──────────────────────────────────────────────
            print(f"  [2/4] Creating Skill nodes  ({len(skills)} skills)...")

            for skill in skills:
                session.run("""
                    MATCH (c:Candidate {id: $id})
                    MERGE (s:Skill     {name: $skill})
                    MERGE (c)-[:HAS_SKILL]->(s)
                """, id=candidate_id, skill=skill)
                print(f"        Skill linked  ->  '{skill}'")

            if not skills:
                print("        No skills to save.")

            # ──────────────────────────────────────────────
            # STEP 3 — Education nodes
            # ──────────────────────────────────────────────
            print(f"  [3/4] Creating Education nodes  ({len(education)} entries)...")

            for edu in education:

                degree      = edu.get("degree",      "Unknown Degree")
                institution = edu.get("institution", "Unknown Institution")
                year        = edu.get("year",        "Unknown Year")

                session.run("""
                    MATCH  (c:Candidate   {id:    $id})
                    MERGE  (d:Degree      {name:  $degree})
                    SET    d.year = $year
                    MERGE  (i:Institution {name:  $institution})
                    MERGE  (c)-[:HAS_EDUCATION]->(d)
                    MERGE  (d)-[:STUDIED_AT]->(i)
                """, id=candidate_id, degree=degree,
                     institution=institution, year=year)

                print(f"        Education node created")
                print(f"          Degree      : {degree}")
                print(f"          Institution : {institution}")
                print(f"          Year        : {year}")

            if not education:
                print("        No education entries to save.")

            # ──────────────────────────────────────────────
            # STEP 4 — Experience nodes
            # ──────────────────────────────────────────────
            print(f"  [4/4] Creating Experience nodes  ({len(experience)} roles)...")

            for exp in experience:

                title    = exp.get("title",    "Unknown Title").strip()
                company  = exp.get("company",  "Unknown Company").strip()
                duration = exp.get("duration", "Unknown Duration").strip()

                session.run("""
                    MATCH  (c:Candidate {id:      $id})
                    MERGE  (j:JobRole   {title:   $title})
                    SET    j.duration = $duration
                    MERGE  (co:Company  {name:    $company})
                    MERGE  (c)-[:WORKED_AS]->(j)
                    MERGE  (j)-[:AT_COMPANY]->(co)
                """, id=candidate_id, title=title,
                     company=company, duration=duration)

                print(f"        Experience node created")
                print(f"          Role     : {title}")
                print(f"          Company  : {company}")
                print(f"          Duration : {duration}")

            if not experience:
                print("        No experience entries to save.")

        print()
        print("  Neo4j save completed!")
        print("=" * 55)
        print()
        return True

    except Exception as e:
        print()
        print(f"  Neo4j Error: {str(e)}")
        print("=" * 55)
        print()
        return False


# =========================================================
# FLASK API ENDPOINTS
# =========================================================

@app.route('/api/ping', methods=['GET'])
@require_api_key
def ping_backend():
    return jsonify({"success": True, "message": "Backend is running!"}), 200

@app.route('/api/neo4j-status', methods=['GET'])
@require_api_key
def neo4j_status():
    try:
        with driver.session() as session:
            session.run("RETURN 1")
        return jsonify({"success": True, "message": "Connected to Neo4j"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def _run_text_extraction(text: str) -> dict:
    """Run full NLP pipeline on plain text (used by eval harness)."""
    text = preprocess_cv_text(text)
    education_section = extract_section(
        text,
        ["Education", "Academic Qualifications", "Educational Qualifications"],
    )
    experience_section = extract_section(
        text,
        ["Experience", "Work Experience", "Professional Experience"],
    )
    return {
        "email": extract_email(text),
        "skills": extract_skills(text),
        "education": extract_education(
            education_section if education_section.strip() else text
        ),
        "experience": extract_experience(
            experience_section if experience_section.strip() else text
        ),
    }


@app.route('/api/face-analysis', methods=['POST'])
@require_api_key
def face_analysis():
    if 'file' not in request.files or not request.files['file'].filename:
        return jsonify({"success": False, "error": "Upload an image file (JPG, PNG, WEBP)."}), 400
    uploaded = request.files['file']
    allowed = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')
    if not uploaded.filename.lower().endswith(allowed):
        return jsonify({"success": False, "error": "Unsupported image type."}), 400
    try:
        result = analyze_face_image(uploaded.read())
        result["timestamp"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        logger.error("Face analysis failed: %s", e, exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/api/voice-analysis', methods=['POST'])
@require_api_key
def voice_analysis():
    if 'file' not in request.files or not request.files['file'].filename:
        return jsonify({"success": False, "error": "Upload an audio file (WAV, MP3, OGG, WEBM, M4A)."}), 400
    uploaded = request.files['file']
    allowed = ('.wav', '.mp3', '.ogg', '.webm', '.m4a', '.flac')
    if not uploaded.filename.lower().endswith(allowed):
        return jsonify({"success": False, "error": "Unsupported audio type."}), 400
    try:
        result = analyze_voice_audio(uploaded.read(), uploaded.filename)
        result["timestamp"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        logger.error("Voice analysis failed: %s", e, exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/api/eval/metrics', methods=['GET'])
@require_api_key
def eval_metrics():
    from eval.metrics import run_extraction_eval
    try:
        report = run_extraction_eval(_run_text_extraction)
        return jsonify({"success": True, "data": report}), 200
    except Exception as e:
        logger.error("Eval failed: %s", e, exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/graph/export', methods=['GET'])
@require_api_key
def graph_export():
    """Export graph snapshot + Neo4j Browser / Bloom entry points."""
    bloom_base = os.getenv("NEO4J_BLOOM_URL", "http://localhost:7474/browser/")
    cypher = (
        "MATCH (c:Candidate)-[r]->(n) "
        "RETURN c, r, n LIMIT 300"
    )
    nodes, links = [], []
    try:
        with driver.session() as session:
            result = session.run("""
                MATCH (c:Candidate)
                OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
                RETURN c.id AS cid, c.name AS cname, collect(DISTINCT s.name) AS skills
            """)
            for rec in result:
                cid = rec["cid"]
                nodes.append({"id": cid, "label": rec["cname"], "type": "Candidate"})
                for skill in rec["skills"] or []:
                    sid = f"skill_{skill}"
                    if not any(n["id"] == sid for n in nodes):
                        nodes.append({"id": sid, "label": skill, "type": "Skill"})
                    links.append({"source": cid, "target": sid, "type": "HAS_SKILL"})
    except Exception as e:
        logger.warning("Graph export partial failure: %s", e)

    return jsonify({
        "success": True,
        "data": {
            "nodes": nodes,
            "links": links,
            "cypher": cypher,
            "neo4jBrowserUrl": bloom_base,
            "bloomHint": "Open Neo4j Browser or Bloom and run the provided Cypher to explore the live graph.",
        },
    }), 200

@app.route('/api/reset-graph', methods=['DELETE'])
@require_api_key
def reset_graph():
    try:
        with driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            
        # Also clear the uploads folder
        upload_dir = "uploads"
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, filename)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except Exception as fe:
                    print(f"  Failed to delete file {file_path}: {str(fe)}")
                    
        return jsonify({"success": True, "message": "Graph and uploads reset successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
@require_api_key
def upload_cv():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    uploaded_file = request.files['file']
    
    if uploaded_file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    filename_lower = uploaded_file.filename.lower()
    if not (filename_lower.endswith('.pdf') or filename_lower.endswith('.docx')):
        return jsonify({"success": False, "error": "Only PDF and DOCX files are supported"}), 400

    # --- C-3: MIME / magic-byte validation (before saving to disk) ---
    header_bytes = uploaded_file.read(8)
    uploaded_file.stream.seek(0)
    is_pdf  = header_bytes[:4] == b'%PDF'
    is_docx = header_bytes[:4] == b'PK\x03\x04'   # DOCX is a ZIP
    if not is_pdf and not is_docx:
        return jsonify({"success": False, "error": "File content does not match a valid PDF or DOCX."}), 400
    if filename_lower.endswith('.pdf') and not is_pdf:
        return jsonify({"success": False, "error": "Extension is .pdf but file is not a real PDF."}), 400
    if filename_lower.endswith('.docx') and not is_docx:
        return jsonify({"success": False, "error": "Extension is .docx but file is not a real DOCX."}), 400

    file_ext = ".pdf" if filename_lower.endswith('.pdf') else ".docx"
    temp_id   = str(uuid.uuid4())
    file_path = None

    try:
        logger.info(f"Processing CV: {uploaded_file.filename}")

        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", f"{temp_id}{file_ext}")
        uploaded_file.save(file_path)

        with open(file_path, "rb") as f:
            if filename_lower.endswith('.pdf'):
                extracted_text = extract_text_from_pdf(f)
            else:
                extracted_text = extract_text_from_docx(f)

        extracted_text = preprocess_cv_text(extracted_text)

        # Extract sections
        education_section = extract_section(
            extracted_text,
            ["Education", "Academic Qualifications", "Educational Qualifications", "Academic Background", "Academic Profile"]
        )
        experience_section = extract_section(
            extracted_text,
            ["Experience", "Work Experience", "Professional Experience", "Employment History", "Career History", "Work History"]
        )

        # NLP extraction
        name       = extract_name(extracted_text)
        email      = extract_email(extracted_text)
        phone      = extract_phone(extracted_text)
        skills     = extract_skills(extracted_text)

        # --- H-2: Deterministic ID from email (atomic dedup — no TOCTOU race) ---
        candidate_id = make_candidate_id(email)

        # Rename temp file to final candidate_id filename
        final_path = os.path.join("uploads", f"{candidate_id}{file_ext}")
        if file_path != final_path:
            # Remove old file if candidate already existed (re-upload)
            if os.path.exists(final_path):
                os.remove(final_path)
            os.rename(file_path, final_path)
            file_path = final_path

        education = extract_education(
            education_section if education_section.strip() else extracted_text
        )
        experience = extract_experience(
            experience_section if experience_section.strip() else extracted_text
        )
        summary     = generate_summary(name, skills, education, experience)
        match_score = calculate_match_score(skills)

        # Save to Neo4j
        neo4j_ok = store_candidate_in_neo4j(
            candidate_id, name, email, phone, skills, education, experience, match_score, summary
        )

        # Return to React
        return jsonify({
            "success": True,
            "neo4j_saved": neo4j_ok,
            "data": {
                "id": candidate_id,
                "name": name,
                "email": email,
                "phone": phone,
                "skills": skills,
                "education": education,
                "experience": experience,
                "summary": summary,
                "match": match_score,
                "source": uploaded_file.filename
            }
        }), 200

    except Exception as e:
        # --- H-3: Clean up uploaded file on any failure ---
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass
        logger.error(f"Error processing CV: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


# =========================================================
# STORE REQUIREMENT IN NEO4J
# =========================================================

def store_requirement_in_neo4j(req_id, title, role, skills, summary, description):
    try:
        with driver.session() as session:
            session.run("""
                MERGE (r:Requirement {id: $id})
                SET   r.title = $title,
                      r.role = $role,
                      r.summary = $summary,
                      r.description = $description,
                      r.addedAt = datetime()
            """, id=req_id, title=title, role=role, summary=summary, description=description)

            # Link skills
            for skill in skills:
                session.run("""
                    MATCH (r:Requirement {id: $id})
                    MERGE (s:Skill {name: $skill})
                    MERGE (r)-[:REQUIRES_SKILL]->(s)
                """, id=req_id, skill=skill)
        return True
    except Exception as e:
        print(f"  Neo4j Requirement Error: {str(e)}")
        return False

def extract_job_title(text):
    """Extract a job title from the first line or sentence of a description."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines: return "Software Engineer"
    
    first_line = lines[0]
    # If first line is short, it's likely the title
    if len(first_line.split()) <= 5:
        return first_line
        
    # Otherwise, look for "We are looking for a [Title]" or similar
    doc = nlp(text[:200])
    for chunk in doc.noun_chunks:
        if any(kw in chunk.text.lower() for kw in ["engineer", "developer", "intern", "analyst", "manager", "lead"]):
            return chunk.text.title()
            
    return first_line.split('.')[0].strip()[:50] # Fallback to first sentence

@app.route('/api/requirements', methods=['POST'])
@require_api_key
def add_requirement():
    data = request.json
    req_id = str(uuid.uuid4())
    
    text = data.get('text', '')
    title = data.get('title', '')
    role = data.get('role', 'Engineering')
    skills = data.get('skills', [])
    summary = data.get('summary', '')
    
    if text:
        if not title or title.startswith("Job Description"):
            title = extract_job_title(text)
        if not skills:
            skills = extract_skills(text)
        if not summary:
            summary = text[:200] + "..." if len(text) > 200 else text
            
        # Guess role
        text_lower = text.lower()
        if any(kw in text_lower for kw in ["qa", "testing", "quality", "automation"]):
            role = "Quality Assurance"
        elif any(kw in text_lower for kw in ["frontend", "react", "ui", "ux"]):
            role = "Frontend Engineering"
        elif any(kw in text_lower for kw in ["backend", "node", "python", "java"]):
            role = "Backend Engineering"
        else:
            role = "Engineering"
            
    if not title: title = "Software Engineer"
    
    success = store_requirement_in_neo4j(req_id, title, role, skills, summary, text)
    
    if success:
        return jsonify({
            "success": True, 
            "data": {
                "id": req_id, "title": title, "role": role, 
                "skills": skills, "summary": summary
            }
        }), 201
    return jsonify({"success": False, "error": "Failed to save requirement"}), 500

@app.route('/api/requirements', methods=['GET'])
@require_api_key
def get_requirements():
    try:
        requirements = []
        with driver.session() as session:
            result = session.run("""
                MATCH (r:Requirement)
                OPTIONAL MATCH (r)-[:REQUIRES_SKILL]->(s:Skill)
                RETURN r.id AS id, r.title AS title, r.role AS role, 
                       r.summary AS summary, r.description AS description,
                       r.addedAt AS addedAt,
                       collect(s.name) AS skills
                ORDER BY r.addedAt DESC
            """)
            for record in result:
                requirements.append({
                    "id": record["id"],
                    "title": record["title"],
                    "role": record["role"],
                    "summary": record["summary"],
                    "description": record["description"],
                    "skills": record["skills"],
                    "addedAt": str(record["addedAt"])
                })
        return jsonify({"success": True, "data": requirements}), 200
    except Exception as e:
        logger.error(f"Error fetching requirements: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/candidates', methods=['GET'])
@require_api_key
def get_candidates():
    try:
        candidates = []
        with driver.session() as session:
            # --- H-4: Sequential WITH aggregation prevents Cartesian product ---
            result = session.run("""
                MATCH (c:Candidate)
                OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
                WITH c, collect(DISTINCT s.name) AS skills
                OPTIONAL MATCH (c)-[:WORKED_AS]->(j:JobRole)-[:AT_COMPANY]->(co:Company)
                WITH c, skills, collect(DISTINCT {title: j.title, company: co.name, duration: j.duration}) AS experience
                OPTIONAL MATCH (c)-[:HAS_EDUCATION]->(d:Degree)-[:STUDIED_AT]->(i:Institution)
                RETURN c.id          AS id,
                       c.name        AS name,
                       c.email       AS email,
                       c.phone       AS phone,
                       c.match_score AS match_score,
                       c.summary     AS summary,
                       skills,
                       experience,
                       collect(DISTINCT {degree: d.name, institution: i.name, year: d.year}) AS education
            """)
            for record in result:
                name     = record["name"]
                skills   = record["skills"]
                exp_list = [e for e in record["experience"] if e.get("title") is not None]
                edu_list = [e for e in record["education"]  if e.get("degree") is not None]

                for e in exp_list:
                    e.setdefault("company", "Unknown")
                for e in edu_list:
                    e.setdefault("institution", "Unknown")

                # --- H-5: Use stored summary, fall back to regeneration only if missing ---
                summary = record["summary"] or generate_summary(name, skills, edu_list, exp_list)

                candidates.append({
                    "id":         record.get("id") or name.lower().replace(" ", "-"),
                    "name":       name,
                    "email":      record["email"] or "Not Found",
                    "phone":      record["phone"] or "Not Found",
                    "match":      record.get("match_score") or 70,
                    "skills":     skills,
                    "experience": exp_list,
                    "education":  edu_list,
                    "summary":    summary
                })
        return jsonify({"success": True, "data": candidates}), 200
    except Exception as e:
        logger.error(f"Error fetching candidates: {e}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/candidates/<candidate_id>', methods=['DELETE'])
@require_api_key
def delete_candidate(candidate_id):
    """Delete a candidate and all their relationships from Neo4j."""
    print(f"  Deleting Candidate: {candidate_id}")
    try:
        with driver.session() as session:
            # DETACH DELETE removes the node and all its incoming/outgoing relationships
            # After deleting the candidate, we also clean up orphaned nodes that were only linked to this candidate
            res = session.run("""
                MATCH (c:Candidate {id: $id})
                WITH c, count(c) as cnt
                DETACH DELETE c
                RETURN cnt
            """, id=candidate_id)
            record = res.single()
            count = record["cnt"] if record else 0
            
            # Cleanup orphaned detail nodes
            session.run("""
                MATCH (n) 
                WHERE (n:Skill OR n:Degree OR n:Institution OR n:JobRole OR n:Company) 
                AND NOT (n)--()
                DELETE n
            """)
            
        if count == 0:
            return jsonify({"success": False, "error": "Candidate not found"}), 404
            
        # Also remove the associated physical file from /uploads
        upload_dir = "uploads"
        for ext in [".pdf", ".docx"]:
            file_path = os.path.join(upload_dir, f"{candidate_id}{ext}")
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"  Deleted associated file: {file_path}")
                except Exception as fe:
                    print(f"  Failed to delete file {file_path}: {str(fe)}")
            
        return jsonify({"success": True, "message": "Candidate and associated file deleted successfully"}), 200
    except Exception as e:
        print(f"  Delete Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/requirements/<req_id>', methods=['DELETE'])
@require_api_key
def delete_requirement(req_id):
    """Delete a requirement and its relationships from Neo4j."""
    print(f"  Deleting Requirement: {req_id}")
    try:
        with driver.session() as session:
            result = session.run("MATCH (r:Requirement {id: $id}) DETACH DELETE r RETURN count(r) as count", id=req_id)
            count = result.single()["count"]
            
        if count == 0:
            return jsonify({"success": False, "error": "Requirement not found"}), 404
            
        return jsonify({"success": True, "message": "Requirement deleted successfully"}), 200
    except Exception as e:
        print(f"  Delete Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    logger.info(f"Starting Flask API Server on port 5000 (debug={debug_mode})...")
    app.run(debug=debug_mode, port=5000, host="0.0.0.0")