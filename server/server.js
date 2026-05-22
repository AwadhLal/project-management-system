import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./configs/db.js";
import authRouter from "./routes/authRoutes.js";
import companyRouter from "./routes/companyRoutes.js";
import workspaceRouter from "./routes/workspaceRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import { protect } from "./middlewares/authMiddleware.js";
import { upload } from "./configs/cloudinary.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Pass Socket.io to request objects
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io Handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} 🔌`);

  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    console.log(`User joined project room: ${projectId} 🚪`);
  });

  socket.on("join_workspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`User joined workspace room: ${workspaceId} 🏢`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id} ❌`);
  });
});

app.get("/", (req, res) => res.send("Server is live!⌛"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/company", companyRouter);
app.use("/api/workspaces", protect, workspaceRouter);
app.use("/api/projects", protect, projectRouter);
app.use("/api/tasks", protect, taskRouter);
app.use("/api/comments", protect, commentRouter);

// File Upload Route (Cloudinary)
app.post("/api/upload", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ url: req.file.path });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () =>
  console.log(
    `Server is running on port ${PORT} => http://localhost:${PORT} 🚀`
  )
);
