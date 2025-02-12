import express, { Request, Response } from "express";
import feedbackModel from "../models/feedbackModel";
import verifyToken from "../middleware/auth";


const router = express.Router();

// Helper function to fetch feedbacks by status
const fetchFeedbacksByStatus = async (status: string) => {
  try {
    return await feedbackModel.find({ status });
  } catch (error) {
    throw error;
  }
};

// create a feedback concern
router.post("/", verifyToken, async (Req: Request, Res: Response) => {
  // Find the user based on the token or session
  const userId = Req.userId; // Assuming you have a user ID in the token

  const {
    title,
    department,
    concern,
    solution,
    startDate,
    endDate,
    isAnonymous,
    name,
  } = Req.body;

  // Default status to "Pending"
  const status = "Pending";
  const assignedTo = "";
  try {
    const newFeedback = new feedbackModel({
      title,
      department,
      concern,
      possibleSolution: solution,
      validity: { startDate, endDate },
      isAnonymous,
      name,
      status,
      assignedTo,
      likes: 0,
      dislikes: 0,
      userId,
    });

    await newFeedback.save();
    Res.status(201).json({
      message: "Feedback created successfully",
      feedback: newFeedback,
    });
    return;
  } catch (error) {
    console.error(error);
  }
});

// fetch all concerns
router.get("/", async (Req: Request, Res: Response) => {
  try {
    const feedbacks = await feedbackModel.find({});
    Res.status(201).json({ success: true, feedbacks });
    return;
  } catch (error) {
    console.log(error);
    Res.status(500).json({ message: "Error fetching feedbacks", error });
    return;
  }
});

// fetch concern by id
router.get("/feedback/:id", async(Req:Request, Res:Response):Promise<void> => {
  const feedbackId = Req.params.id;
  try {
    const feedback = await feedbackModel.findById(feedbackId);
    if (!feedback) {
      Res.status(404).json({ message: 'Feedback not found' });
      return;
    }
    Res.json(feedback); 
  } catch(error) {
    console.error("Error fetching feedback", error);
    Res.status(500).json({ message: 'Server error' });
  }
});

router.get("/pending", async (Req: Request, Res: Response): Promise<void> => {
  try {
    // Fetch feedbacks that are marked as "Pending"
    const feedbacks = await feedbackModel.find({ status: "Pending" });
    
    // Check if feedback exists
    if (!feedbacks) {
      Res.status(404).json({ message: "No pending feedback found." });
      return;
    }
    
    Res.json({ success: true, feedbacks });
    return;
  } catch(error) {
    console.log(error);
    Res.status(500).json({ message: "Error fetching pending feedback", error });
  }
});

router.get("/inprogress", async(Req:Request, Res:Response) => {
  try {
     // Fetch feedbacks that are marked as "In Progress"
     const feedbacks = await feedbackModel.find({ status: "In Progress" });
    
     if (!feedbacks || feedbacks.length === 0) {
       Res.status(404).json({ message: "No in progress feedbacks found." });
       return;
     }
     Res.json({ success: true, feedbacks });
     return;
  } catch(error) {
    console.log(error);
    Res.status(500).json({ message: "Error fetching inprogress feedbacks", error });
  }
})

router.get("/resolved", async(Req:Request, Res:Response) => {
  try {
     // Fetch feedbacks that are marked as "Resolved"
     const feedbacks = await feedbackModel.find({ status: "Resolved" });
    
     if (!feedbacks || feedbacks.length === 0) {
       Res.status(404).json({ message: "No resolved feedbacks found." });
       return;
     }
     Res.json({ success: true, feedbacks });
     return;
  } catch(error) {
    console.log(error);
    Res.status(500).json({ message: "Error fetching resolved feedbacks", error });
  }
});

// Like feedback
router.post("/:id/like", async(Req:Request, Res:Response) => {
  try {
    const feedback = await feedbackModel.findById(Req.params.id);
    if (!feedback) {
      Res.status(404).send('Feedback not found');
      return;
    }
    
    feedback.likes += 1;
    await feedback.save();
    Res.status(200).send(feedback);
  } catch(error) {
    console.log(error);
  }
});

// dislike feedback
router.post("/:id/dislike", async(Req:Request, Res:Response) => {
  try {
    const feedback = await feedbackModel.findById(Req.params.id);
    if (!feedback) {
      Res.status(404).send('Feedback not found');
      return;
    }
    
    feedback.dislikes += 1;
    await feedback.save();
    Res.status(200).send(feedback);
  } catch(error) {
    console.log(error);
  }
});

// Add a comment to a feedback
router.post("/:id/comment", async(Req:Request, Res:Response) => {
  try {
    const {userId, comment } = Req.body;
    const feedback = await feedbackModel.findById(Req.params.id);
    if (!feedback) {
      Res.status(404).send('Feedback not found');
      return;
    }
    feedback.comments.push({ userId, comment });
    await feedback.save();
    Res.status(200).send(feedback);
  } catch(error) {
    console.log(error);
  }
});

router.get("/feedback-stats", async (Req: Request, Res: Response) => {
  try {
    // Aggregate feedback counts directly by status
    const feedbackStats = await feedbackModel.aggregate([
      {
        $group: {
          _id: "$status",  // Group by the 'status' field
          count: { $sum: 1 }, // Count the number of feedbacks for each status
        },
      },
      {
        $project: {
          _id: 0,  // Don't include the _id in the final result
          status: "$_id", // Rename '_id' field to 'status'
          count: 1,  // Include the count
        },
      },
    ]);

    // Initialize responseData as an empty object
    const responseData: { [key: string]: number } = {};

    // Loop through the feedbackStats and populate the responseData
    feedbackStats.forEach((item) => {
      responseData[item.status] = item.count;
    });

    // Calculate total feedbacks by summing all available counts
    const total = Object.values(responseData).reduce((sum, count) => sum + count, 0);

    // Send the response with status counts and total
    Res.status(200).json({
      success: true,
      data: {
        total,
        ...responseData,  // Spread the responseData to include all status counts
      },
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    Res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});







export default router;
