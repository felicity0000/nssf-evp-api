import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import feedbackRoutes from "./routes/feedbacks";
import adminRoutes from "./routes/admin";
import problemSolverRoutes from "./routes/problemSolver"
import path from "path";

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Connected to MongoDB ✅");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB ❌", error);
  });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../../nssf-evp-client/dist')));

// Routes
app.get("/health", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes);
app.use("/api/feedbacks", feedbackRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/problem-solver", problemSolverRoutes)

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
