
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      maxlength: 255,
      select:false, // Ensure the password is not returned in queries by default
    },

    // Forgot password fields
    passwordResetToken: {
      type: String,
      default: null,
      select: false, // Ensure the reset token is not returned in queries by default
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false, // Ensure the reset token expiration is not returned in queries by default
    },
    acceptedTerms: {
  type: Boolean,
  required: true,
  default: false,
},
termsAcceptedAt: {
  type: Date,
  default: null,
},
termsVersion: {
  type: String,
  default: "1.0",
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
