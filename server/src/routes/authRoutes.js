
import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  googleLinkAuth,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Local authentication
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

// Google authentication
router.post("/google", authLimiter, googleAuth);
router.get("/google/callback", googleCallback);

// Google account linking
router.post("/google/link", authMiddleware, authLimiter, googleLinkAuth);

export default router;
