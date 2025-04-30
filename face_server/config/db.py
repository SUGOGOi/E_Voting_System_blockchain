import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_LOCAL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI or not DATABASE_NAME:
    raise Exception("Missing MONGO_LOCAL or DATABASE_NAME in environment variables.")


client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
