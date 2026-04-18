import React from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, User, Calendar } from "lucide-react";

const BlogCard = ({ blog, currentUserId, onLike, onDislike, onClick }) => {
  const hasLiked = blog.likes?.some((id) => id === currentUserId || id?._id === currentUserId || id?.toString() === currentUserId);
  const hasDisliked = blog.dislikes?.some((id) => id === currentUserId || id?._id === currentUserId || id?.toString() === currentUserId);

  const preview = blog.content?.length > 200 ? blog.content.slice(0, 200) + "..." : blog.content;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="p-6 cursor-pointer"
        onClick={onClick}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors leading-snug">
          {blog.title}
        </h2>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{preview}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {blog.author?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="font-medium text-gray-700">{blog.author?.name || "Unknown"}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-5">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(blog._id); }}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            hasLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-blue-600" : ""}`} />
          <span>{blog.likes?.length || 0}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDislike(blog._id); }}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            hasDisliked ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <ThumbsDown className={`w-4 h-4 ${hasDisliked ? "fill-red-500" : ""}`} />
          <span>{blog.dislikes?.length || 0}</span>
        </button>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
          <MessageCircle className="w-4 h-4" />
          <span>{blog.comments?.length || 0} comments</span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
