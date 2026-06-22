const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: "" },
  userAnswer: { type: Number, default: -1 },
}, { _id: false });

const theorySchema = new mongoose.Schema({
  question: { type: String, required: true },
  idealAnswer: { type: String, default: "" },
  userAnswer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  score: { type: Number, default: 0, min: 0, max: 10 },
}, { _id: false });

const codingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problemStatement: { type: String, required: true },
  constraints: { type: String, default: "" },
  starterCode: { type: String, default: "" },
  solutionHint: { type: String, default: "" },
  userSolution: { type: String, default: "" },
  feedback: { type: String, default: "" },
  passed: { type: Boolean, default: false },
}, { _id: false });

const chatMsgSchema = new mongoose.Schema({
  role: { type: String, enum: ["interviewer", "candidate"], required: true },
  content: { type: String, required: true },
}, { _id: false });

const interviewPrepSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    topic: { type: String, required: true, trim: true, maxlength: 300 },
    mcqs: [mcqSchema],
    theoryQuestions: [theorySchema],
    codingQuestions: [codingSchema],
    mockChat: [chatMsgSchema],
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    overallScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

interviewPrepSchema.index({ user: 1, createdAt: -1 });
interviewPrepSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("InterviewPrep", interviewPrepSchema);
