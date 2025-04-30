from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from routes.face_route import face_bp

app = Flask(__name__)

CORS(app)

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message":"Flask API is running"})

app.register_blueprint(face_bp, url_prefix="/api/faces")



