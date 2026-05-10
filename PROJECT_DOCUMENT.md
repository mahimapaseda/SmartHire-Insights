# SmartHire Insights — Project Document

---

## Project Aim

The aim of this project is to develop an intelligent CV and interview analysis system that supports recruitment by combining Natural Language Processing, graph-based candidate profiling using Neo4j, and API-based behavioral analysis.

The system is designed to:
- Extract and structure candidate information from CVs
- Generate meaningful summaries
- Support dynamic recruiter queries
- Provide supplementary interview insights through facial emotion recognition and voice stress detection

The overall goal is to improve the efficiency, scalability, and quality of candidate evaluation in modern recruitment environments.

---

## Project Objectives

1. Design and implement a CV upload and parsing mechanism that can process documents in multiple formats such as PDF and DOCX.
2. Apply Natural Language Processing techniques to extract key candidate information, including education, work experience, skills, certifications, and achievements.
3. Structure the extracted information into a Neo4j graph database for efficient relationship modeling and querying.
4. Generate automated candidate summaries that highlight the most relevant qualifications for recruiter review.
5. Develop a filtering and search interface that allows recruiters to shortlist candidates based on defined criteria.
6. Integrate an API-based Facial Emotion Recognition component to provide supplementary emotional indicators during interview analysis.
7. Integrate an API-based Voice Stress Detection component to provide supplementary vocal stress indicators during interview analysis.
8. Evaluate the effectiveness of the system in terms of CV parsing accuracy, graph-based retrieval, candidate filtering, and overall recruitment decision support.

---

## Project Methodology

The project follows a modular and iterative system development methodology. Each major component is developed and tested independently before being integrated into the full platform.

### 1. Literature Review
A review of existing studies is conducted to understand prior work in CV parsing, recruitment automation, graph-based candidate modeling, facial emotion recognition, and voice stress analysis. This helps identify research gaps and define the system design.

### 2. Data Collection and Preparation
Relevant datasets are selected for CV processing and interview analysis. Public resume datasets and synthetic CV samples are used for testing the CV parsing module. Interview-related image and audio inputs are prepared for use with the behavioral analysis APIs.

### 3. CV Parsing and Information Extraction
Candidate CVs are uploaded and converted into machine-readable text. NLP techniques are then applied to extract structured details such as personal information, education, skills, and work experience.

### 4. Graph-Based Candidate Modeling
The extracted CV data is transformed into nodes and relationships and stored in Neo4j. This allows candidate information to be explored through graph-based queries and recruiter filtering.

### 5. Candidate Summarization
The structured profile data is used to generate concise summaries that help recruiters review applicants more efficiently.

### 6. API-Based Interview Analysis
Facial Emotion Recognition and Voice Stress Detection are integrated through external APIs. These are not treated as the major research component of the project, but as supportive services that provide additional behavioral indicators during interview review.

### 7. System Integration
All modules are connected through a backend architecture so that CV parsing, graph storage, candidate filtering, and interview analysis work together as a single platform.

### 8. Evaluation
The system is evaluated using appropriate measures such as precision, recall, F1-score, query relevance, response time, and recruiter-oriented usability indicators. Comparisons are also made with baseline approaches such as keyword-based screening.

---

## Technologies Used

### Natural Language Processing and Text Processing
| Technology | Purpose |
|---|---|
| Python | Core language for NLP pipeline |
| SpaCy | Named entity extraction and text analysis |
| NLTK | Text preprocessing and tokenization |
| Regular Expressions | Pattern-based information extraction |

### Document Processing
| Technology | Purpose |
|---|---|
| PDF parsing libraries | Extract text from uploaded PDF CVs |
| DOCX processing libraries | Extract text from Word document CVs |

### Graph Database
| Technology | Purpose |
|---|---|
| Neo4j | Model candidate profiles as graph nodes and relationships |
| Cypher Query Language | Query and filter candidate data from the graph |

### Backend Development
| Technology | Purpose |
|---|---|
| Python Flask | Application logic, API communication, system integration |

### Frontend Development
| Technology | Purpose |
|---|---|
| React (current) | Recruiter interface — CV upload, filtering, profile review |
| HTML / CSS / JavaScript | Base web technologies |

### Visualization
| Technology | Purpose |
|---|---|
| Neo4j Bloom | Graph visualization of candidate relationships |
| D3.js | Custom candidate relationship display |

### Behavioral Analysis APIs
| Technology | Purpose |
|---|---|
| Facial Emotion Recognition API | Emotion-related outputs from interview image/video input |
| Voice Stress Analysis API | Stress-related outputs from candidate speech during interviews |

---

## Team & Task Allocation

### Anuruddha
- Backend — NLP Model
- Backend — PDF Extraction
- Backend — Neo4j Mapping
- Backend — NLP Fine-tuning for larger count PDF managing
- Neo4j Screening

### Mahima
- Frontend — Basic Interfaces
- Face Recognition API
- Voice Recognition API
- Result Analysis Window

---

*SmartHire Insights · v1.0.0*
