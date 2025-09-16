const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // If token is invalid, continue without user (don't throw error)
      console.log("Invalid token provided, continuing without auth");
      req.user = null;
    }
  }

  // Continue regardless of authentication status
  next();
};

module.exports = { optionalAuth };