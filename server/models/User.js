import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "mentor"], default: "user" },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    rating: { type: Number, default: 1200 },
    contributionPoints: { type: Number, default: 0 },
    badges: [badgeSchema],
    joinedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
