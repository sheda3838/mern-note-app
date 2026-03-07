import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, resp, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //get token from header
      token = req.headers.authorization.split(" ")[1];

      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //get user from database
      const user = await User.findById(decoded.id).select("_id");

      if (!user) {
        return resp.status(401).json({message: "User not found"});
      }

      //attach user to request
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return resp.status(401).json({message: "Not authorized, token failed"});
    }
  }

  if (!token) {
    return resp.status(401).json({message: "Not authorized, no token"});
  }
};
