import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    txHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      unique: true,
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: ["vote", "addCandidate", "addVoter"],
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
