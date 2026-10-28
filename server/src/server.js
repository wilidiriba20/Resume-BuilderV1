import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:  process.env.FRONTEND_URL,
  })
);
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());
app.use("/api/auth",authRoutes);



// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ResumeBuild API is running",
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();