import express from "express";
import {
  recordTransaction,
  getAllTransactions,
  getVoteTransactions,
  getAddCandidateTransactions,
  getAddVoterTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/record", recordTransaction);
router.get("/all", getAllTransactions);
router.get("/votes", getVoteTransactions);
router.get("/candidates", getAddCandidateTransactions);
router.get("/voters", getAddVoterTransactions);

export default router;
