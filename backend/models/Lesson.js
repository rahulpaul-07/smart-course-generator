const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: [mongoose.Schema.Types.Mixed], default: [] },
    language: { type: String, default: "English", trim: true, maxlength: 80 },
    isEnriched: { type: Boolean, default: false },
    generationStatus: { type: String, enum: ['none', 'intro', 'outline', 'chunks', 'content', 'quiz', 'complete'], default: 'none' },
    outline: { type: [String], default: [] },
    currentChunkIndex: { type: Number, default: 0 },
    notes: { type: String, default: "", maxlength: 12000 },
    bookmarked: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastOpenedAt: { type: Date, default: null },
    quizBestScore: { type: Number, default: 0, min: 0, max: 5 },
    quizAttempts: { type: Number, default: 0, min: 0 },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
