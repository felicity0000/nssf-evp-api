import mongoose, { Document } from 'mongoose';

interface FeedbackDocument extends Document {
  title: string;
  department: string;
  concern: string;
  possibleSolution: string;
  validity: {
    startDate: Date;
    endDate: Date;
  };
  isAnonymous: boolean;
  assignedTo: string;
  name?: string;
  status: string;
  likes: number;
  dislikes: number;
  likedBy: string[];    // Users who liked
  dislikedBy: string[]; // Users who disliked
  comments: Array<{ userId: string; username:string; comment: string }>;
  userId: string;
  approval: boolean;    // New approval field
}

const feedbackSchema = new mongoose.Schema<FeedbackDocument>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    concern: { type: String, required: true },
    possibleSolution: { type: String, required: true },
    validity: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    isAnonymous: { type: Boolean, default: false },
    assignedTo: { type: String, default: '' },
    name: { type: String },
    status: { type: String, default: 'Pending' },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [], index:true },    // Track liked users
    dislikedBy: { type: [String], default: [], index:true }, // Track disliked users
    comments: { type: [{ userId: String, username:String, comment: String }], default: [] },
    userId: { type: String, required: true },
    approval: { type: Boolean, default: false }, // Approval field with default value false
  },
  { timestamps: true }
);

const Feedback = mongoose.model<FeedbackDocument>('Feedback', feedbackSchema);

export default Feedback;
