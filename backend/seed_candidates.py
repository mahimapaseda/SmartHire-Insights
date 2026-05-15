from neo4j import GraphDatabase
import os
import hashlib

NEO4J_URI      = "neo4j://127.0.0.1:7687"
NEO4J_USER     = "neo4j"
NEO4J_PASSWORD = "neo4j123"

def make_id(email):
    return f"c_{hashlib.sha256(email.lower().strip().encode()).hexdigest()[:24]}"

candidates = [
    {"name": "James Peris", "email": "james@example.com", "role": "Full Stack Developer", "match": 98},
    {"name": "Nimal", "email": "nimal@example.com", "role": "Full Stack Developer", "match": 85},
    {"name": "Mahima Paseda", "email": "mahima@smarthire.ai", "role": "Full Stack Developer", "match": 92},
    {"name": "Kusumsiri Gamage", "email": "kusum@example.com", "role": "Software Engineer Intern", "match": 75},
    {"name": "Charith Nimal", "email": "charith@example.com", "role": "Software Engineer Intern", "match": 88}
]

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        # Clear existing
        session.run("MATCH (n:Candidate) DETACH DELETE n")
        
        for c in candidates:
            c_id = make_id(c["email"])
            session.run("""
                MERGE (c:Candidate {id: $id})
                SET c.name = $name, c.email = $email, c.match_score = $match, c.summary = 'Demo summary'
                MERGE (j:JobRole {title: $role})
                MERGE (co:Company {name: 'SmartHire Demo'})
                MERGE (c)-[:WORKED_AS]->(j)
                MERGE (j)-[:AT_COMPANY]->(co)
                
                MERGE (s:Skill {name: 'React'})
                MERGE (c)-[:HAS_SKILL]->(s)
                
                MERGE (d:Degree {name: 'BSc Computer Science'})
                MERGE (i:Institution {name: 'University of SmartHire'})
                MERGE (c)-[:HAS_EDUCATION]->(d)
                MERGE (d)-[:STUDIED_AT]->(i)
            """, id=c_id, name=c["name"], email=c["email"], match=c["match"], role=c["role"])
            print(f"Seeded {c['name']}")
    driver.close()
    print("Seeding complete.")
except Exception as e:
    print("Seeding failed:", e)
