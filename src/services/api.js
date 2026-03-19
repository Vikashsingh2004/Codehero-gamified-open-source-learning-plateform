import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Make sure backend runs here

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// User API
// =======================
export const userAPI = {
  getCurrentUser: () => api.get("/users/me"),
  toggleRole: () => api.put("/users/toggle-role"),
  updateExperience: (points) => api.put("/users/update-experience", { points }),
};

// =======================
// Doubts API
// =======================
export const doubtsAPI = {
  getAll: () => api.get("/doubts"),
  create: (doubtData) => api.post("/doubts", doubtData),
  addSolution: (doubtId, solutionData) =>
    api.post(`/doubts/${doubtId}/solutions`, solutionData),
};

// =======================
// AI API
// =======================
export const aiAPI = {
  ask: (prompt) => api.post("/ai", { prompt }),
};

// =======================
// Sessions API
// =======================
export const sessionsAPI = {
  getAll: () => api.get("/sessions"),
  create: (sessionData) => api.post("/sessions", sessionData),
  join: (sessionId, userId) =>
    api.patch(`/sessions/join/${sessionId}`, { userId }),
};

// =======================
// Contests API
// =======================
export const contestsAPI = {
  getAll: () => api.get("/contests"),
  getById: (contestId) => api.get(`/contests/${contestId}`),
  join: (contestId) => api.post(`/contests/${contestId}/join`),
  getLeaderboard: (contestId) => api.get(`/contests/${contestId}/leaderboard`),
};

// =======================
// Courses API
// =======================
export const coursesAPI = {
  getAll: () => api.get("/courses"),
  create: (courseData) => api.post("/courses", courseData),
  delete: (courseId) => api.delete(`/courses/${courseId}`),
};

// =======================
// Activities API
// =======================
export const activitiesAPI = {
  getAll: () => api.get("/activities"),
};

// =======================
// Problems API
// =======================
export const problemsAPI = {
  getById: (problemId) => api.get(`/problems/${problemId}`),
};

// =======================
// Submissions API
// =======================
export const submissionsAPI = {
  create: (submissionData) => api.post("/submissions", submissionData),
  getUserSubmissions: (userId) => api.get(`/submissions/user/${userId}`),
  getContestSubmissions: (contestId) =>
    api.get(`/submissions/contest/${contestId}`),
  runCode: (data) => api.post("/submissions/run", data),
  getUserProblemSubmissions: (problemId, userId) =>
    api.get(`/submissions/problem/${problemId}/user/${userId}`),
};

export default api;
