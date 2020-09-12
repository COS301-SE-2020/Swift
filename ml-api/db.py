import psycopg2
import json
import os

with open('config/config-db.json') as db_json:
    config = json.load(db_json)

def connect():
    try:
        return psycopg2.connect(user = os.getenv("DB_USER", config["user"]), password = os.getenv("DB_PASS", config["password"]), host = os.getenv("DB_HOST", config["host"]), port = os.getenv("DB_PORT", config["port"]), database = os.getenv("DB_NAME", config["database"]))
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL ". error)

def close(connection):
    if(connection):
        connection.close();