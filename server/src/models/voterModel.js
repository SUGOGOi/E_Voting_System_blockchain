import mongoose, { Schema } from "mongoose";

const voterSchema = new mongoose.Schema({
    voter_name: {
        type: String,
        required: [true, "please enter name"],
    },
    voter_ID: {
        type: String,
        required: [true, "please enter card id"],
        unique: [true, "Card ID already exist"],
    },
    voter_DOB: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const Voter = mongoose.model("voter", voterSchema);