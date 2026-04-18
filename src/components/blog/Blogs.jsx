import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Search } from "lucide-react";
import { blogsAPI } from "../../services/api";
import BlogCard from "./BlogCard";
import BlogDetail from "./BlogDetail";
import CreateBlogForm from "./CreateBlogForm";

const Blogs = ({ currentUser }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [search, setSearch] = useState("");

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

  useEffect(() => {
    blogsAPI.getAll()
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error("Failed to fetch blogs:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (formData) => {
    try {
      setCreateLoading(true);
      const res = await blogsAPI.create(formData);
      setBlogs([res.data, ...blogs]);
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish blog");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const res = await blogsAPI.like(blogId);
      setBlogs((prev) => prev.map((b) => (b._id === blogId ? res.data : b)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (blogId) => {
    try {
      const res = await blogsAPI.dislike(blogId);
      setBlogs((prev) => prev.map((b) => (b._id === blogId ? res.data : b)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlogUpdate = (updatedBlog) => {
    setBlogs((prev) => prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b)));
    setSelectedBlog(updatedBlog);
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (showCreate) {
    return (
      <CreateBlogForm
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
        loading={createLoading}
      />
    );
  }

  if (selectedBlog) {
    return (
      <BlogDetail
        blog={selectedBlog}
        currentUserId={currentUserId}
        onBack={() => setSelectedBlog(null)}
        onUpdate={handleBlogUpdate}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Blog</h1>
          <p className="text-gray-600 mt-1.5">Read and share insights from the CodeHero community</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Write Blog
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search blogs by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No blogs found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search term" : "Be the first to write a blog!"}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              Write the first blog
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDislike={handleDislike}
              onClick={() => setSelectedBlog(blog)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { Blogs };
