const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", maxlength: 600 },
    isFeatured: { type: Boolean, default: false },
    clonesCount: { type: Number, default: 0 },
    upvotesCount: { type: Number, default: 0 },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    language: { type: String, default: "English" },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    isPublic: { type: Boolean, default: false },
    earnedCertificateId: { type: String },
    shareId: { type: String, maxlength: 64 },
    finalTest: {
      generatedAt: { type: Date },
      questions: [
        {
          question: { type: String, required: true },
          options: [{ type: String, required: true }],
          correctAnswer: { type: Number, required: true },
          explanation: { type: String, required: true }
        }
      ]
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
      }
    ],
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

courseSchema.index({ shareId: 1 }, { unique: true, sparse: true });
courseSchema.index({ isPublic: 1, upvotesCount: -1 });
courseSchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);
