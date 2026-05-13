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
import docx
from functools import wraps

app = Flask(__name__)
CORS(app)

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

driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

atexit.register(driver.close)

print("=" * 55)

# =========================================================
# DATABASE INITIALIZATION (INDEXES)
# =========================================================

def init_db():
    print("  Initializing Database Indexes...")
    queries = [
        "CREATE INDEX candidate_id_idx IF NOT EXISTS FOR (c:Candidate) ON (c.id)",
        "CREATE INDEX skill_name_idx IF NOT EXISTS FOR (s:Skill) ON (s.name)",
        "CREATE INDEX company_name_idx IF NOT EXISTS FOR (co:Company) ON (co.name)",
        "CREATE INDEX inst_name_idx IF NOT EXISTS FOR (i:Institution) ON (i.name)"
    ]
    try:
        with driver.session() as session:
            for q in queries:
                session.run(q)
        print("  Indexes verified/created successfully.")
    except Exception as e:
        print(f"  Note: Index creation skipped or failed: {str(e)}")

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
    Dynamically calculate match score against active requirements.
    If no requirements exist, fallback to a base set of hot skills.
    """
    try:
        req_skills = set()
        with driver.session() as session:
            result = session.run("MATCH (s:Skill)<-[:REQUIRES_SKILL]-(r:Requirement) RETURN collect(DISTINCT s.name) as skills")
            record = result.single()
            if record and record["skills"]:
                req_skills = set(record["skills"])
        
        if not req_skills:
            req_skills = {"React", "Python", "Node.js", "AWS", "Docker", "NLP", "Java", "TypeScript"}
            
        skill_set = set(skills)
        match_count = len(skill_set.intersection(req_skills))
        
        base_score = 60
        if not req_skills:
            score = base_score + (match_count * 5)
        else:
            # Percentage-based match if we have requirements
            match_pct = (match_count / len(req_skills)) * 40 if req_skills else 0
            score = base_score + match_pct
            
        # Add small bonus for variety
        score += min(len(skills), 10)
        
        return min(round(score), 99)
    except:
        return 75 # Fallback
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
    
    # Increase the search space slightly
    combined = " ".join(lines[:15])
    doc      = nlp(combined)

    blacklist = [
        "curriculum vitae", "resume", "cv", "reference",
        "profile", "summary", "objective", "personal details", "name"
    ]

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate_name = ent.text.strip()
            if candidate_name.lower() not in blacklist:
                if 1 < len(candidate_name.split()) <= 5:
                    return candidate_name

    # Fallback: check the first few valid lines
    for line in lines[:5]:
        if (
            len(line.split()) <= 5
            and not any(kw in line.lower() for kw in blacklist)
            and not re.search(r'[@\d]', line)
        ):
            return line

    # If all fails, return a default string rather than completely breaking
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
    text_lower   = text.lower()

    for skill in skills_database:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize to the case found in our database
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


# =========================================================
# STORE DATA IN NEO4J
# =========================================================

# =========================================================

def store_candidate_in_neo4j(candidate_id, name, email, phone,
                              skills, education, experience, match_score):

    print()
    print("=" * 55)
    print("  NEO4J SAVE STARTED")
    print(f"  Candidate : {name}")
    print(f"  Email     : {email}")
    print(f"  Phone     : {phone}")
    print("=" * 55)

    # Guard: skip if name extraction failed
    if name == "Not Found":
        print("  [SKIP] Name not extracted — Neo4j save aborted.")
        print("=" * 55)
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
                      c.match_score = $match_score
            """, id=candidate_id, name=name, email=email, phone=phone, match_score=match_score)

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
def ping_backend():
    return jsonify({"success": True, "message": "Backend is running!"}), 200

@app.route('/api/neo4j-status', methods=['GET'])
def neo4j_status():
    try:
        with driver.session() as session:
            session.run("RETURN 1")
        return jsonify({"success": True, "message": "Connected to Neo4j"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/face-analysis', methods=['POST'])
@require_api_key
def face_analysis():
    # Placeholder for actual Face Emotion Recognition
    return jsonify({
        "success": True, 
        "data": {
            "dominant": "Confident",
            "scores": {"Neutral": 20, "Happy": 15, "Focused": 25, "Nervous": 5, "Confident": 30, "Surprised": 5},
            "confidence": 89,
            "frames": 35
        }
    }), 200

@app.route('/api/voice-analysis', methods=['POST'])
@require_api_key
def voice_analysis():
    # Placeholder for actual Voice Stress Detection
    return jsonify({
        "success": True, 
        "data": {
            "stress": "Low",
            "stressScore": 22,
            "traits": {"Clarity": 85, "Pace": 75, "Confidence": 88, "Fluency": 80, "Tone Variation": 70},
            "wordsPerMin": 135,
            "pauseCount": 3,
            "duration": "1:45",
            "transcript": "Candidate answered technical questions clearly with a steady tone."
        }
    }), 200

@app.route('/api/reset-graph', methods=['DELETE'])
@require_api_key
def reset_graph():
    try:
        with driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        return jsonify({"success": True, "message": "Graph reset successfully"}), 200
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

    try:
        print()
        print("=" * 60)
        print(f"PROCESSING CV : {uploaded_file.filename}")
        print("=" * 60)

        os.makedirs("uploads", exist_ok=True)
        candidate_id = str(uuid.uuid4())
        file_ext = ".pdf" if filename_lower.endswith('.pdf') else ".docx"
        file_path = os.path.join("uploads", f"{candidate_id}{file_ext}")
        uploaded_file.save(file_path)

        with open(file_path, "rb") as f:
            if filename_lower.endswith('.pdf'):
                extracted_text = extract_text_from_pdf(f)
            else:
                extracted_text = extract_text_from_docx(f)

        # 2. Extract specific sections
        education_section = extract_section(
            extracted_text,
            ["Education", "Academic Qualifications", "Educational Qualifications", "Academic Background", "Academic Profile"]
        )

        experience_section = extract_section(
            extracted_text,
            ["Experience", "Work Experience", "Professional Experience", "Employment History", "Career History", "Work History"]
        )

        # 3. Apply NLP extraction logic
        name       = extract_name(extracted_text)
        email      = extract_email(extracted_text)
        phone      = extract_phone(extracted_text)
        skills     = extract_skills(extracted_text)

        education = extract_education(
            education_section if education_section.strip() else extracted_text
        )

        experience = extract_experience(
            experience_section if experience_section.strip() else extracted_text
        )

        summary = generate_summary(name, skills, education, experience)

        match_score = calculate_match_score(skills)

        # 4. Save to Neo4j
        neo4j_ok = store_candidate_in_neo4j(
            candidate_id, name, email, phone, skills, education, experience, match_score
        )

        # 5. Return JSON to React
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
        print(f"Error processing CV: {str(e)}")
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
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/candidates', methods=['GET'])
@require_api_key
def get_candidates():
    try:
        candidates = []
        with driver.session() as session:
            result = session.run("""
                MATCH (c:Candidate)
                OPTIONAL MATCH (c)-[:HAS_SKILL]->(s:Skill)
                OPTIONAL MATCH (c)-[:WORKED_AS]->(j:JobRole)-[:AT_COMPANY]->(co:Company)
                OPTIONAL MATCH (c)-[:HAS_EDUCATION]->(d:Degree)-[:STUDIED_AT]->(i:Institution)
                RETURN c.id AS id,
                       c.name AS name, 
                       c.email AS email, 
                       c.phone AS phone,
                       c.match_score AS match_score,
                       collect(DISTINCT s.name) AS skills,
                       collect(DISTINCT {title: j.title, company: co.name, duration: j.duration}) AS experience,
                       collect(DISTINCT {degree: d.name, institution: i.name, year: d.year}) AS education
            """)
            for record in result:
                name = record["name"]
                skills = record["skills"]
                exp_list = [e for e in record["experience"] if e.get("title") is not None]
                edu_list = [e for e in record["education"] if e.get("degree") is not None]
                
                # Ensure missing keys are gracefully handled just in case
                for e in exp_list:
                    e.setdefault("company", "Unknown")
                for e in edu_list:
                    e.setdefault("institution", "Unknown")
                
                # Mock a summary since we don't store it in Neo4j directly yet
                summary = generate_summary(name, skills, edu_list, exp_list)
                
                candidates.append({
                    "id": record.get("id") or name.lower().replace(" ", "-"),
                    "name": name,
                    "email": record["email"] or "Not Found",
                    "phone": record["phone"] or "Not Found",
                    "match": record.get("match_score") or 70,
                    "skills": skills,
                    "experience": exp_list,
                    "education": edu_list,
                    "summary": summary
                })
        return jsonify({"success": True, "data": candidates}), 200
    except Exception as e:
        print(f"Error fetching candidates: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/candidates/<candidate_id>', methods=['DELETE'])
@require_api_key
def delete_candidate(candidate_id):
    """Delete a candidate and all their relationships from Neo4j."""
    print(f"  Deleting Candidate: {candidate_id}")
    try:
        with driver.session() as session:
            # DETACH DELETE removes the node and all its incoming/outgoing relationships
            result = session.run("MATCH (c:Candidate {id: $id}) DETACH DELETE c RETURN count(c) as count", id=candidate_id)
            count = result.single()["count"]
            
        if count == 0:
            return jsonify({"success": False, "error": "Candidate not found"}), 404
            
        return jsonify({"success": True, "message": "Candidate deleted successfully"}), 200
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
    print("Starting Flask API Server on port 5000...")
    app.run(debug=True, port=5000)