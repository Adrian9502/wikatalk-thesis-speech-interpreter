const nodemailer = require("nodemailer");
const { emailTemplates } = require("./email.template.js");

const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("Attempting Gmail connection with:", {
      user: process.env.GMAIL_USER,
      host: "smtp.gmail.com",
    });

    await transporter.verify();
    console.log("Gmail connection verified successfully");
    return transporter;
  } catch (error) {
    console.error("Detailed Gmail configuration error:", error);
    throw error;
  }
};

const initializeTransporter = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const transporter = await createTransporter();
      return transporter;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

let transporter;
// Initialize transporter with retries
(async () => {
  try {
    transporter = await initializeTransporter();
  } catch (error) {
    console.error("Failed to initialize mail transporter:", error);
  }
})();

// ADDED: Helper function to get the transporter
const getEmailTransporter = () => {
  if (!transporter) {
    throw new Error("Email transporter not initialized");
  }
  return transporter;
};

const sendVerificationEmail = async (user) => {
  try {
    console.log("Attempting to send VERIFICATION EMAIL to:", user.email);

    const { subject, html } = emailTemplates.verification(
      user.fullName,
      user.verificationCode
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Email sent successfully:", info);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (user) => {
  try {
    console.log("Attempting to send PASSWORD RESET EMAIL to:", user.email);

    const { subject, html } = emailTemplates.passwordReset(
      user.fullName,
      user.resetCode
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

const sendPasswordChangedEmail = async (user) => {
  try {
    const passwordChangedAt = user.passwordLastChangedAt || new Date();
    const timeZone = "Asia/Manila";

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(passwordChangedAt);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    }).format(passwordChangedAt);

    console.log("Attempting to send PASSWORD CHANGED EMAIL to:", user.email);

    const { subject, html } = emailTemplates.passwordChanged(
      user.fullName,
      formattedDate,
      formattedTime
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    console.log("Sending welcome email to:", user.email);

    const { subject, html } = emailTemplates.welcome(user.fullName);

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", info);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};

const sendAccountDeletionEmail = async (user) => {
  try {
    console.log("Attempting to send ACCOUNT DELETION EMAIL to:", user.email);
    const { subject, html } = emailTemplates.accountDeletion(
      user.fullName,
      user.deletionCode
    );
    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: user.email,
      subject,
      html,
    });

    console.log("Account Deletion Email send successfully:", user.email);
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

const sendAccountDeletionConfirmationEmail = async (userData) => {
  try {
    console.log("Sending account deletion confirmation email to:", userData.email);

    const now = new Date();
    const timeZone = "Asia/Manila";

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZone,
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timeZone,
    }).format(now);

    const { subject, html } = emailTemplates.accountDeletionConfirmation(
      userData.fullName,
      formattedDate,
      formattedTime
    );

    const info = await transporter.sendMail({
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to: userData.email,
      subject,
      html,
    });

    console.log("Account deletion confirmation email sent successfully to:", userData.email);
    return true;
  } catch (error) {
    console.error("Failed to send account deletion confirmation email:", error);
    return false;
  }
};

// FIXED: Use the helper function instead of the undefined variable
const sendFeedbackEmail = async ({ to, subject, body, userInfo, feedbackData }) => {
  try {
    // FIXED: Use the helper function
    const emailTransporter = getEmailTransporter();

    // Create HTML version for better formatting
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4A6FFF; padding-bottom: 10px;">
          WikaTalk Feedback: ${feedbackData.type === "bug" ? "🐛 Bug Report" : "💡 Feature Suggestion"}
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #4A6FFF; margin-top: 0;">${feedbackData.title}</h3>
          <p style="color: #666; line-height: 1.6;">${feedbackData.message.replace(/\n/g, '<br>')}</p>
        </div>

        <div style="background-color: #e8f4ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h4 style="color: #333; margin-top: 0;">User Information</h4>
          <p><strong>Name:</strong> ${userInfo.name}</p>
          <p><strong>Email:</strong> ${userInfo.email}</p>
          <p><strong>User ID:</strong> ${userInfo.userId}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
          <p>This feedback was automatically sent from the WikaTalk mobile application.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@wikatalk.com",
      to,
      subject,
      text: body, // Plain text version
      html: htmlBody, // HTML version
    };

    // FIXED: Use the correct transporter variable
    const result = await emailTransporter.sendMail(mailOptions);
    console.log("Feedback email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Error sending feedback email:", error);
    throw error;
  }
};

// SEND FEEDBACK FROM WEB
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const emailTransporter = getEmailTransporter();

    const mailOptions = {
      from: {
        name: "WikaTalk",
        address: "noreply@wikatalk.com",
      },
      to,
      subject,
      html,
      text, // Fallback plain text version
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
  sendAccountDeletionConfirmationEmail,
  sendFeedbackEmail,
  getEmailTransporter, sendEmail
};
