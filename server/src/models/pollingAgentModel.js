import mongoose, { Schema } from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    agent_ID: {
      type: String,
      required: [true, "Please enter agent ID"],
      unique: [true, "Agent ID already exists"],
    },
    agent_name: {
      type: String,
      required: [true, "Please enter agent name"],
    },
    email: {
      type: String,
      required: [true, "Please enter agent email"],
      unique: [true, "Email already exists"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter agent password"],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "candidate",
      required: [true, "Associated candidate is required"],
    },
  },
  { timestamps: true }
);

export const Agent = mongoose.model("agent", agentSchema);
