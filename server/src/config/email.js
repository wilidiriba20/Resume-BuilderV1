import "dotenv/config";
import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  throw new Error("Email credentials are not configured.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD.replace(/\s/g, ""),
  },
});

export default transporter;
