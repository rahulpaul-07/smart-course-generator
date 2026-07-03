const mongoose = require("mongoose");

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  topics: [{ type: String }],
  milestones: [{ type: String }],
  project: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
}, { _id: false });

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: String, required: true, trim: true, maxlength: 300 },
    duration: { type: String, required: true, trim: true, maxlength: 50 },
    skillLevel: { type: String, required: true, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    summary: { type: String, default: "", maxlength: 1000 },
    weeks: [weekSchema],
    completedWeeks: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
