import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
