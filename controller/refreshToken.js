import jwt from "jsonwebtoken";
import User from "../model/Users.js";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies["refreshToken"];
    const user = await User.findOne({ refrehToken: refreshToken });
    if (!user)
      return res.status(403).json({ message: "can't get refreshToken" });
    const accessToken = jwt.sign(
      { email: user.email, name: user.name },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "60s",
      }
    );
    res.status(200).json({ accessToken });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "something went wrong " });
  }
};