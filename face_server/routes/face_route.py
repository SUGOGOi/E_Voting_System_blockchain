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
        return jsonify({"encoding" :encoding}), 200
    except Exception as e:
        return jsonify({"error":str(e)}),500
    
@face_bp.route("/verify",methods=["POST"])
def verify_face():
    voter_id = request.args.get("id")
    if not voter_id or "file" not in request.files:
        return jsonify({"error":"missing id or file"}),400
    file = request.files['file']
    try:
        result = verify_face_controller(voter_id, file)
        if isinstance(result, tuple):
            return jsonify(result[0], result[1])
        return result[0]
    except Exception as e:
        return jsonify({"error":str(e)}),400