import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_ONLINE")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI or not DATABASE_NAME:
    raise Exception("Missing MONGO_ONLINE or DATABASE_NAME in environment variables.")


client = MongoClient(MONGO_URI)

# Connection check (add this block)
try:
    client.admin.command('ping')  # or 'ping' for newer MongoDB versions
    print("MongoDB connection successful.")
except Exception as e:
    print("MongoDB connection failed:", str(e))
    raise e


db = client[DATABASE_NAME]


