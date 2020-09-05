import psycopg2
import json

with open('config/config-db.json') as db_json:
    config = json.load(db_json)

def connect():
    try:
        return psycopg2.connect(user = config["user"], password = config["password"], host = config["host"], port = config["port"], database = config["database"])
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL ". error)

def close(connection):
    if(connection):
        connection.close();