
import "dotenv/config";
import express from "express";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./middleware/rateLimiter.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use(mongoSanitize());

// General API rate limiting
app.use("/api", apiLimiter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Authentication routes
app.use("/api/auth", authRoutes);

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

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
