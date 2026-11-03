
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const match = authHeader.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      return res.status(401).json({
        message: "Invalid authorization format.",
      });
    }

    const token = match[1];

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      typeof decoded !== "object" ||
      !decoded.userId
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.user = {
      userId: decoded.userId,
    };

    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Your session has expired. Please log in again."
            : "Invalid authentication token.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
};

export default authMiddleware;
