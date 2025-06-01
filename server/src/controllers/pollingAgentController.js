import {
  createWalletFromPrivateKey,
  getCandidateById,
} from "../config/contractConfig.js";
import { Agent } from "../models/pollingAgentModel.js";
import { sendToken } from "../utils/sendToken.js";

export const agentLogin = async (req, res) => {
  try {
    const { agent_ID, password } = req.body;
    console.log(agent_ID, password);

    // Validate required fields
    if (!agent_ID || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Agent ID and password are required" });
    }

    // Find agent by agent_ID
    const agent = await Agent.findOne({ agent_ID }).populate("candidateId");

    if (!agent) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid Agent ID or Password" });
    }

    // Verify password (plain text comparison - consider hashing in production)
    if (agent.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid Agent ID or password" });
    }

    // Send authentication token
    // sendToken(res, agent);
    return res
      .status(200)
      .json({ success: true, message: `Welcome ${agent.agent_name}`, agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to login, please try again later",
    });
  }
};

export const agentLogout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Agent logout successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to logout, please try again later",
    });
  }
};

export const getVoteOfParticularCandidate = async (req, res) => {
  try {
    const { candidate_ID } = req.params;
    console.log(candidate_ID);

    if (!candidate_ID) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: candidate ID",
      });
    }

    const wallet = createWalletFromPrivateKey();

    const voteData = await getCandidateById(candidate_ID, wallet);
    // console.log(voteData);

    if (!voteData) {
      return res.status(404).json({
        success: false,
        error: "Candidate not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: voteData.name,
        politicalParty: voteData.politicalParty,
        voteCount: voteData.voteCount.toNumber(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable fetch data",
    });
  }
};
