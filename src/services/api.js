import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  promoteUser: (userId) => api.put(`/auth/promote/${userId}`),
};

export const userAPI = {
  getCurrentUser: () => api.get("/users/me"),
  updateExperience: (points) => api.put("/users/update-experience", { points }),
  getAllUsers: () => api.get("/users/all"),
};

export const doubtsAPI = {
  getAll: () => api.get("/doubts"),
  create: (doubtData) => api.post("/doubts", doubtData),
  addSolution: (doubtId, solutionData) =>
    api.post(`/doubts/${doubtId}/solutions`, solutionData),
};

export const aiAPI = {
  ask: (prompt) => api.post("/ai", { prompt }),
};

export const sessionsAPI = {
  getAll: () => api.get("/sessions"),
  create: (sessionData) => api.post("/sessions", sessionData),
  join: (sessionId) => api.patch(`/sessions/join/${sessionId}`),
};

export const contestsAPI = {
  getAll: () => api.get("/contests"),
  getById: (contestId) => api.get(`/contests/${contestId}`),
  create: (contestData) => api.post("/contests", contestData),
  join: (contestId) => api.post(`/contests/${contestId}/join`),
  getLeaderboard: (contestId) => api.get(`/contests/${contestId}/leaderboard`),
};

export const coursesAPI = {
  getAll: () => api.get("/courses"),
  getById: (courseId) => api.get(`/courses/${courseId}`),
  create: (courseData) => api.post("/courses", courseData),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  delete: (courseId) => api.delete(`/courses/${courseId}`),
};

export const activitiesAPI = {
  getAll: () => api.get("/activities"),
};

export const courseSessionsAPI = {
  getAll: (courseId) => api.get(`/courses/${courseId}/sessions`),
  create: (courseId, sessionData) => api.post(`/courses/${courseId}/sessions`, sessionData),
  join: (courseId, sessionId) => api.patch(`/courses/${courseId}/sessions/join/${sessionId}`),
};

export const problemsAPI = {
  getById: (problemId) => api.get(`/problems/${problemId}`),
};

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
