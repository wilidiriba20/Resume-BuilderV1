import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "node:crypto";
import transporter from "../config/email.js";
import googleClient from "../config/google.js";

// =====================================
// HELPER FUNCTIONS
// =====================================

const checkJwtConfig = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT configuration is incomplete.");
  }
};

const generateToken = (userId) => {
  checkJwtConfig();

  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const escapeHtml = (value) => {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
};

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL?.replace(/\/+$/, "");
};

// =====================================
// 1. REGISTER
// =====================================

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, acceptedTerms } =
      req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 50) {
      return res.status(400).json({
        message: "Name must be between 2 and 50 characters.",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (typeof confirmPassword !== "string" || !confirmPassword) {
      return res.status(400).json({
        message: "Please confirm your password.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters long.",
      });
    }

    if (acceptedTerms !== true) {
      return res.status(400).json({
        message: "You must accept the Terms of Service to register.",
      });
    }

    checkJwtConfig();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      acceptedTerms: true,
      termsAcceptedAt: new Date(),
      termsVersion: "1.0",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

// =====================================
// 2. LOGIN
// =====================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
};

// =====================================
// 3. FORGOT PASSWORD
// =====================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !isValidEmail(email.trim().toLowerCase())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const message =
      "If an account exists for that email, password reset instructions will be sent.";

    const user = await User.findOne({
  email: normalizedEmail,
}).select("+password");


    if (!user) {
      return res.status(200).json({ message });
    }

    if (!user.password && user.authProvider === "google") {
      return res.status(200).json({ message });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateModifiedOnly: true });

    const baseUrl = getFrontendUrl() || "http://localhost:5173";

    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    const safeName = escapeHtml(user.name);

    try {
      const info = await transporter.sendMail({
        from: `"Resume Builder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset Your Resume Builder Password",

        text: `Hello ${user.name},

We received a request to reset your Resume Builder password.

Open this link to choose a new password:
${resetLink}

This link expires in 15 minutes.

If you did not request this reset, you can ignore this email.

Resume Builder Team`,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
            <h2>Reset your password</h2>
            <p>Hello ${safeName},</p>
            <p>We received a request to reset your Resume Builder password.</p>
            <p>
              <a href="${resetLink}"
                 style="background:#2563eb;color:white;padding:12px 20px;
                        text-decoration:none;border-radius:6px;display:inline-block;">
                Reset Password
              </a>
            </p>
            <p>This link expires in 15 minutes.</p>
            <p>If you did not request this reset, you can ignore this email.</p>
            <p>Resume Builder Team</p>
          </div>
        `,
      });
      
    } catch (emailError) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save({ validateModifiedOnly: true });

      console.error(
        "Password reset email delivery failed:",
        emailError.message,
      );
    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Unable to process the password reset request.",
    });
  }
};

// =====================================
// 4. RESET PASSWORD
// =====================================

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body || {};

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired.",
      });
    }

    if (
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired.",
      });
    }

    user.password = await argon2.hash(password);

    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
};

// =====================================
// 5. START GOOGLE AUTHENTICATION
// =====================================

export const googleAuth = async (req, res) => {
  try {
    const { acceptedTerms } = req.body || {};

    if (typeof acceptedTerms !== "boolean") {
      return res.status(400).json({
        message: "Invalid Terms of Service acceptance value.",
      });
    }

    checkJwtConfig();

    const state = jwt.sign(
      {
        purpose: "login",
        acceptedTerms,
        nonce: crypto.randomBytes(32).toString("hex"),
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/api/auth/google/callback",
    });

    const authUrl = googleClient.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });

    return res.status(200).json({
      message: "Google authentication started.",
      url: authUrl,
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);

    return res.status(500).json({
      message: "Unable to start Google authentication.",
    });
  }
};

// =====================================
// 6. START GOOGLE ACCOUNT LINKING
// =====================================

export const googleLinkAuth = async (req, res) => {
  try {
    const userId = req.user.userId;

    checkJwtConfig();

    const state = jwt.sign(
      {
        purpose: "link",
        userId,
        nonce: crypto.randomBytes(32).toString("hex"),
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/api/auth/google/callback",
    });

    const authUrl = googleClient.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });

    return res.status(200).json({
      message: "Google account linking started.",
      url: authUrl,
    });
  } catch (error) {
    console.error("Google linking error:", error.message);

    return res.status(500).json({
      message: "Unable to start Google account linking.",
    });
  }
};

// =====================================
// 7. GOOGLE AUTHENTICATION CALLBACK
// =====================================

export const googleCallback = async (req, res) => {
  const frontendUrl = getFrontendUrl();

  try {
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const { code, state, error } = req.query;
    const savedState = req.cookies?.google_oauth_state;

    res.clearCookie("google_oauth_state", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/google/callback",
    });

    if (
      error ||
      typeof code !== "string" ||
      typeof state !== "string" ||
      !savedState ||
      state !== savedState
    ) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    checkJwtConfig();

    const stateData = jwt.verify(state, process.env.JWT_SECRET);

    if (
      typeof stateData !== "object" ||
      !stateData.nonce ||
      !["login", "link"].includes(stateData.purpose)
    ) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error("Google did not return an ID token.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.redirect(
        `${frontendUrl}/login?error=google_verification_failed`,
      );
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return res.redirect(`${frontendUrl}/login?error=invalid_email`);
    }

    const name = payload.name?.trim() || email.split("@")[0];

    // LINK GOOGLE ACCOUNT
    if (stateData.purpose === "link") {
      if (!stateData.userId) {
        return res.redirect(`${frontendUrl}/settings?error=google_auth_failed`);
      }

      const user = await User.findById(stateData.userId);

      if (!user) {
        return res.redirect(`${frontendUrl}/settings?error=user_not_found`);
      }

      const existingGoogleUser = await User.findOne({ googleId });

      if (
        existingGoogleUser &&
        existingGoogleUser._id.toString() !== user._id.toString()
      ) {
        return res.redirect(
          `${frontendUrl}/settings?error=google_already_linked`,
        );
      }

      if (user.googleId && user.googleId !== googleId) {
        return res.redirect(
          `${frontendUrl}/settings?error=another_google_account_linked`,
        );
      }

      user.googleId = googleId;

      await user.save();

      return res.redirect(`${frontendUrl}/settings?google_linked=success`);
    }

    // NORMAL GOOGLE LOGIN
    let user = await User.findOne({ googleId });

    if (!user) {
      if (stateData.acceptedTerms !== true) {
        return res.redirect(`${frontendUrl}/login?error=terms_required`);
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.redirect(`${frontendUrl}/login?error=account_exists`);
      }

      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
        termsVersion: "1.0",
      });
    }

    const token = generateToken(user._id);

    return res.redirect(
      `${frontendUrl}/auth/google/callback#token=${encodeURIComponent(token)}`,
    );
  } catch (error) {
    console.error("Google callback error:", error.message);

    if (frontendUrl) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    return res.status(500).json({
      message: "Google authentication failed.",
    });
  }
};
