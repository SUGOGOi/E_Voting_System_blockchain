import numpy as np
import face_recognition
from bson import ObjectId
from config.db import db
from utils.face_util import get_face_encoding


voter_collection = db["voters"]


def register_face_controller(file):
    img = face_recognition.load_image_file(file)
    encoding =get_face_encoding(img)
    return encoding.tolist()

def verify_face_controller(voter_id, file):
    print(voter_id)
    # Use voter_id directly with the voter_ID field
    voter = voter_collection.find_one({"voter_ID": str(voter_id)})
    if not voter or "encoding" not in voter:
        return {"error": "voter not found or no face data to this voter", "success":False}, 404
    known_encoding = np.array(voter["encoding"])
    img = face_recognition.load_image_file(file)
    unknown_encodings = face_recognition.face_encodings(img)
    if not unknown_encodings: 
        return {"error": "No face found", "success": False}, 400
    unknown_encoding = unknown_encodings[0]
    match = face_recognition.compare_faces([known_encoding], unknown_encoding)[0]
    print(match)
    return {"match": bool(match), "id": voter_id, "success": bool(match), "message":"Face verified"}, 200

