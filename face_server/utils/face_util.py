import face_recognition

def get_face_encoding(image):
    face_locations = face_recognition.face_locations(image)
    if not face_locations:
        raise Exception("No face detected")
    if len(face_locations)>1:
        raise Exception("Multiple faces detected")
    return face_recognition.face_encodings(image, face_locations)[0]