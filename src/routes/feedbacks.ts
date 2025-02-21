import express, { Request, Response } from "express";
import feedbackModel from "../models/feedbackModel";
import verifyToken from "../middleware/auth";


const router = express.Router();

// create a feedback concern
router.post("/", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId; // Extracted from verifyToken middleware
  const {
    title,
    department,
    concern,
    solution,
    startDate,
    endDate,
    isAnonymous,
    name,
  } = req.body;

  try {
    const newFeedback = new feedbackModel({
      title,
      department,
      concern,
      possibleSolution: solution,
      validity: { startDate, endDate },
      isAnonymous,
      name,
      status: "Pending",
      assignedTo: "",
      approval: false, // 🔔 Default approval state: false
      likes: 0,
      dislikes: 0,
      userId,
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: "✅ Feedback created successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("❌ Error creating feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// fetch all all approved concerns
router.get("/approved", async (Req: Request, Res: Response) => {
  try {
    const feedbacks = await feedbackModel.find({approval: true});
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
    const feedbacks = await feedbackModel.find({ status: "Pending", approval:true });
    
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
router.post("/:id/like", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id: feedbackId } = req.params;
    const username = req.username; // Set by `verifyToken`

    const feedback = await feedbackModel.findById(feedbackId);

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found." });
      return;
    }

    // 🚫 If user has already disliked, remove dislike and add like
    if (feedback.dislikedBy.includes(username)) {
      await feedbackModel.findByIdAndUpdate(
        feedbackId,
        {
          $inc: { dislikes: -1, likes: 1 }, // Decrease dislikes and increase likes
          $pull: { dislikedBy: username }, // Remove from dislikedBy
          $addToSet: { likedBy: username }, // Add to likedBy
        },
        { new: true }
      );
      res.status(200).json({ message: "Like added and dislike removed." });
      return;
    }

    // 🚫 User has already liked the feedback
    if (feedback.likedBy.includes(username)) {
       res.status(400).json({ message: "You have already liked this feedback." });
       return;
    }

    // ✅ Update likes only if user hasn't liked yet
    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: username },
      },
      { new: true }
    );

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("❌ Like Error:", error);
    res.status(500).send("Internal Server Error");
  }
});




// Dislike feedback
router.post("/:id/dislike", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id: feedbackId } = req.params;
    const username = req.username; // From verifyToken middleware

    const feedback = await feedbackModel.findById(feedbackId);

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found." });
      return;
    }

    // 🚫 If user has already liked, remove like and add dislike
    if (feedback.likedBy.includes(username)) {
      await feedbackModel.findByIdAndUpdate(
        feedbackId,
        {
          $inc: { likes: -1, dislikes: 1 }, // Decrease likes and increase dislikes
          $pull: { likedBy: username }, // Remove from likedBy
          $addToSet: { dislikedBy: username }, // Add to dislikedBy
        },
        { new: true }
      );
      res.status(200).json({ message: "Dislike added and like removed." });
      return;
    }

    // 🚫 User has already disliked the feedback
    if (feedback.dislikedBy.includes(username)) {
      res.status(400).json({ message: "You have already disliked this feedback." });
      return;
    }

    // ✅ Update dislikes only if user hasn't disliked yet
    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      {
        $inc: { dislikes: 1 },
        $addToSet: { dislikedBy: username },
      },
      { new: true }
    );

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error("❌ Dislike Error:", error);
    res.status(500).send("Internal Server Error");
  }
});



// Add a comment to a feedback
router.post("/:id/comment", verifyToken, async (Req: Request, Res: Response) => {
  try {
    const { comment } = Req.body; // No need to pass userId or username, they come from the token
    const { userId, username } = Req; // Extracted from the token via middleware

    const feedback = await feedbackModel.findById(Req.params.id);
    if (!feedback) {
      Res.status(404).send('Feedback not found');
      return;
    }

    // Add the comment with userId and username to the feedback
    feedback.comments.push({ userId, username, comment });

    // Save the updated feedback
    await feedback.save();

    // Respond with the updated feedback
    Res.status(200).send(feedback);
    return;
  } catch (error) {
    console.log(error);
    Res.status(500).send('Internal Server Error');
    return;
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
