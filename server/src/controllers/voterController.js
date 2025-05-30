import { Voter } from "../models/voterModel.js";
import { ErrorHandler } from "../utils/utilityClass.js";

export const voterValidation = async (req, res, next) => {
  try {
    // console.log("kkk")
    const { voter_ID, voter_DOB } = req.body;
    console.log(voter_ID);
    if (!voter_ID || !voter_DOB) {
      // return next(new ErrorHandler("Enter all fields", 400));
      return res
        .status(400)
        .json({ success: false, error: "Enter all fields" });
    }
    let voter = await Voter.findOne({ voter_ID });

    if (!voter) {
      return res
        .status(404)
        .json({ success: false, error: "Voter does not exist!" });
    }
    console.log(voter.voter_DOB);
    console.log(voter_DOB);

    // if (voter.voter_DOB !== voter_DOB) {
    //   return res
    //     .status(409)
    //     .json({ success: false, error: "invalid credentials" });
    //   // return next(new ErrorHandler("Ivalid credential", 400))
    // }

    return res.status(200).json({
      success: true,
      message: `Forwarded`,
      voter,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};
