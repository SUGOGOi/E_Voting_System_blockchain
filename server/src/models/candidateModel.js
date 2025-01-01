import mongoose, { Schema } from "mongoose";

const candidateSchema = new mongoose.Schema({
    candidate_ID: {
        type: String,
        required: [true, "please enter candidate ID"],
        unique: [true, "candidate ID already exist"],
    },
    candidate_name: {
        type: String,
        required: [true, "please enter candidate name"],
    },
    party_name: {
        type: String,
        required: [true, "please enter unique"],
        //   select: false,
    },
    candidate_Photo: {
        type: String,
    },
    party_Photo: {
        type: String,
    },
}, { timestamps: true });

export const Candidate = mongoose.model("candidate", candidateSchema);