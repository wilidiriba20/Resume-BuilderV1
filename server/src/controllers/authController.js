import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "node:crypto";
import transporter from "../config/email.js";



export const register = async (req, res) => {
  try {
const { name, email, password, confirmPassword,acceptedTerms } = req.body;
    // 1. Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }
    if (!confirmPassword) {
  return res.status(400).json({
    message: "Please confirm your password.",
  });
}


if (password !== confirmPassword) {
  return res.status(400).json({
    message: "Passwords do not match.",
  });
}

    // 2. Check password length BEFORE hashing
    if (password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters long",
      });
    }
    if (acceptedTerms !== true) {
  return res.status(400).json({
    message: "You must accept the Terms of Service to register.",
  });
}

    // 3. Check whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // 4. Hash password
    const hashedPassword = await argon2.hash(password);

    // 5. Create user
   const user = await User.create({
  name,
  email,
  password: hashedPassword,
  acceptedTerms: true,
  termsAcceptedAt: new Date(),
  termsVersion: "1.0",
});

    // 6. Never send the password/hash back
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Login controller

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // 2. Find the user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 3. Verify the password against the Argon2id hash
    const isPasswordValid = await argon2.verify(
      user.password,
      password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // 4. Create a JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN}
    );

    // 5. Return the token and safe user details
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



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Use the same response whether the account exists or not.
    const message =
      "If an account exists for that email, password reset instructions will be sent.";

    if (!user) {
      return res.status(200).json({ message });
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash of the token.
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes.
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateModifiedOnly: true });

    // Development only: print the link in the terminal.
    // Email delivery will be configured separately.
    if (process.env.NODE_ENV !== "production") {
      const baseUrl =
        process.env.FRONTEND_URL || "http://localhost:3000";

     

if (!baseUrl) {
  throw new Error("FRONTEND_URL is not configured.");
}

const resetLink =
  `${baseUrl}/reset-password/${resetToken}`;

await transporter.sendMail({
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
      <p>Hello ${user.name},</p>
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

    }

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Unable to process the password reset request.",
    });
  }
};



export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password, and confirm password are required.",
      });
    }

    if (password.length < 4 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    // Hash the token in the same way as the stored token.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired.",
      });
    }

    // Hash the new password with Argon2id.
    user.password = await argon2.hash(password);

    // Make the reset token unusable after a successful reset.
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
};
