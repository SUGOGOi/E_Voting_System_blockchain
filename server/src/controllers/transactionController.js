import { Transaction } from "../models/transactionModel.js";

// Record a new blockchain transaction
export const recordTransaction = async (req, res) => {
  try {
    const { txHash, type } = req.body;
    console.log(txHash, type);

    if (!txHash || !type) {
      return res.status(400).json({
        success: false,
        error: "Transaction hash and type are required",
      });
    }

    const validTypes = ["vote", "addCandidate", "addVoter"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid transaction type. Valid types: ${validTypes.join(
          ", "
        )}`,
      });
    }

    const existing = await Transaction.findOne({ txHash });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Transaction already recorded",
      });
    }

    const transaction = await Transaction.create({ txHash, type });

    return res.status(201).json({
      success: true,
      message: "Transaction recorded successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error recording transaction:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get only vote transactions
export const getVoteTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: "vote" }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching vote transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get only addCandidate transactions
export const getAddCandidateTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: "addCandidate" }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching addCandidate transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get only addVoter transactions
export const getAddVoterTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: "addVoter" }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching addVoter transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
