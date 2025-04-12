import jwt from "jsonwebtoken";

export const sendToken = (res, admin) => {
  const token = jwt.sign({ _id: admin._id }, `${process.env.JWT_SECRET}`, {
    expiresIn: "10d",
  });

  const options = {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  return res
    .cookie("token", token, options)
    .status(200)
    .json({
      success: true,
      message: `Welcome back ${admin.name}`,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      is_auth: true,
      token,
    });
};
