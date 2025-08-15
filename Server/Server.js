// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import UserRouter from "./Routers/userRouter.js";
import MessageRouter from "./Routers/MessageRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ===== Socket.IO setup =====
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// in-memory map: userId -> socketId
export const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  const userId = socket.handshake.query?.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`📌 User ${userId} mapped to socket ${socket.id}`);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const key of Object.keys(userSocketMap)) {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
        console.log(`🗑️ Removed user ${key} from socket map`);
        break;
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ===== Middleware =====
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));

// Make io available in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===== Routes =====
app.use("/api/auth", UserRouter);
app.use("/api/messages", MessageRouter);

// Simple health check
app.get("/api/server", (req, res) => res.send("Server is working"));

// ===== DB connection & start server =====
mongoose
  .connect(`${process.env.MONGO_URI}/chat-app`)
  .then(() => {
    console.log("✅ Database connected successfully");
    if(process.env.NODE_ENV !== "production"){
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server listening on port ${process.env.PORT || 5000}`);
    });
  } 
  })

  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  });


  export default server;
