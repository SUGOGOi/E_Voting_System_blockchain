import express from "express";
import {
  admin_VC_Logout,
  adminLogin,
  getAllCandidatedetailsFromServer,
  getAllCandidatewithdetails,
  getVoterDetails,
  registerCandidate,
  registerVoter,
  registerVotingCenter,
  socketConnect,
  votingCenterLogin,
} from "../controllers/adminController.js";
import { multiUpload } from "../middlewares/multer.js";
import passport from "passport";
import { isTokenPresent } from "../middlewares/auth.js";

const router = express.Router();
//<=========================================================CREATE/REG CANDIDATE AFTER STORE IT IN BLOCKCHAIN=========================================>
router.post("/admin/register_candidate", multiUpload, registerCandidate);

//<==========================================================CREATE/REG VOTER AFTER STORE IT IN BLOCKCHAIN===============================================>
router.post("/admin/register_voter", registerVoter);

//<===========================================================CREATE/REG VOTING CENTER================================================================>
router.post("/admin/register_voting_center", registerVotingCenter);

//<==============================================================CREATE SOCKET=======================================================================>
router.post("/socket_connect", socketConnect);

//<==============================================================GET ALL CANDIDATES DETAILS WITH COUNT================================================>
router.get("/admin/get_all_candidate", getAllCandidatewithdetails);

//<==============================================================GET ALL CANDIDATES DETAILS WITH COUNT================================================>
router.get(
  "/admin/get-all-candidate-from-server",
  getAllCandidatedetailsFromServer
);

//<==============================================================GET VOTER DETAILS (IS VOTED OR NOT?)================================================>
router.get("/admin/get_voter_details/:voterId", getVoterDetails);

router.post("/voting_center_login", votingCenterLogin); //<========================VOTING CENTER LOGIN
router.post("/admin_login", adminLogin); //<=================================ADMIN LOGIN

//protected route
// router.get('/votingbooth', )
router.get("/admin", getAllCandidatewithdetails);
router.post("/logout", admin_VC_Logout);

router.get("/login-check", isTokenPresent);

export default router;
