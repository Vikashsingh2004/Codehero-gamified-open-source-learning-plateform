import express from "express";
import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email avatar")
      .populate("comments.userId", "name avatar")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email avatar")
      .populate("comments.userId", "name avatar");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = new Blog({ title, content, author: req.user._id });
    await blog.save();
    await blog.populate("author", "name email avatar");

    await Activity.create({
      userId: req.user._id,
      type: "doubt_created",
      description: `Published a blog: ${title}`,
      points: 15,
      relatedId: blog._id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { experience: 15, contributionPoints: 15 },
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user._id;
    const alreadyLiked = blog.likes.some((id) => id.equals(userId));
    const alreadyDisliked = blog.dislikes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => !id.equals(userId));
    } else {
      blog.likes.push(userId);
      if (alreadyDisliked) {
        blog.dislikes = blog.dislikes.filter((id) => !id.equals(userId));
      }

      if (!blog.author.equals(userId)) {
        await User.findByIdAndUpdate(blog.author, {
          $inc: { contributionPoints: 2 },
        });
      }
    }

    await blog.save();
    await blog.populate("author", "name email avatar");
    await blog.populate("comments.userId", "name avatar");
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/dislike", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user._id;
    const alreadyDisliked = blog.dislikes.some((id) => id.equals(userId));
    const alreadyLiked = blog.likes.some((id) => id.equals(userId));

    if (alreadyDisliked) {
      blog.dislikes = blog.dislikes.filter((id) => !id.equals(userId));
    } else {
      blog.dislikes.push(userId);
      if (alreadyLiked) {
        blog.likes = blog.likes.filter((id) => !id.equals(userId));
      }
    }

    await blog.save();
    await blog.populate("author", "name email avatar");
    await blog.populate("comments.userId", "name avatar");
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments.push({ userId: req.user._id, text: text.trim() });
    await blog.save();
    await blog.populate("author", "name email avatar");
    await blog.populate("comments.userId", "name avatar");

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { experience: 5, contributionPoints: 5 },
    });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
