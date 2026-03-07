import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, resp) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return resp.status(400).json({ message: "Please provide all fields" });
  }

  try {
    //check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return resp.status(400).json({ message: "User already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // create JWT
    const token = generateToken(user._id);

    resp.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, resp) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return resp.status(400).json({ message: "Please provide all fields" });
  }

  try {
    //find user
    const user = await User.findOne({ email });
    if (!user) return resp.status(400).json({ message: "Invalid email or password" });

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return resp.status(400).json({ message: "Invalid email or password" });

    // create JWT
    const token = generateToken(user._id);

    resp.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};
