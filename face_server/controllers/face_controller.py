import numpy as np
import face_recognition
from bson import ObjectId
from config.db import db
from utils.face_util import get_face_encoding


voter_collection = db["voter"]


def register_face_controller(file):
    img = face_recognition.load_image_file(file)
    encoding =get_face_encoding(img)
    return encoding.tolist()

def verify_face_controller(voter_id, file):
    object_id = ObjectId(voter_id)
    voter = voter_collection.find_one({"id":object_id})
    if not voter or "encoding" not in voter:
        return {"error" : "voter not found or no face data to this voter"}, 404
    known_encoding = np.array(voter["encoding"])
    img = face_recognition.load_image_file(file)
    unknown_encodings = face_recognition.face_encodings(img)
    if not unknown_encodings: 
        return {"error":"No face found"}, 400
    unknown_encoding = unknown_encodings[0]
    match = face_recognition.compare_faces([known_encoding], [unknown_encoding])[0]
    return {"match" : match, "id":voter_id}
