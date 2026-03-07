import User from "../models/User.js";

//get all useres except current user
export const getUsers = async (req, resp) => {
  const userId = req.user.id;

  try {
    const users = await User.find({ _id: { $ne: userId } }).select("name email");


    resp.status(200).json({ users });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Server error" });
  }
};
