from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from routes.face_route import face_bp
from config.db import client,db

app = Flask(__name__)

CORS(app)

@app.route("/", methods=["GET"])
def root():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        
        # Fetch and print all documents in the 'voters' collection
        voters = list(db["voters"].find())
        
        return jsonify({
            "db": "ok",
            "message": "Flask API is running",
            "voters_count": len(voters)
        }), 200
    except Exception as e:
        return jsonify({
            "db": "error",
            "detail": str(e)
        }), 500

app.register_blueprint(face_bp, url_prefix="/api/faces")



