import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Users, Clock, Trash2, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000/api/courses";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 🟢 Load all courses
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, []);

  // 🟢 Create a new course
  const handleCreateCourse = async (formData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create course");

      const newCourse = await res.json();
      setCourses([newCourse, ...courses]);
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      alert("Error creating course");
    }
  };

  // 🟢 View full course details
  const handleViewCourse = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("Failed to load course");
      const data = await res.json();
      setSelectedCourse(data);
    } catch (err) {
      console.error("Error loading course:", err);
      alert("Error loading course details");
    }
  };

  // 🟢 Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_URL}/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error(err);
      alert("Error deleting course");
    }
  };

  if (showCreateForm)
    return (
      <CreateCourseForm
        onSubmit={handleCreateCourse}
        onCancel={() => setShowCreateForm(false)}
      />
    );

  if (selectedCourse)
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-600 mt-2">Create and manage your courses</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* 🟢 Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="aspect-video bg-gray-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                {course.description}
              </p>
              <div className="flex justify-between text-sm text-gray-600 mt-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrolledUsers?.length || 0} enrolled
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}h
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-gray-900">
                  ${course.price}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCourse(course._id)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses found</p>
        </div>
      )}
    </div>
  );
};

// 🟢 Create Course Form
const CreateCourseForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    duration: "10",
    price: "99",
    thumbnail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="ml-4 px-6 py-2 text-gray-600 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// 🟢 Course Detail Page
const CourseDetail = ({ course, onBack }) => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <button
      onClick={onBack}
      className="flex items-center text-blue-600 mb-6 hover:underline"
    >
      <ArrowLeft className="w-4 h-4 mr-1" /> Back
    </button>
    <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-64 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p>
          <strong>Created By:</strong> {course.createdBy?.name || "Unknown"}
        </p>
        <p>
          <strong>Difficulty:</strong> {course.difficulty}
        </p>
        <p>
          <strong>Duration:</strong> {course.duration} hours
        </p>
        <p>
          <strong>Price:</strong> ${course.price}
        </p>
      </div>
    </div>
  </div>
);

export { Courses };
