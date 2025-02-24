const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");

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

    console.log("login received in backend : ", req.body);
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    await sendPasswordResetEmail(user);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
