import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["pdf", "link", "code", "assignment"],
    required: true,
  },
  url: { type: String, required: true },
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  resources: [resourceSchema],
});

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: { type: String },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    duration: { type: Number, required: true }, // in hours
    chapters: [chapterSchema],
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, default: 0 },
    reviews: [reviewSchema],
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
