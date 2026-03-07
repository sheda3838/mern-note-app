import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, resp) => {
  const { name, email, password } = req.body;

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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

  try {
    //find user
    const user = await User.findOne({ email });
    if (!user) return resp.status(400).json({ message: "User not found" });

    //check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return resp.status(400).json({ message: "Incorrect email or password" });

    // create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    resp.json({
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
