import express, { Request, Response } from "express";
import Users from "../data/userData";
import feedbackModel from "../models/feedbackModel";
import verifyToken from "../middleware/auth";

const router = express.Router();

// Admin assigns a problem solver to a feedback
router.post("/", verifyToken, async (Req: Request, Res: Response) => {
  const { feedbackId, assignedTo } = Req.body;

  try {
    // Find the user object from the array by name
    const user = Users.find((user) => user.username === assignedTo);

    // Check if the provided assignedTo is in the list of assignable users
    if (!user) {
      Res.status(400).json({
        success: false,
        message: "User is not authorized to be assigned this feedback",
      });
      return;
    }

    // Find the feedback by ID
    const feedback = await feedbackModel.findById(feedbackId);
    if (!feedback) {
      Res.status(404).json({ message: "Feedback not found" });
      return;
    }

    // Assign the feedback and change its status
    feedback.assignedTo = user.username; // Use the user's name for assignment
    feedback.status = "In Progress"; // When assigned, status changes
    await feedback.save();

    Res.status(200).json({
      success: true,
      message: "Feedback assigned successfully",
      feedback,
    });
  } catch (error) {
    console.log(error);
    console.log(Req.body);
    Res.status(500).json({ message: "Error assigning feedback", error });
  }
});

router.get("/assigned", async (Req: Request, Res: Response) => {
  try {
    const feedbacks = await feedbackModel.find({ assignedTo: { $ne: "" } });
    Res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching assigned feedbacks:", error);
    Res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route for fetching unassigned feedbacks
router.get("/unassigned", async (Req: Request, Res: Response) => {
  try {
    const feedbacks = await feedbackModel.find({ assignedTo: "" });
    Res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching unassigned feedbacks:", error);
    Res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/line-graph", async (Req: Request, Res: Response) => {
  try {
    const feedbacks = await feedbackModel.aggregate([
      {
        $match: { status: "Resolved" }, // Filter only resolved feedbacks
      },
      {
        $project: {
          month: { $month: "$updatedAt" }, // Extract month from updatedAt
          year: { $year: "$updatedAt" }, // Extract year from updatedAt
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" }, // Group by month and year
          totalResolved: { $sum: 1 }, // Count the number of resolved feedbacks
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month ascending
      },
    ]);

    // Prepare data for line graph
    const resolvedPerMonth = feedbacks.map((item) => ({
      month: `${item._id.month}-${item._id.year}`, // Format the date for graph
      totalResolved: item.totalResolved,
    }));

    Res.status(200).json({ success: true, resolvedPerMonth });
  } catch (error) {
    console.error("Error fetching resolved feedbacks per month:", error);
    Res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/pie-chart", async (Req: Request, Res: Response) => {
  try {
    const feedbacksByDepartment = await feedbackModel.aggregate([
      {
        $group: {
          _id: "$department", // Group by department
          totalFeedbacks: { $sum: 1 }, // Count the number of feedbacks per department
        },
      },
      {
        $sort: { totalFeedbacks: -1 }, // Sort by total feedbacks in descending order
      },
    ]);

    // Format the response for pie chart
    const formattedData = feedbacksByDepartment.map((item) => ({
      department: item._id,
      count: item.totalFeedbacks,
    }));

    Res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching total feedbacks per department:", error);
    Res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
