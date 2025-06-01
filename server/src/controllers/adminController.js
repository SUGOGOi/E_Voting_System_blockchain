import { Candidate } from "../models/candidateModel.js";
import { Agent } from "../models/pollingAgentModel.js";

import { Voter } from "../models/voterModel.js";
import { rm } from "fs";
import { socketManager } from "../socket/socketManager.js";
import { SOCKET_EVENTS } from "../socket/events.js";
import { Admin } from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken.js";
import {
  createWalletFromPrivateKey,
  getVoterByHash,
} from "../config/contractConfig.js";
import CryptoJS from "crypto-js";

// Fixed salt for consistent hashing
const FIXED_SALT = "voting_system_salt_2025_secure";

// Utility function to compute voter hash
const computeVoterHash = (name, dob, voterId, salt = FIXED_SALT) => {
  const combined = `${name}${dob}${voterId}${salt}`;
  const hash = CryptoJS.SHA256(combined);
  return new Uint8Array(
    hash.words.flatMap((word) => [
      (word >>> 24) & 0xff,
      (word >>> 16) & 0xff,
      (word >>> 8) & 0xff,
      word & 0xff,
    ])
  );
};

//<=============================================REG CANDIDATE================================================================>
export const registerCandidate = async (req, res, next) => {
  try {
    const { candidate_name, party_name, candidate_ID, PDA } = req.body;

    const { file1, file2 } = req.files;

    if (!file1) {
      rm(file2[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(400).json({ error: "Upload photo" });
    }
    if (!file2) {
      rm(file1[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(400).json({ error: "Upload photo" });
    }

    if (!candidate_name || !party_name || !candidate_ID || !PDA) {
      rm(file1[0].path, () => {
        console.log(`${file1[0].originalname} deleted`);
      });
      rm(file2[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(400).json({ error: "Please enter all fields!" });
    }

    let candidate = await Candidate.findOne({ candidate_ID });

    if (candidate) {
      rm(file1[0].path, () => {
        console.log(`${file1[0].originalname} deleted`);
      });
      rm(file2[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(409).json({ error: "candidate id already exist" });
    }

    candidate = await Candidate.create({
      candidate_ID,
      candidate_name,
      party_name,
      candidate_Photo: file1[0].path,
      party_Photo: file2[0].path,
      PDA,
    });
    return res.status(201).json({
      success: true,
      message: `Candidate Registered(Database)`,
      candidate,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(409)
      .json({ error: "Registration Unsuccessful(Database)" });
  }
};

//<=================================================REG VOTER=======================================================================>
export const registerVoter = async (req, res, next) => {
  try {
    const { voter_name, voter_ID, voter_DOB, encoding, salt } = req.body;
    console.log(voter_name, voter_ID, voter_DOB);

    if (!encoding) {
      return res.status(400).json({
        error: "No face data, Try again!",
      });
    }

    if (!voter_name || !voter_ID || !voter_DOB) {
      return res.status(400).json({
        error: "Enter all fields",
      });
    }

    let voter = await Voter.findOne({ voter_ID });

    if (voter) {
      return res.status(409).json({
        error: "Voter already exist!",
      });
    }

    // Store salt in database for future reference
    const voterSalt =
      salt || `${voter_ID}_${Date.now()}_${Math.random().toString(36)}`;

    voter = await Voter.create({
      voter_name,
      voter_ID,
      voter_DOB,
      encoding,
      salt: voterSalt, // Store salt for hash computation
    });

    return res.status(201).json({
      success: true,
      message: `Registration successful`,
      voter: {
        voter_name: voter.voter_name,
        voter_ID: voter.voter_ID,
        voter_DOB: voter.voter_DOB,
        // Don't return salt in response for security
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Registration Unsuccessful`,
    });
  }
};

//<==============================UPDATED GET VOTER DETAILS==========================================>
export const getVoterDetails = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { name, dob } = req.query; // Only use name and dob from request

    console.log(voterId);
    console.log(name);
    console.log(dob);

    if (!voterId || !name || !dob) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, dob, or voterId",
      });
    }

    const wallet = createWalletFromPrivateKey();
    const voterHash = computeVoterHash(name, dob, voterId); // Uses FIXED_SALT

    const blockchainVoter = await getVoterByHash(voterHash, wallet);
    console.log(blockchainVoter);

    if (!blockchainVoter) {
      return res.status(404).json({
        success: false,
        error: "Voter not found on blockchain or invalid credentials",
      });
    }

    return res.status(200).json({
      success: true,
      voter: {
        hasVoted: blockchainVoter.hasVoted,
      },
    });
  } catch (error) {
    console.error("Error fetching voter details:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

//<=============================================REG VOTING CENTER===============================================>
export const registerVotingCenter = async (req, res, next) => {
  try {
    const { name, ID, password, PINCODE, address, email } = req.body;

    if (!name || !ID || !password || !PINCODE || !address || !email) {
      return res
        .status(400)
        .json({ success: false, error: "Enter all fields" });
    }

    let votingCenter = await Admin.findOne({ ID });

    if (votingCenter) {
      return res
        .status(409)
        .json({ success: false, error: "Voting center ID already exist!" });
    }

    votingCenter = await Admin.create({
      name,
      ID,
      password,
      PINCODE,
      address,
      email,
    });
    return res.status(201).json({
      success: true,
      message: `Registration successful`,
      votingCenter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Registration Unsuccessful`,
    });
  }
};

//<=======================================reg polling agent==================================>

export const addAgent = async (req, res) => {
  try {
    const { agent_ID, agent_name, email, password, candidate_ID } = req.body;

    // Validate required fields
    if (!agent_ID || !agent_name || !email || !password || !candidate_ID) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ agent_ID });
    if (existingAgent) {
      return res
        .status(409)
        .json({ success: false, error: "Agent ID already exists" });
    }

    // Validate candidate ID
    const candidate = await Candidate.findOne({ candidate_ID });
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found" });
    }

    // Check if candidate already has an agent
    const existingCandidateAgent = await Agent.findOne({
      candidateId: candidate._id,
    });
    if (existingCandidateAgent) {
      return res.status(409).json({
        success: false,
        error: "This candidate already has an assigned agent",
      });
    }

    // Create new agent
    const newAgent = new Agent({
      agent_ID,
      agent_name,
      email,
      password, // In production, hash password before saving
      candidateId: candidate._id,
    });

    await newAgent.save();

    res.status(201).json({
      success: true,
      message: "Agent added successfully",
      agent: newAgent,
    });
  } catch (error) {
    console.error("Error adding agent:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

//<========================================CONNECT SOCKET====================================>
export const socketConnect = async (req, res) => {
  try {
    const io = socketManager.getIO();
    const { message } = req.body;

    io.emit(SOCKET_EVENTS.SERVER_EVENT, { message });

    return res
      .status(200)
      .json({ success: true, message: "Event triggered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

//<==============================GET ALL CANDIDATES WITH VOTES==========================================>
export const getAllCandidatewithdetails = async (req, res) => {
  try {
    const candidates = await contract.getAllCandidates();
    const formattedCandidates = candidates.map((candidate) => ({
      name: candidate.name,
      id: candidate.id.toString(),
      voteCount: candidate.voteCount.toString(),
      politicalParty: candidate.politicalParty,
    }));
    return res.status(200).json({ success: true, formattedCandidates });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

//<=====================================VOTING CENTER LOGIN================================================>
export const votingCenterLogin = async (req, res) => {
  try {
    const { ID, password } = req.body;

    if (!ID || !password) {
      return res
        .status(400)
        .json({ success: false, error: "ID and password are required" });
    }

    const votingCenter = await Admin.findOne({ ID });

    if (!votingCenter) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid ID or Password" });
    }

    if (!votingCenter.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Voting center is not verified" });
    }

    if (votingCenter.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid ID or password" });
    }

    if (votingCenter.role !== "voting_center") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    res.status(200).json({
      voting_center: {
        ID: votingCenter.ID,
        email: votingCenter.email,
        name: votingCenter.name,
        role: votingCenter.role,
      },
      status: "success",
      message: "Login successful",
      is_auth: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to login, please try again later",
    });
  }
};

//<====================================ADMIN LOGIN=============================>
export const adminLogin = async (req, res) => {
  try {
    const { ID, password } = req.body;
    console.log(ID, password);

    if (!ID || !password) {
      return res
        .status(400)
        .json({ success: false, error: "ID and password are required" });
    }

    const admin = await Admin.findOne({ ID });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid ID or Password" });
    }

    if (!admin.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Voting center is not verified" });
    }

    if (admin.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid ID or password" });
    }

    if (admin.role !== "admin") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    sendToken(res, admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to login, please try again later",
    });
  }
};

//<=============================================================LOGOUT================================
export const admin_VC_Logout = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to logout, please try again later",
    });
  }
};

//<=============================================GET ALL CANDIDATE FROM SERVER============================================>
export const getAllCandidatedetailsFromServer = async (req, res) => {
  try {
    const candidates = await Candidate.find({});

    if (candidates.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No candidate Available" });
    }

    return res.status(200).json({
      success: true,
      candidates,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
