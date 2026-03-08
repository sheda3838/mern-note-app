import User from "../models/User.js";

//get all useres except current logged in user
export const getUsers = async (req, resp) => {
  const userId = req.user.id;

  try {
    const users = await User.find({ _id: { $ne: userId } })
      .select("name email")
      .sort({ name: 1 });

    resp.status(200).json({ 
      success: true,
      message: "Users fetched successfully",
      data: { users } 
    });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ success: false, message: "Server error" });
  }
};
