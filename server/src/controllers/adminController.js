import { Candidate } from "../models/candidateModel.js";
import { Voter } from "../models/voterModel.js";
import { rm } from "fs";
import { socketManager } from "../socket/socketManager.js";
import { SOCKET_EVENTS } from "../socket/events.js";
import { Admin } from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken.js";
import {
  createWalletFromPrivateKey,
  getVoterById,
} from "../config/contractConfig.js";

//<=============================================REG CANDIDATE================================================================>
export const registerCandidate = async (req, res, next) => {
  try {
    const { candidate_name, party_name, candidate_ID } = req.body;

    const { file1, file2 } = req.files;

    //   const fileUri1 = getDataUri(file1);
    //   const fileUri2 = getDataUri(file2);

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

    if (!candidate_name || !party_name || !candidate_ID) {
      rm(file1[0].path, () => {
        console.log(`${file1[0].originalname} deleted`);
      });
      rm(file2[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(400).json({ error: "Please enter all fields!" });
    }

    let candidate = await Candidate.findOne({ candidate_ID });

    // console.log(candidate)

    if (candidate) {
      rm(file1[0].path, () => {
        console.log(`${file1[0].originalname} deleted`);
      });
      rm(file2[0].path, () => {
        console.log(`${file2[0].originalname} deleted`);
      });
      return res.status(409).json({ error: "candidate id already exist" });
    }

    // const tx = await contract.addCandidate(candidate_name, candidate_ID, politicalParty);
    // await tx.wait(); // Wait for the transaction to be mined

    candidate = await Candidate.create({
      candidate_ID,
      candidate_name,
      party_name,
      candidate_Photo: file1[0].path,
      party_Photo: file2[0].path,
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
    const { voter_name, voter_ID, voter_DOB, encoding } = req.body;
    console.log(voter_name, voter_ID, voter_DOB);

    if (!encoding) {
      return res.status(400).json({
        error: "No face data, Try again!",
      });
    }

    if (!voter_name || !voter_ID || !voter_DOB) {
      // return next(new ErrorHandler("Enter all fields", 400));
      return res.status(400).json({
        error: "Enter all fields",
      });
    }

    let voter = await Voter.findOne({ voter_ID });
    // console.log(voter)

    if (voter) {
      // return next(new ErrorHandler("Voter already exist!", 409));
      return res.status(409).json({
        error: "Voter already exist!",
      });
    }

    voter = await Voter.create({
      voter_name,
      voter_ID,
      voter_DOB,
      encoding,
    });

    // console.log(voter)

    return res.status(201).json({
      success: true,
      message: `Registration successful`,
      voter,
    });
  } catch (error) {
    // return next(new ErrorHandler("Registration Unsuccessful", 500));
    return res.status(500).json({
      success: false,
      error: `Registration Unsuccessful`,
    });
  }
};

//<=============================================REG VOTING CENTER===============================================>
export const registerVotingCenter = async (req, res, next) => {
  try {
    const { name, ID, password, PINCODE, address, email } = req.body;

    if (!name || !ID || !password || !PINCODE || !address || !email) {
      //   next(new ErrorHandler("Enter all fields", 400));
      return res
        .status(400)
        .json({ success: false, error: "Enter all fields" });
    }

    let votingCenter = await Admin.findOne({ ID });

    if (votingCenter) {
      // next(new ErrorHandler("Voting center ID already exist!", 409));
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
    // return next(new ErrorHandler("Registration Unsuccessful", 500));
    return res.status(500).json({
      success: false,
      error: `Registration Unsuccessful`,
    });
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
    // return next(new ErrorHandler({ success: false, message: error.message }, 500));
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
    // return next(new ErrorHandler({ success: false, message: error.message }, 500));
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

//<==============================GET VOTER DETAILS==========================================>
export const getVoterDetails = async (req, res) => {
  try {
    const { voterId } = req.params;

    if (!voterId) {
      return res.status(400).json({ success: false, error: "invalid voterId" });
    }

    // console.log(voterId);
    const wallet = createWalletFromPrivateKey();
    // console.log(wallet);,
    const voter = await getVoterById(voterId, wallet);

    if (voter) {
      return res.status(200).json({ success: true, voter });
    }
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
    // Check if email and password are provided
    console;
    if (!ID || !password) {
      return res
        .status(400)
        .json({ success: false, error: "ID and password are required" });
    }

    // Find user by email
    const votingCenter = await Admin.findOne({ ID });

    // Check if user exists
    if (!votingCenter) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid ID or Password" });
    }

    // Check if user verified
    if (!votingCenter.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Voting center is not verified" });
    }

    // Compare passwords / Check Password
    if (votingCenter.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid ID or password" });
    }

    if (votingCenter.role !== "voting_center") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Generate tokens

    // Set Cookies

    // Send success response with tokens
    res.status(200).json({
      voting_center: {
        ID: votingCenter.ID,
        email: votingCenter.email,
        name: votingCenter.name,
        role: votingCenter.role,
      },
      status: "success",
      message: "Login successful",
      // access_token: accessToken,
      // refresh_token: refreshToken,
      // access_token_exp: accessTokenExp,
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

//<====================================GET ACCESS TOKEN====================================>
//<====================================ADMIN LOGIN=============================>
export const adminLogin = async (req, res) => {
  try {
    const { ID, password } = req.body;
    // Check if email and password are provided
    if (!ID || !password) {
      return res
        .status(400)
        .json({ success: false, error: "ID and password are required" });
    }
    // Find user by email
    const admin = await Admin.findOne({ ID });

    // Check if user exists
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid ID or Password" });
    }

    // Check if user verified
    if (!admin.is_verified) {
      return res
        .status(401)
        .json({ success: false, error: "Voting center is not verified" });
    }

    // Compare passwords / Check Password
    if (admin.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid ID or password" });
    }

    if (admin.role !== "admin") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Set Cookies
    sendToken(res, admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unable to login, please try again later",
    });
  }
};

//<===========================================GET NEW ACCESS TOKEN

//<=============================================================LOGOUT================================
export const admin_VC_Logout = async (req, res) => {
  try {
    // Clear token
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
    // const votng_center = await Admin.findOne({ ID })

    // if (!votng_center) {
    //     return res.status(401).json({ success: false, message: "Unauthorized" });
    // }

    // if (role !== "voting_center") {
    //     return res.status(401).json({ success: false, message: "Unauthorized" });
    // }

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
    // return next(new ErrorHandler({ success: false, message: error.message }, 500));
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
