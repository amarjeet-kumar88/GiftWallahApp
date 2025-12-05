import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router as apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { createSwaggerSpec } from "./config/swagger";

const app: Application = express();
const swaggerSpec = createSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Trust proxy (agar reverse proxy / load balancer ke piche hoga)
app.set("trust proxy", 1);

// Security: Helmet
app.use(helmet());

// CORS (yahan allowed origins customize kar sakte ho)
app.use(
  cors({
    origin: "*", // TODO: production me specific domain set karo
    credentials: true
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Logging
app.use(morgan("dev"));

// Rate limiting (global)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  }
});
app.use("/api", apiLimiter);

// Healthcheck route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Main API routes
app.use("/api", apiRouter);

// Central error handler
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
