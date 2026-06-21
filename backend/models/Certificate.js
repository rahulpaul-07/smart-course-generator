const mongoose = require("mongoose");
const crypto = require("crypto");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { 
      type: String, 
      required: true, 
      unique: true, 
      default: () => crypto.randomUUID() 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    userName: { 
      type: String, 
      required: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    courseTitle: { 
      type: String, 
      required: true 
    },
    averageScore: { type: Number, required: true },
    passed: { type: Boolean, required: true, default: false },
    answers: { type: [Number], default: [] },
    issuedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
