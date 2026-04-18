import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

import usersRoutes from "./routes/users.js";
import doubtsRoutes from "./routes/doubts.js";
import sessionsRoutes from "./routes/sessions.js";
import contestsRoutes from "./routes/contests.js";
import coursesRoutes from "./routes/courses.js";
import activitiesRoutes from "./routes/activities.js";
import problemsRoutes from "./routes/problems.js";
import courseSessionsRoutes from "./routes/courseSessions.js";
import blogsRoutes from "./routes/blogs.js";

// ================= APP SETUP =================
const app = express();
const httpServer = createServer(app);

// ================= SOCKET.IO SETUP =================
const io = new Server(httpServer, {
  cors: {
    origin: "*", // frontend URL in production
    methods: ["GET", "POST"],
  },
});

// ================= WEBRTC ROOMS STORE =================
const rooms = {}; // { roomId: [socketId, socketId] }

// ================= SOCKET.IO EVENTS =================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // ---------- JOIN ROOM ----------
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    // Send existing users to new user
    const otherUsers = rooms[roomId].filter((id) => id !== socket.id);
    socket.emit("all-users", otherUsers);

    // Notify others in room
    socket.to(roomId).emit("user-joined", socket.id);

    console.log(`📥 ${socket.id} joined room ${roomId}`);
  });

  // ---------- OFFER ----------
  socket.on("offer", ({ target, caller, sdp }) => {
    io.to(target).emit("offer", { caller, sdp });
  });

  // ---------- ANSWER ----------
  socket.on("answer", ({ target, caller, sdp }) => {
    io.to(target).emit("answer", { caller, sdp });
  });

  // ---------- ICE CANDIDATE ----------
  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", {
      from: socket.id,
      candidate,
    });
  });

  // ---------- LEAVE ROOM ----------
  socket.on("leave-room", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId]; // cleanup empty rooms
      }
    }
    socket.leave(roomId);
    console.log(`📤 ${socket.id} left room ${roomId}`);
  });

  // ---------- DISCONNECT ----------
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    for (const roomId in rooms) {
      if (rooms[roomId].includes(socket.id)) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        socket.to(roomId).emit("user-left", socket.id);

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= MONGODB =================
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Codehero");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
main();

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/doubts", doubtsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/contests", contestsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/courses/:courseId/sessions", courseSessionsRoutes);
app.use("/api/blogs", blogsRoutes);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
