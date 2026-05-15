from neo4j import GraphDatabase
import os

NEO4J_URI      = "neo4j://127.0.0.1:7687"
NEO4J_USER     = "neo4j"
NEO4J_PASSWORD = "neo4j123"

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        res = session.run("MATCH (r:Requirement) RETURN r.id AS id LIMIT 5")
        print("Requirements found:", [r["id"] for r in res])
    driver.close()
except Exception as e:
    print("Connection failed:", e)
