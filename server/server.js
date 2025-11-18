import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import confessionRoutes from "./routes/confessionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./utils/errorHandler.js";
import webSocketHub from "./websocket/websocketHub.js";
import { cleanupOldConfessions } from "./controllers/confessionController.js";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = parseInt(process.env.PORT) || 8081;
const NODE_ENV = process.env.NODE_ENV || "development";
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

const app = express();
let httpServer = null;

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Snugglr API is running!",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const startConfessionCleanup = () => {
  cleanupOldConfessions().catch(console.error);

  setInterval(async () => {
    try {
      await cleanupOldConfessions();
    } catch (error) {
      console.error("Error in scheduled confession cleanup:", error);
    }
  }, CLEANUP_INTERVAL_MS);

  console.log("Confession cleanup scheduled to run every 24 hours");
};

const tryStartServer = (port) => {
  httpServer = createServer(app);
  webSocketHub.init(httpServer);

  httpServer
    .listen(port)
    .on("listening", () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`WebSocket server enabled for real-time features`);
      startConfessionCleanup();
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        httpServer.close(() => {
          tryStartServer(port + 1);
        });
      } else {
        console.error(`Error starting server: ${err.message}`);
        process.exit(1);
      }
    });
};

const startServer = async () => {
  try {
    await connectDB();
    tryStartServer(PORT);
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  if (httpServer) {
    httpServer.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
