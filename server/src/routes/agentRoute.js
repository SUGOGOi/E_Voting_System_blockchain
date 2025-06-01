// Route setup
import express from "express";
import {
  agentLogin,
  agentLogout,
  getVoteOfParticularCandidate,
} from "../controllers/pollingAgentController.js";
const router = express.Router();

router.post("/agent-login", agentLogin);
router.post("/agent-logout", agentLogout);
router.post("/vote-of-condidate/:candidate_ID", getVoteOfParticularCandidate);

export default router;
