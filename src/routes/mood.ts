import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import moodModel from "../models/moodModel";

const router = express.Router();

router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { mood } = req.body;
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

    // Check if the user has already logged their mood today
    const existingMood = await moodModel.findOne({
      username: req.username,
      date: currentDate,
    });

    if (existingMood) {
      res.status(400).json({ message: "You have already logged your mood today." });
      return;
    }

    // If not, create a new mood entry for the user
    const newMood = new moodModel({
      mood,
      username: req.username,
      date: currentDate, // Store the current date
    });
    await newMood.save();

    res.status(201).json({ message: "Mood logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
