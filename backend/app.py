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

from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz
import spacy
import re
from neo4j import GraphDatabase
import atexit

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests from React frontend


# =========================================================
# LOAD SPACY MODEL
# =========================================================

nlp = spacy.load("en_core_web_sm")


# =========================================================
# NEO4J CONNECTION  (Desktop - no TLS, no database= arg)
# =========================================================

NEO4J_URI      = "neo4j://127.0.0.1:7687"
NEO4J_USER     = "neo4j"
NEO4J_PASSWORD = "neo4j123"

driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

atexit.register(driver.close)

print("=" * 55)
print("  Neo4j Driver Initialised")
print(f"  URI      : {NEO4J_URI}")
print(f"  User     : {NEO4J_USER}")
print("=" * 55)


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

    lines    = text.split('\n')
    combined = " ".join(lines[:10])
    doc      = nlp(combined)

    blacklist = [
        "curriculum vitae", "resume", "cv", "reference",
        "profile", "summary", "objective"
    ]

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate_name = ent.text.strip()
            if candidate_name.lower() not in blacklist:
                if 1 < len(candidate_name.split()) <= 5:
                    return candidate_name

    for line in lines[:5]:
        line = line.strip()
        if (
            line
            and len(line.split()) <= 5
            and not any(kw in line.lower() for kw in blacklist)
            and not re.search(r'[@\d]', line)
        ):
            return line

    return "Not Found"


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
    "Artificial Intelligence", "Neo4j", "Spark", "Hadoop"
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


# =========================================================
# DISPLAY HELPERS
# =========================================================

def display_education(education_list):

    if not education_list:
        st.write("No education details found.")
        return

    for edu in education_list:
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown(f"**{edu['degree']}**")
            st.caption(edu['institution'])
        with col2:
            st.markdown(f"🗓 {edu['year']}")
        st.divider()


def display_experience(experience_list):

    if not experience_list:
        st.write("No work experience details found.")
        return

    for exp in experience_list:
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown(f"**{exp['title']}**")
            st.caption(exp['company'])
        with col2:
            st.markdown(f"🗓 {exp['duration']}")
        st.divider()


# =========================================================
# STORE DATA IN NEO4J
# =========================================================

# =========================================================

def store_candidate_in_neo4j(name, email, phone,
                              skills, education, experience):

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
                MERGE (c:Candidate {name: $name})
                SET   c.email = $email,
                      c.phone = $phone
            """, name=name, email=email, phone=phone)

            print(f"        Candidate node created  ->  name='{name}'")

            # ──────────────────────────────────────────────
            # STEP 2 — Skill nodes
            # ──────────────────────────────────────────────
            print(f"  [2/4] Creating Skill nodes  ({len(skills)} skills)...")

            for skill in skills:
                session.run("""
                    MATCH (c:Candidate {name: $name})
                    MERGE (s:Skill     {name: $skill})
                    MERGE (c)-[:HAS_SKILL]->(s)
                """, name=name, skill=skill)
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
                    MATCH  (c:Candidate   {name:  $name})
                    MERGE  (d:Degree      {name:  $degree})
                    SET    d.year = $year
                    MERGE  (i:Institution {name:  $institution})
                    MERGE  (c)-[:HAS_EDUCATION]->(d)
                    MERGE  (d)-[:STUDIED_AT]->(i)
                """, name=name, degree=degree,
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

                title    = exp.get("title",    "Unknown Title")
                company  = exp.get("company",  "Unknown Company")
                duration = exp.get("duration", "Unknown Duration")

                session.run("""
                    MATCH  (c:Candidate {name:    $name})
                    MERGE  (j:JobRole   {title:   $title})
                    SET    j.duration = $duration
                    MERGE  (co:Company  {name:    $company})
                    MERGE  (c)-[:WORKED_AS]->(j)
                    MERGE  (j)-[:AT_COMPANY]->(co)
                """, name=name, title=title,
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

@app.route('/api/upload', methods=['POST'])
def upload_cv():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    uploaded_file = request.files['file']
    
    if uploaded_file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400

    if not uploaded_file.filename.lower().endswith('.pdf'):
        return jsonify({"success": False, "error": "Only PDF files are supported"}), 400

    try:
        print()
        print("=" * 60)
        print(f"PROCESSING CV : {uploaded_file.filename}")
        print("=" * 60)

        # 1. Extract text from PDF
        extracted_text = extract_text_from_pdf(uploaded_file)

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

        # 4. Save to Neo4j
        neo4j_ok = store_candidate_in_neo4j(
            name, email, phone, skills, education, experience
        )

        # 5. Return JSON to React
        return jsonify({
            "success": True,
            "neo4j_saved": neo4j_ok,
            "data": {
                "name": name,
                "email": email,
                "phone": phone,
                "skills": skills,
                "education": education,
                "experience": experience,
                "summary": summary,
                "source": uploaded_file.filename
            }
        }), 200

    except Exception as e:
        print(f"Error processing CV: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask API Server on port 5000...")
    app.run(debug=True, port=5000)