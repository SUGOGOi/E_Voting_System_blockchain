import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";

export const isTokenPresent = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    // console.log(token);

    if (!token)
      return res
        .status(401)
        .json({ success: false, error: "Please login first" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Admin.findById(decoded._id);

    return res.status(200).json({ success: true, isLogin: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
