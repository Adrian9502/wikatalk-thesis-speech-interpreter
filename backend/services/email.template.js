const emailTemplates = {
  verification: (name, verificationCode) => ({
    subject: "Verify Your Email",
    html: `
   <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your WikaTalk Email</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        margin: 0;
        padding: 0;
      }

      /* Main container */
      body {
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }

      /* Philippine flag colors */
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: linear-gradient(
          to bottom,
          rgba(0, 56, 168, 0.8),
          rgba(206, 17, 38, 0.8)
        );
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
      }

      .logo-img {
        max-width: 80px;
        height: auto;
        pointer-events: none;
      }

      .logo-text {
        color: #fdb913;
        margin: 0;
        font-size: 30px;
        font-weight: bold;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
      }

      .tagline {
        color: #0038a8;
        margin: 0;
        font-size: 15px;
        font-weight: bold;
      }

      /* Content area */
      .content {
        padding: 40px;
      }

      .greeting {
        color: #fff;
        font-size: 20px;
        margin: 0 0 20px;
      }

      .title {
        color: #fff;
        font-size: 22px;
        margin: 0 0 20px;
      }

      .description {
        color: #ffffff;
        font-size: 16px;
        margin: 0 0 20px;
      }

      /* Verification code box */
      .code-container {
        background-color: #ffffff;
        border-radius: 6px;
        padding: 20px;
        margin: 30px 0;
        text-align: center;
      }

      .verification-code {
        font-size: 40px;
        letter-spacing: 10px;
        font-weight: bold;
        color: #ce1126;
        margin: 0;
        font-family: monospace;
      }

      .expiry-note {
        color: #fff;
        font-size: 14px;
        margin: 20px 0;
      }

      /* Footer */
      .footer {
        padding: 20px 40px;
        background-color: #f8f8f8;
        border-radius: 0 0 8px 8px;
      }

      .footer-text {
        color: #999999;
        font-size: 12px;
        margin: 0;
        text-align: center;
      }

      /* Additional info */
      .additional-info {
        max-width: 600px;
        margin: 20px auto 0;
        text-align: center;
        padding: 0 20px;
      }

      .info-text {
        color: #999999;
        font-size: 12px;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <!-- Main Email Container -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            class="email-container"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(
                to bottom,
                rgba(0, 56, 168, 0.8),
                rgba(206, 17, 38, 0.8)
              );
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  class="logo-img"
                  style="max-width: 80px; height: auto; pointer-events: none"
                  src="https://i.imgur.com/4vxin6d.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 30px;
                    font-weight: bold;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
                  "
                >
                  WikaTalk
                </h1>
                <h2
                  class="tagline"
                  style="
                    color: #facc15;
                    margin: 0;
                    font-size: 15px;
                    font-weight: bold;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content" style="padding: 40px">
                <!-- Personalized Greeting -->
                <p
                  class="greeting"
                  style="color: #fff; font-size: 20px; margin: 0 0 20px"
                >
                  Hi <b>${name}</b>,
                </p>

                <h2
                  class="title"
                  style="color: #fff; font-size: 22px; margin: 0 0 20px"
                >
                  Verify Your Email Address
                </h2>
                <p
                  class="description"
                  style="color: #ffffff; font-size: 16px; margin: 0 0 20px"
                >
                  Welcome to WikaTalk! To complete your registration and ensure
                  the security of your account, please verify your email address
                  by entering the following verification code in the app:
                </p>

                <!-- Verification Code -->
                <div
                  class="code-container"
                  style="
                    background-color: #ffffff;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <p
                    class="verification-code"
                    style="
                      font-size: 40px;
                      letter-spacing: 10px;
                      font-weight: bold;
                      color: #ce1126;
                      margin: 0;
                      font-family: monospace;
                    "
                  >
                    ${verificationCode}
                  </p>
                </div>

                <p
                  class="expiry-note"
                  style="color: #fff; font-size: 14px; margin: 20px 0"
                >
                  This verification code will expire in 30 minutes. If you
                  didn't create a WikaTalk account, you can safely ignore this
                  email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                class="footer"
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  class="footer-text"
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; margin: 20px auto 0"
          >
            <tr>
              <td
                class="additional-info"
                style="text-align: center; padding: 0 20px"
              >
                <p
                  class="info-text"
                  style="color: #999999; font-size: 12px; margin: 0"
                >
                  This is an automated message, please do not reply to this
                  email.<br />
                  You're receiving this email because you recently created a new
                  WikaTalk account or added a new email address.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

    `,
  }),
  welcome: (name) => ({
    subject: "Welcome to WikaTalk!",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to WikaTalk</title>
    <style type="text/css">
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: Arial, sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(
                to bottom,
                rgba(0, 56, 168, 0.8),
                rgba(206, 17, 38, 0.8)
              );
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  class="logo-img"
                  style="max-width: 80px; height: auto; pointer-events: none"
                  src="https://i.imgur.com/4vxin6d.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 30px;
                    font-weight: bold;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
                  "
                >
                  WikaTalk
                </h1>
                <h2
                  class="tagline"
                  style="
                    color: #facc15;
                    margin: 0;
                    font-size: 15px;
                    font-weight: bold;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->
                <p style="color: #fff; font-size: 20px; margin: 0 0 20px">
                  Mabuhay, <b>${name}</b>!
                </p>

                <h2 style="color: #fff; font-size: 22px; margin: 0 0 20px">
                  Welcome to Your Language Journey
                </h2>

                <p style="color: #ffffff; font-size: 16px; margin: 0 0 20px">
                  Thank you for joining WikaTalk! We're excited to help you
                  break down language barriers across the Philippines. Here's
                  what you can do with your new account:
                </p>

                <!-- Features List -->
                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  style="width: 100%; margin: 30px 0"
                >
                  <tr>
                    <td
                      style="
                        padding: 25px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                      "
                    >
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        style="width: 100%"
                      >
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: rgba(0, 56, 168, 0.8);
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    1
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: rgba(206, 17, 38, 0.8);
                                      margin: 0 0 8px;
                                      font-size: 16px;
                                      font-weight: 600;
                                    "
                                  >
                                    Speech-to-Speech Translation
                                  </h3>
                                  <p
                                    style="
                                      color: #555;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Instantly translate spoken words between
                                    Filipino languages in real-time.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: rgba(0, 56, 168, 0.8);
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    2
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: rgba(206, 17, 38, 0.8);
                                      margin: 0 0 8px;
                                      font-size: 16px;
                                      font-weight: 600;
                                    "
                                  >
                                    Text Translation
                                  </h3>
                                  <p
                                    style="
                                      color: #555;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Translate written text between multiple
                                    Philippine languages.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 20px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: rgba(0, 56, 168, 0.8);
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    3
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: rgba(206, 17, 38, 0.8);
                                      margin: 0 0 8px;
                                      font-size: 16px;
                                      font-weight: 600;
                                    "
                                  >
                                    Text Scanning
                                  </h3>
                                  <p
                                    style="
                                      color: #555;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Scan and translate text from images or
                                    documents instantly.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="width: 100%"
                            >
                              <tr>
                                <td style="width: 50px; vertical-align: top">
                                  <div
                                    style="
                                      width: 32px;
                                      height: 32px;
                                      background-color: rgba(0, 56, 168, 0.8);
                                      border-radius: 50%;
                                      text-align: center;
                                      line-height: 32px;
                                      color: white;
                                      font-weight: bold;
                                    "
                                  >
                                    4
                                  </div>
                                </td>
                                <td style="vertical-align: top">
                                  <h3
                                    style="
                                      color: rgba(206, 17, 38, 0.8);
                                      margin: 0 0 8px;
                                      font-size: 16px;
                                      font-weight: 600;
                                    "
                                  >
                                    Translation History
                                  </h3>
                                  <p
                                    style="
                                      color: #555;
                                      margin: 0;
                                      font-size: 14px;
                                    "
                                  >
                                    Access your recent translations anytime,
                                    anywhere.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="color: #fff; font-size: 14px; margin: 20px 0">
                  Together, let's make communication easier across our beautiful
                  archipelago!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  For support or feedback, please contact our team. We're here
                  to help!
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="max-width: 600px; margin: 20px auto 0"
          >
            <tr>
              <td style="text-align: center; padding: 0 20px">
                <p style="color: #999999; font-size: 12px; margin: 0">
                  You're receiving this email because you've created a WikaTalk
                  account.<br />
                  Want to learn more about WikaTalk? Visit our website or
                  download our app.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

    `,
  }),
  passwordReset: (name, resetCode) => ({
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Code - WikaTalk</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: Arial, sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(
                to bottom,
                rgba(0, 56, 168, 0.8),
                rgba(206, 17, 38, 0.8)
              );
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  class="logo-img"
                  style="max-width: 70px; height: auto; pointer-events: none"
                  src="https://i.imgur.com/4vxin6d.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 30px;
                    font-weight: bold;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
                  "
                >
                  WikaTalk
                </h1>
                <h2
                  class="tagline"
                  style="
                    color: #facc15;
                    margin: 0;
                    font-size: 15px;
                    font-weight: bold;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->

                <h2 style="color: #fff; font-size: 22px; margin: 0 0 20px">
                  Password Reset
                </h2>

                <p style="color: #fff; font-size: 20px; margin: 0 0 20px">
                  Hi <b>${name}</b>,
                </p>

                <p style="color: #ffffff; font-size: 16px; margin: 0 0 20px">
                  We received a request to reset your password. Use the
                  following code to complete the process:
                </p>

                <!-- Verification Code -->
                <div
                  style="
                    background-color: #ffffff;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                  "
                >
                  <p
                    style="
                      font-size: 40px;
                      letter-spacing: 10px;
                      font-weight: bold;
                      color: rgba(0, 56, 168, 0.8);
                      margin: 0;
                      font-family: monospace;
                    "
                  >
                    ${resetCode}
                  </p>
                </div>

                <p style="color: #fff; font-size: 14px; margin: 20px 0">
                  This code will expire in 30 minutes.
                </p>
                <p style="color: #fff; font-size: 14px; margin: 20px 0">
                  If you didn't request a password reset, you can safely ignore
                  this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
        </td>
      </tr>
    </table>
  </body>
</html>


    `,
  }),
  passwordChanged: (name, formattedDate, formattedTime) => ({
    subject: "Password Changed Successfully",
    html: `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Password Has Been Successfully Changed</title>
    <style type="text/css">
      /* Reset styles for email clients */
      body,
      p,
      div,
      span,
      a,
      table,
      td {
        font-family: Arial, sans-serif;
        line-height: 1.5;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4">
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="width: 100%; background-color: #f4f4f4; margin: 0; padding: 40px 0"
    >
      <tr>
        <td style="text-align: center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(
                to bottom,
                rgba(0, 56, 168, 0.8),
                rgba(206, 17, 38, 0.8)
              );
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.37);
            "
          >
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px; text-align: center">
                <img
                  class="logo-img"
                  style="max-width: 70px; height: auto; pointer-events: none"
                  src="https://i.imgur.com/4vxin6d.png"
                  alt="WikaTalk-logo"
                />
                <h1
                  class="logo-text"
                  style="
                    color: #fff;
                    margin: 0;
                    font-size: 30px;
                    font-weight: bold;
                    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
                  "
                >
                  WikaTalk
                </h1>
                <h2
                  class="tagline"
                  style="
                    color: #facc15;
                    margin: 0;
                    font-size: 15px;
                    font-weight: bold;
                  "
                >
                  Speak Freely, Understand Instantly.
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px">
                <!-- Personalized Greeting -->

                <h2 style="color: #fff; font-size: 22px; margin: 10">
                  Your Password Has Been Changed
                </h2>
                <p
                  style="
                    color: #ffffff;
                    font-size: 16px;
                    margin: 10px 0 20px;
                    text-align: left;
                  "
                >
                  Hi ${name}, <br />
                  We wanted to let you know that your password was successfully
                  changed on
                  <span
                    style="color: #facc15; font-weight: 600; font-size: 18px"
                    >${formattedDate}, ${formattedTime}</span
                  >. If you made this change, no further action is needed.
                  However, if you did not request this password change, please
                  reset your password immediately and contact our support team.
                </p>
                <p style="color: #fff; font-size: 16px; margin: 20px 0">
                  For your security, we recommend using a strong and unique
                  password.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px 40px;
                  background-color: #f8f8f8;
                  border-radius: 0 0 8px 8px;
                "
              >
                <p
                  style="
                    color: #999999;
                    font-size: 12px;
                    margin: 0;
                    text-align: center;
                  "
                >
                  © ${new Date().getFullYear()} WikaTalk. All rights
                  reserved.<br />
                  If you have any questions, please contact our support team.
                </p>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
        </td>
      </tr>
    </table>
  </body>
</html>

    `,
  }),
};

module.exports = { emailTemplates };
