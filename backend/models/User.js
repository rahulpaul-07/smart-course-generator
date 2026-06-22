const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is invalid"],
  },
  password: { type: String, maxlength: 128 },
  auth0Id: { type: String, maxlength: 255 },
  googleId: { type: String, maxlength: 255 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: { type: String, maxlength: 500, default: "" },
  avatar: { type: String, default: "" },
  isProfilePublic: { type: Boolean, default: false },
  learningInterests: [{ type: String }],
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    courseUpdates: { type: Boolean, default: true }
  },
  onboardingCompleted: { type: Boolean, default: false },
  bookmarkedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson"
  }],
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate"
  }],
  studyStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: "" },
  activityHistory: [{ type: String }],
  totalStudyMinutes: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  achievements: [{
    badge: { type: String },
    name: { type: String },
    description: { type: String },
    unlockedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

userSchema.index({ auth0Id: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
