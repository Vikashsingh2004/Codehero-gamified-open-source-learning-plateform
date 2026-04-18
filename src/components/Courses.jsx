import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Lock, ArrowLeft } from "lucide-react";
import { coursesAPI } from "../services/api";
import CourseCard from "./courses/CourseCard";
import CreateCourseForm from "./courses/CreateCourseForm";
import CourseSessionsList from "./courses/CourseSessionsList";

const CourseDetail = ({ course, onBack, currentUser, onEnroll }) => {
  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const isEnrolled = course.enrolledUsers?.some(
    (u) => u._id?.toString() === currentUserId || u.toString() === currentUserId
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 mb-6 hover:text-blue-700 transition-colors"
      >
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
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex-shrink-0 ml-4">
                Enrolled
              </span>
            ) : (
              <button
                onClick={() => onEnroll(course._id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 ml-4"
              >
                Enroll Now
              </button>
            )
          )}
        </div>
        <p className="text-gray-600 mb-6">{course.description}</p>
        <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
          <p><span className="font-medium">Created by:</span> {course.createdBy?.name || "Unknown"}</p>
          <p><span className="font-medium">Difficulty:</span> {course.difficulty}</p>
          <p><span className="font-medium">Duration:</span> {course.duration} hours</p>
          <p><span className="font-medium">Price:</span> ${course.price}</p>
          <p><span className="font-medium">Enrolled:</span> {course.enrolledUsers?.length || 0} students</p>
        </div>

        <CourseSessionsList course={course} currentUser={currentUser} />
      </div>
    </div>
  );
};

const Courses = ({ currentUser }) => {
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMentor = currentUser?.role === "mentor";

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
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error enrolling in course");
    }
  };

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
            {isMentor
              ? "Create and manage your courses with live sessions"
              : "Enroll in courses to access content and live sessions"}
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
            <p className="text-sm text-blue-600 mt-0.5">
              Become a Mentor to create and publish your own courses with live sessions.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              currentUser={currentUser}
              onView={handleViewCourse}
              onEnroll={handleEnrollCourse}
              onDelete={handleDeleteCourse}
            />
          ))}

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

export { Courses };
