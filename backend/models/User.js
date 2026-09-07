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
  password: { type: String, maxlength: 128, select: false },
  auth0Id: { type: String, maxlength: 255 },
  googleId: { type: String, maxlength: 255 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: { type: String, maxlength: 500, default: "" },
  avatar: { type: String, default: "" },
  isProfilePublic: { type: Boolean, default: false },
  learningInterests: [{ type: String }],
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },

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
  // Tracked separately because the dashboard reports "longest streak"; it used
  // to echo studyStreak, so it collapsed to 0 whenever a streak broke.
  longestStreak: { type: Number, default: 0 },
  // IANA zone used to decide which calendar day an activity falls on. Streaks
  // were previously computed on UTC days, which shifted the cutoff by 5.5h for
  // users in IST.
  timezone: { type: String, default: "", maxlength: 64 },
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
