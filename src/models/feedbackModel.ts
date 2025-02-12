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
  comments: Array<{ userId: string; comment: string }>; // Added comments array
  userId: string;
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
    comments: { type: [{ userId: String, comment: String }], default: [] }, // Comments field
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
