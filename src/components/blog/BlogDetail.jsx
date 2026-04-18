import React, { useState } from "react";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Calendar, Send } from "lucide-react";
import { blogsAPI } from "../../services/api";

const BlogDetail = ({ blog, currentUserId, onBack, onUpdate }) => {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasLiked = blog.likes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId
  );
  const hasDisliked = blog.dislikes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId
  );

  const handleLike = async () => {
    try {
      const res = await blogsAPI.like(blog._id);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await blogsAPI.dislike(blog._id);
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const res = await blogsAPI.addComment(blog._id, comment.trim());
      onUpdate(res.data);
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 mb-6 hover:text-blue-700 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Blogs
      </button>

      <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {blog.author?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <span className="font-medium text-gray-800">{blog.author?.name || "Unknown"}</span>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{blog.content}</p>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
              hasLiked
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-blue-600" : ""}`} />
            <span>{blog.likes?.length || 0} Likes</span>
          </button>

          <button
            onClick={handleDislike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
              hasDisliked
                ? "bg-red-50 text-red-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-red-500"
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-red-500" : ""}`} />
            <span>{blog.dislikes?.length || 0} Dislikes</span>
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>{blog.comments?.length || 0} Comments</span>
          </div>
        </div>
      </article>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
          Comments ({blog.comments?.length || 0})
        </h3>

        <form onSubmit={handleComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
              U
            </div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all"
                placeholder="Share your thoughts..."
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {blog.comments?.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}

        <div className="space-y-4">
          {blog.comments?.slice().reverse().map((c, idx) => (
            <div key={c._id || idx} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.userId?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-800">{c.userId?.name || "User"}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
