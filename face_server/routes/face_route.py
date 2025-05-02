from flask import Blueprint, request, jsonify
from controllers.face_controller import register_face_controller, verify_face_controller

face_bp = Blueprint("face_bp", __name__)

@face_bp.route("/register", methods=["POST"])
def register_face():
    if "file" not in request.files:
        return jsonify({"error" :"No file uploaded"}), 400
    file = request.files["file"]
    try:
        encoding = register_face_controller(file)
        return jsonify({"encoding" :encoding, "success":True, "message":"Face saved temporarily"}), 200
    except Exception as e:
        return jsonify({"error":str(e), "success":False}),500
    
@face_bp.route("/verify",methods=["POST"])
def verify_face():
    voter_id = request.args.get("voter_id")
    if not voter_id or "file" not in request.files:
        return jsonify({"error":"missing id or file", "success":False}),400
    file = request.files['file']
    try:
        result, status_code = verify_face_controller(voter_id, file)
        print(result)
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error":str(e),"success":False}),400