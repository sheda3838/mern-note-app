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

      //attach user to req
      req.user = { id: decoded.id };

      next(); // move to controller
    } catch (error) {
      console.error(error);
      resp.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    resp.status(401).json({ message: "Not authorized, no token" });
  }
};