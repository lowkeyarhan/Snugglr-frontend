import dotenv from "dotenv";

// load environment variables
dotenv.config();

import express from "express";
import cors from "cors";
import authRoute from "./routes/authRoute";
import connectDB from "./configs/mongoDb";
import confessionRoute from "./routes/confessionRoute";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import userRoute from "./routes/userRoute";
import roomRoute from "./routes/roomRoute";
import messageRoute from "./routes/messageRoute";
import chatRoute from "./routes/chatroomRoute";
import matchRoute from "./routes/matchRoute";
import adminRoute from "./routes/adminRoute";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Snugglr API",
      version: "1.0.0",
      description: "Backend API documentation for Snugglr",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
console.log(
  `Swagger documentation: http://localhost:${process.env.PORT || 3000}/api-docs`
);

// connect to MongoDB
connectDB();

// configurations
const app = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CORS middleware
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoute);
app.use("/api/confession", confessionRoute);
app.use("/api/profile", userRoute);
app.use("/api/room", roomRoute);
app.use("/api/message", messageRoute);
app.use("/api/chat", chatRoute);
app.use("/api/match", matchRoute);
app.use("/api/admin", adminRoute);

// start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
