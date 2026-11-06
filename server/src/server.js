import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
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
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not configured.");
}

// 1. CORS configuration
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// 2. Security middleware
app.use(helmet());

// 3. Request body parser
app.use(express.json());

// 4. Cookie parser (needed for Google OAuth state cookie)
app.use(cookieParser());

// 5. MongoDB sanitization
app.use(mongoSanitize());

// 6. General API rate limiting
app.use("/api", apiLimiter);

// 7. API documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 8. Authentication routes
app.use("/api/auth", authRoutes);

// 9. Test route
app.get("/", (req, res) => {
  res.json({
    message: "ResumeBuild API is running",
  });
});

// 10. Start server
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
