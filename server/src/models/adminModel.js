import mongoose, { Schema } from "mongoose";
import validator from "validator"

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter name"],
    },
    ID: {
        type: String,
        required: [true, "please enter admin id"],
        unique: [true, "Admin ID already exist"],
    },
    password: {
        type: String,
        required: [true, "please enter admin password"],
        // select: false,
    },
    role: {
        type: String,
        // required: [true, "please provide role"],
        enum: ["voting_center", "admin"],
        default: "voting_center"
    },

    PINCODE: {
        type: String,
        required: [true, "please enter PINCODE"],
        // unique: [true, "PINCODE already exist"],
        //   select: false,
    },
    address: {
        type: String,
        required: [true, "please enter  address"],
    },
    email: {
        type: String,
        required: [true, "enter email"],
        validate: validator.isEmail,

    },
    is_verified: { type: Boolean, default: true },
}, { timestamps: true });

export const Admin = mongoose.model("admin", adminSchema);