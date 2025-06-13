const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // Check if it starts with 'Bearer '
    if (!req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format, must use Bearer token",
      });
    }

    // Extract token
    const token = req.headers.authorization.split(" ")[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    // Debug token format
    console.log(`Token prefix: ${token.substring(0, 15)}...`);

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", {
        name: jwtError.name,
        message: jwtError.message,
        token:
          token.length > 30
            ? `${token.substring(0, 15)}...`
            : "Token too short",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        error: jwtError.name,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error processing authentication",
    });
  }
};
