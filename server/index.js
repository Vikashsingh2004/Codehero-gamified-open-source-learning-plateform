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

// ================= ALLOWED ORIGINS =================
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://codeheroo.netlify.app",
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

// ================= APP SETUP =================
const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

// ================= SOCKET.IO SETUP =================
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.io CORS policy"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================= WEBRTC ROOMS STORE =================
const rooms = {};

// ================= SOCKET.IO EVENTS =================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    const otherUsers = rooms[roomId].filter((id) => id !== socket.id);
    socket.emit("all-users", otherUsers);

    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", ({ target, caller, sdp }) => {
    io.to(target).emit("offer", { caller, sdp });
  });

  socket.on("answer", ({ target, caller, sdp }) => {
    io.to(target).emit("answer", { caller, sdp });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("leave-room", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

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
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS policy"));
    }
  },
  credentials: true,
}));
app.use(express.json());

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
async function startServer() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI environment variable is not set. Server cannot start.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
