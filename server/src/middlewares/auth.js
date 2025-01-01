import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";

export const isAuthenticated = catchAsyncError(async(req, res, next) => {
    const { token } = req.cookies;

    if (!token) return res.status(201).json({ successfalse, error: "Not Logged In" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Admin.findById(decoded._id);

    next();
});

export const authorizedAdmin = (req, res, next) => {
    if (req.user.role !== "admin")
        return next(
            new ErrorHandler(
                `${req.user.role} is not allowed to access this resourse`,
                403
            )
        );

    next();
};


export const authorizedSubscribers = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
        return next(
            new ErrorHandler(
                `Only Subscribers can access this resource`,
                403
            )
        )
    } else {

    }

    next();
};