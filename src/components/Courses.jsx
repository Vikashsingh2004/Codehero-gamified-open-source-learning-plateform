import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Users, Clock, Trash2, ArrowLeft, Lock } from "lucide-react";
import { coursesAPI } from "../services/api";

const Courses = ({ currentUser }) => {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll()
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Failed to fetch courses:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateCourse = async (formData) => {
    try {
      const res = await coursesAPI.create(formData);
      setCourses([res.data, ...courses]);
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating course");
    }
  };

  const handleViewCourse = async (id) => {
    try {
      const res = await coursesAPI.getById(id);
      setSelectedCourse(res.data);
    } catch (err) {
      console.error("Error loading course:", err);
      alert("Error loading course details");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await coursesAPI.delete(courseId);
      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting course");
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      const res = await coursesAPI.enroll(courseId);
      setCourses((prev) => prev.map((c) => (c._id === courseId ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || "Error enrolling in course");
    }
  };

  const isMentor = currentUser?.role === "mentor";
  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

  if (showCreateForm && isMentor) {
    return (
      <CreateCourseForm
        onSubmit={handleCreateCourse}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        currentUser={currentUser}
        onEnroll={handleEnrollCourse}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isMentor ? "My Courses" : "Browse Courses"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isMentor ? "Create and manage your courses" : "Enroll in courses to learn new skills"}
          </p>
        </div>
        {isMentor && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </button>
        )}
      </div>

      {!isMentor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Want to create courses?</p>
            <p className="text-sm text-blue-600 mt-0.5">Become a Mentor to create and publish your own courses.</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = course.enrolledUsers?.some(
              (u) => u._id?.toString() === currentUserId || u.toString() === currentUserId
            );
            const isOwner = course.createdBy?._id?.toString() === currentUserId;

            return (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-video bg-gray-200">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{course.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 font-medium ${
                      course.difficulty === "beginner" ? "bg-green-100 text-green-700" :
                      course.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                  <p className="text-xs text-gray-500 mb-3">by {course.createdBy?.name || "Unknown"}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolledUsers?.length || 0} enrolled
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.duration}h
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">${course.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCourse(course._id)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      {!isMentor && !isEnrolled && (
                        <button
                          onClick={() => handleEnrollCourse(course._id)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Enroll
                        </button>
                      )}
                      {!isMentor && isEnrolled && (
                        <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
                          Enrolled
                        </span>
                      )}
                      {isMentor && isOwner && (
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No courses found</p>
              {isMentor && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Create your first course
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete React Developer Course"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              placeholder="What will students learn?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CourseDetail = ({ course, onBack, currentUser, onEnroll }) => {
  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const isEnrolled = course.enrolledUsers?.some(
    (u) => u._id?.toString() === currentUserId || u.toString() === currentUserId
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="flex items-center text-blue-600 mb-6 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Courses
      </button>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          {currentUser?.role !== "mentor" && (
            isEnrolled ? (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">Enrolled</span>
            ) : (
              <button
                onClick={() => onEnroll(course._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            )
          )}
        </div>
        <p className="text-gray-600 mb-6">{course.description}</p>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><span className="font-medium">Created by:</span> {course.createdBy?.name || "Unknown"}</p>
          <p><span className="font-medium">Difficulty:</span> {course.difficulty}</p>
          <p><span className="font-medium">Duration:</span> {course.duration} hours</p>
          <p><span className="font-medium">Price:</span> ${course.price}</p>
          <p><span className="font-medium">Enrolled:</span> {course.enrolledUsers?.length || 0} students</p>
        </div>
      </div>
    </div>
  );
};

export { Courses };
