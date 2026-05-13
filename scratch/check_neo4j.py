from neo4j import GraphDatabase
import os

NEO4J_URI      = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
NEO4J_USER     = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j123")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def check_db():
    with driver.session() as session:
        print("Checking Candidate nodes...")
        result = session.run("MATCH (c:Candidate) RETURN c.id as id, c.name as name")
        candidates = list(result)
        print(f"Found {len(candidates)} Candidates.")
        for r in candidates:
            print(f"  ID: {r['id']}, Name: {r['name']}")
            
        print("\nChecking Skill nodes...")
        result = session.run("MATCH (s:Skill) RETURN count(s) as count")
        print(f"Found {result.single()['count']} Skills.")
        
        print("\nChecking Degree nodes...")
        result = session.run("MATCH (d:Degree) RETURN count(d) as count")
        print(f"Found {result.single()['count']} Degrees.")

if __name__ == "__main__":
    try:
        check_db()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.close()
