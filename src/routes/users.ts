import express, { Request, Response } from "express";
import Users from "../data/userData"; // Make sure this path is correct
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    // You can access the userId from req.userId after verifying the token
    const userId = req.userId;  // Provided by your 'verifyToken' middleware

    // Find the user in the database by userId
    const user = Users.find((user) => user.id === userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return user data
    res.status(200).json({
      id: user.id,
      username: user.username,
      department: user.department,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, department } = req.body;

  try {
    // Find user by username
    const user = Users.find((user) => user.username === username);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the department matches
    if (user.department !== department) {
      res.status(400).json({ message: "Invalid department" });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        department: user.department,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(Date.now() + 3600000),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        department: user.department,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = Users.find((user) => user.id === req.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({
    role: user.role,
    user: {
      id: user.id,
      username: user.username,
      department: user.department,
      role: user.role,
    },
  });
});



router.post("/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    expires: new Date(0), // Expire the cookie immediately
    httpOnly: true,        // Ensure cookie is not accessible via JS
    secure: process.env.NODE_ENV === "production", // Ensure it's sent over HTTPS in production
    sameSite: "strict", // or "lax" depending on your use case
    domain: "https://nssf-evp-client.vercel.app", // Add this if needed
  });
  res.status(204).send(); // Send a "No Content" status to indicate success
});

// Get all problem solvers
router.get("/problem-solvers", async (Req:Request, Res:Response) => {
  try {
    const problemSolvers = Users.filter((user) => user.role === "problem_solver"); // Filter only problem solvers
    Res.status(200).json({ success: true, problemSolvers });
  } catch (error) {
    console.error("Error fetching problem solvers:", error);
    Res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
