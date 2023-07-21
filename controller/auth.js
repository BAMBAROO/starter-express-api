import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/Users.js";

export const user = async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log({ user });
      res.clearCookie("refreshToken");
      return res
        .status(500)
        .json({ message: "something went wrong, please relog" });
    }
    res.status(200).json({name});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "something went wrong " });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let existEmail = await User.findOne({ email: email });
    let existName = await User.findOne({ name: name });
    if (existEmail || existName)
      return res.status(401).json({ message: "email or name has been used" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log({ name, email, hashedPassword });
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ message: "register success" });
  } catch (error) {
    return res.json({ message: "something went wrong" }).status(500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).json({ message: "no user with that email" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "password is wrong" });
    const accessToken = jwt.sign(
      { email: email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { email: email, name: user.name },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    user.refrehToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    });
    res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(500).json({ message: "something went wrong " });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies["refreshToken"];
    const user = await User.findOne({ refrehToken: refreshToken });
    res.clearCookie("refreshToken");
    res.clearCookie("io");
    if (!user) {
      return res.status(403).json({ message: "forbidden" });
    }
    user.refrehToken = "";
    await user.save();
    res.status(200).json({ message: "logout success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "something went wrong" });
  }
};