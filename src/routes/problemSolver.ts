import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import feedbackModel from "../models/feedbackModel";

const router = express.Router();

router.post("/", verifyToken, async (Req: Request, Res: Response) => {
    const {feedbackId} = Req.body;
    const {username, role} = Req;
  try {
    const feedback = await feedbackModel.findById(feedbackId);

    if (!feedback) {
        Res.status(404).json({ success: false, message: "Feedback not found" });
        return;
      }

       // Check if the feedback is assigned to the logged-in user
    if (feedback.assignedTo !== username) {
        Res.status(403).json({
          success: false,
          message: "You are not authorized to resolve this feedback",
        });
        return;
      }

       // Check if the feedback status is "In Progress"
    if (feedback.status !== "In Progress") {
        Res.status(400).json({
          success: false,
          message: "Feedback must be 'In Progress' to mark as resolved",
        });
        return;
      }
  
      // Mark feedback as resolved
      feedback.status = "Resolved";
      await feedback.save();
  
      Res.status(200).json({ success: true, message: "Feedback resolved successfully" });
      return;
  } catch (error) {
    console.log(error);
  }
});

router.get(
  "/",
  verifyToken,
  async (Req: Request, Res: Response): Promise<void> => {
    const { username, role } = Req;
    try {
      if (role !== "employee") {
        Res.status(403).json({
          success: false,
          message:
            "Forbidden: Only problem solvers can view their assigned feedbacks",
        });
        return;
      }
      // Fetch feedbacks where the assignedTo field matches the logged-in username
      const feedbacks = await feedbackModel.find({ assignedTo: username });

      if (!feedbacks || feedbacks.length === 0) {
        Res.status(404).json({
          success: false,
          message: "No feedbacks assigned to you",
        });
        return;
      }

      Res.status(200).json({ success: true, feedbacks });
      return;
    } catch (error) {
      console.log(error);
    }
  }
);

export default router;
