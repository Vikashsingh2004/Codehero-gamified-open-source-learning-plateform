import React from "react";
import { Users, Clock, Trash2 } from "lucide-react";

const CourseCard = ({ course, currentUser, onView, onEnroll, onDelete }) => {
  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const isEnrolled = course.enrolledUsers?.some(
    (u) => u._id?.toString() === currentUserId || u.toString() === currentUserId
  );
  const isOwner = course.createdBy?._id?.toString() === currentUserId;
  const isMentor = currentUser?.role === "mentor";

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
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
          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 font-medium ${difficultyColors[course.difficulty] || "bg-gray-100 text-gray-600"}`}>
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
              onClick={() => onView(course._id)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View
            </button>
            {!isMentor && !isEnrolled && (
              <button
                onClick={() => onEnroll(course._id)}
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
                onClick={() => onDelete(course._id)}
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
};

export default CourseCard;
