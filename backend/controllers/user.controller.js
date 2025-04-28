const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail, sendAccountDeletionEmail, sendAccountDeletionConfirmationEmail
} = require("../services/email.service");

// Configure Cloudinary for changing profile picture
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          userExists.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store registration data in session/cache temporarily
    // You can use Redis or other session storage here
    const tempUserData = {
      fullName,
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 30 * 60000), // 30 minutes
    };

    try {
      // Send verification email first
      await sendVerificationEmail({ email, fullName, verificationCode });

      // Store temp user data in session/cache with expiry
      // For now, we'll store it in the response
      res.status(200).json({
        success: true,
        message: "Please verify your email to complete registration",
        data: {
          email,
          fullName,
          tempToken: jwt.sign({ ...tempUserData }, process.env.JWT_SECRET, {
            expiresIn: "30m",
          }),
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    console.log("login received in backend");
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password. Please try again.",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password - Please try again.",
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        theme: user.theme,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login with Google
// @route   POST /api/users/login/google
// @access  Public
exports.loginWithGoogle = async (req, res) => {
  try {
    const { email, name, photo } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // This is a new user - set flag for welcome email
      isNewUser = true;

      // Create new user if doesn't exist
      user = await User.create({
        fullName: name,
        username: email.split("@")[0], // Generate username from email
        email,
        password: crypto.randomBytes(16).toString("hex"),
        profilePicture: photo || "",
        isVerified: true, // Google users are pre-verified
        authProvider: "google",
      });

      // Send welcome email for new Google users
      try {
        await sendWelcomeEmail(user);
        console.log(`Welcome email sent to new Google user: ${email}`);
      } catch (emailError) {
        console.error("Welcome email failed to send:", emailError);
        // Continue even if welcome email fails (non-critical)
      }
    } else {
      // Update existing user to mark as Google user if they're signing in with Google
      if (!user.authProvider || user.authProvider !== "google") {
        user.authProvider = "google";
        await user.save();
      }

      // Update user profile picture if it exists
      if (photo && !user.profilePicture) {
        user.profilePicture = photo;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || photo,
        theme: user.theme,
        createdAt: user.createdAt,
        isVerified: true,
        authProvider: user.authProvider,
        token: generateToken(user._id),
        isNewUser, // Optionally include this flag in response
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to authenticate with Google",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Modify the verify email endpoint to create the user
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode, tempToken } = req.body;

    console.log("Verification attempt:", {
      email,
      verificationCode,
      tempTokenExists: !!tempToken,
    });

    // Verify temp token and extract user data
    let tempUserData;
    try {
      tempUserData = jwt.verify(tempToken, process.env.JWT_SECRET);
      console.log("Decoded temp user data:", {
        storedCode: tempUserData.verificationCode,
        receivedCode: verificationCode,
        codeMatches: tempUserData.verificationCode === verificationCode,
      });
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(400).json({
        success: false,
        message: "Registration session expired. Please register again.",
      });
    }
    // Verify the code
    if (verificationCode !== tempUserData.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Check if code is expired
    if (Date.now() > new Date(tempUserData.verificationCodeExpires).getTime()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Create the verified user
    const user = await User.create({
      fullName: tempUserData.fullName,
      username: tempUserData.username,
      email: tempUserData.email,
      password: tempUserData.password,
      isVerified: true,
    });

    // Generate token for automatic login
    const token = generateToken(user._id);

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error("Welcome email failed to send:", emailError);
      // Continue even if welcome email fails
    }

    res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        isVerified: true,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Send verification email
    await sendVerificationEmail({ email, fullName, verificationCode });

    res.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send reset password code (OTP)
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always return a success message with the same timing
    // regardless of whether the email exists
    const startTime = Date.now();

    // Find the user
    const user = await User.findOne({ email });

    if (user) {
      // Only send email and save reset code if user exists
      const resetCode = generateVerificationCode();

      // Store reset code and expiry in user document
      user.resetPasswordCode = resetCode;
      user.resetPasswordCodeExpires = Date.now() + 30 * 60000; // 30 minutes
      await user.save();

      // Send reset email with the code
      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        resetCode,
      });

      console.log(`Reset code sent to existing user: ${email}`);
    } else {
      // Log the attempt but don't expose this to the client
      console.log(`Password reset attempted for non-existent email: ${email}`);

      // Optional: You can simulate the processing time here
      // to make timing attacks more difficult
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Ensure consistent response time
    const processingTime = Date.now() - startTime;
    const minResponseTime = 500; // minimum milliseconds to respond

    if (processingTime < minResponseTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minResponseTime - processingTime)
      );
    }

    // Return the same success message regardless of whether user exists
    res.json({
      success: true,
      message:
        "If an account exists for this email, a password reset code has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process your request",
    });
  }
};

// @desc    Verify reset code (OTP)
// @route   POST /api/users/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    console.log("Received verification request:", {
      email,
      verificationCode,
    });

    // First find the user by email only
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found with email:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Log detailed information about the code comparison
    console.log("Detailed code comparison:", {
      storedCode: user.resetPasswordCode,
      storedCodeLength: user.resetPasswordCode
        ? user.resetPasswordCode.length
        : 0,
      storedCodeType: typeof user.resetPasswordCode,
      receivedCode: verificationCode,
      receivedCodeLength: verificationCode ? verificationCode.length : 0,
      receivedCodeType: typeof verificationCode,
      codesEqual: user.resetPasswordCode === verificationCode,
      codesEqualTrimmed:
        user.resetPasswordCode?.trim() === verificationCode?.trim(),
      codeExpires: user.resetPasswordCodeExpires,
      isExpired: user.resetPasswordCodeExpires < Date.now(),
      currentTime: new Date(),
    });

    // Now proceed with verification checks
    if (!user.resetPasswordCode) {
      console.log("Reset password code is not set for this user");
      return res.status(400).json({
        success: false,
        message: "No reset code found. Please request a new one",
      });
    }

    if (user.resetPasswordCodeExpires < Date.now()) {
      console.log("Reset code has expired");
      return res.status(400).json({
        success: false,
        message: "Code has expired. Please request a new one",
      });
    }

    // If the codes don't match
    if (user.resetPasswordCode !== verificationCode) {
      console.log(
        `Code mismatch. Expected: ${user.resetPasswordCode}, Received: ${verificationCode}`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Code is valid, generate a reset token
    console.log("Verification successful, generating reset token");
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    console.log("Reset token generated, sending success response");
    return res.json({
      success: true,
      message: "Code verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Code verification failed",
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(
      "Reset password received with token:",
      token.substring(0, 20) + "..."
    );

    // Explicitly handle the jwt verification
    try {
      console.log("Verifying JWT token");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified successfully, user ID:", decoded.id);

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("User not found with ID:", decoded.id);
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      console.log("Found user:", user.email);

      // Update password and record the timestamp
      user.password = newPassword;
      user.resetPasswordCode = undefined;
      user.resetPasswordCodeExpires = undefined;
      user.passwordLastChangedAt = new Date(); // Add this line to record timestamp
      await user.save();
      console.log("Password updated successfully for user:", user.email);

      await sendPasswordChangedEmail(user);

      return res.json({
        success: true,
        message: "Password reset successfully",
        passwordChangedAt: user.passwordLastChangedAt, // Return the timestamp to frontend
      });
    } catch (jwtError) {
      // Error handling remains the same
      console.error("JWT verification error:", jwtError.name, jwtError.message);

      let message = "Reset session expired, please try again";
      if (jwtError.name === "JsonWebTokenError") {
        message = "Invalid reset token. Please request a new code.";
      } else if (jwtError.name === "TokenExpiredError") {
        message = "Reset session expired. Please request a new code.";
      }

      return res.status(401).json({
        success: false,
        message: message,
        errorDetails: {
          name: jwtError.name,
          message: jwtError.message,
        },
      });
    }
  } catch (error) {
    console.error("General reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed due to server error",
    });
  }
};

// @desc    Check verification status
// @route   POST /api/users/check-verification
// @access  Public
exports.checkVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordLastChangedAt = new Date(); // Record timestamp of change
    await user.save();

    // Send password changed email notification
    await sendPasswordChangedEmail(user);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

// @desc    Validate current password and will be used in frontend to check if the password is correct before allowing the user to change it
// @route   POST /api/users/validate-password
// @access  Private
exports.validatePassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);

    return res.json({
      success: isMatch,
      message: isMatch ? "Password is valid" : "Password is invalid",
    });
  } catch (error) {
    console.error("Password validation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate password",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, username } = req.body;

    // Validate input
    if (!fullName && !username) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Check if username is unique if it's being changed
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: fullName || req.user.fullName,
        username: username || req.user.username,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// @desc    Update user profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "wikatalk_profile_pictures",
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ],
    });

    // Update user profile picture URL in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: uploadResult.secure_url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile picture update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile picture",
    });
  }
};

// @desc    Request account deletion (send verification code)
// @route   POST /api/users/request-deletion
// @access  Private
exports.requestAccountDeletion = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has requested a code recently (add cooldown of 2 minutes)
    const cooldownPeriod = 2 * 60 * 1000; // 2 minutes in milliseconds

    if (user.lastDeletionRequestedAt &&
      Date.now() - new Date(user.lastDeletionRequestedAt).getTime() < cooldownPeriod) {

      // Calculate remaining cooldown time in seconds
      const remainingTime = Math.ceil(
        (cooldownPeriod - (Date.now() - new Date(user.lastDeletionRequestedAt).getTime())) / 1000
      );

      return res.status(429).json({
        success: false,
        message: "You've requested a code recently. Please wait a moment before trying again.",
        remainingTime,
        isRateLimited: true
      });
    }

    // Generate deletion verification code
    const deletionCode = generateVerificationCode();

    // Update the user with new code and request timestamp
    user.deletionCode = deletionCode;
    user.deletionCodeExpires = Date.now() + 5 * 60000; // 5 minutes
    user.lastDeletionRequestedAt = new Date();
    await user.save();

    // Send email with deletion code
    await sendAccountDeletionEmail({
      email: user.email,
      fullName: user.fullName,
      deletionCode,
    });

    res.json({
      success: true,
      message: "Account deletion verification code sent to your email",
    });
  } catch (error) {
    console.error("Account deletion request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process account deletion request",
    });
  }
};

// @desc    Verify account deletion code
// @route   POST /api/users/verify-deletion
// @access  Private
exports.verifyDeletionCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if deletion code exists and is valid
    if (!user.deletionCode) {
      return res.status(400).json({
        success: false,
        message: "No deletion code found. Please request a new one",
      });
    }

    if (user.deletionCodeExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one",
      });
    }

    if (user.deletionCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Generate deletion token
    const deletionToken = jwt.sign(
      { id: user._id, action: 'delete-account' },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      message: "Account deletion verification successful",
      deletionToken,
    });
  } catch (error) {
    console.error("Account deletion verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify account deletion code",
    });
  }
};

// @desc    Delete user account with token
// @route   DELETE /api/users/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { deletionToken } = req.body;

    // Verify the deletion token
    let decoded;
    try {
      decoded = jwt.verify(deletionToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired deletion token",
      });
    }

    // Check if the token has the correct action and matches the authenticated user
    if (decoded.action !== 'delete-account' || decoded.id !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Invalid deletion token",
      });
    }

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store user data before deletion for confirmation email
    const userData = {
      email: user.email,
      fullName: user.fullName
    };

    // Send confirmation email first
    try {
      await sendAccountDeletionConfirmationEmail(userData);
    } catch (emailError) {
      console.error("Failed to send deletion confirmation email:", emailError);
      // Continue with deletion even if email fails
    }

    // Delete the user
    await user.deleteOne();

    res.json({
      success: true,
      message: "Your account has been permanently deleted",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
};