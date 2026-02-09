import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import ACTIONS from "./Actions.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

/* =======================
   MongoDB Connection
======================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

// Call DB connection
connectDB();

/* =======================
   Mongoose Schema & Model
======================= */
const CodeSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  code: { type: String, default: "" },
});

const Code = mongoose.model("Code", CodeSchema);

/* =======================
   Health Check API (OPTIONAL BUT RECOMMENDED)
======================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    mongoDB: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

/* =======================
   Socket.IO Setup
======================= */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

/* =======================
   Socket.IO Events
======================= */
io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    try {
      let roomData = await Code.findOne({ roomId });

      if (!roomData) {
        roomData = await Code.create({ roomId, code: "" });
      }

      socket.emit(ACTIONS.CODE_CHANGE, {
        code: roomData.code,
      });

      const clients = getAllConnectedClients(roomId);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    } catch (err) {
      console.error("Room join error:", err);
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, async ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });

    try {
      await Code.findOneAndUpdate(
        { roomId },
        { code },
        { upsert: true }
      );
    } catch (err) {
      console.error("Error saving code:", err);
    }
  });

  socket.on("disconnecting", () => {
    [...socket.rooms].forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
  });
});

/* =======================
   Download Code API
======================= */
app.get("/download/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const roomData = await Code.findOne({ roomId });

    if (!roomData) {
      return res.status(404).send("Room not found");
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=code.txt"
    );
    res.setHeader("Content-Type", "text/plain");

    res.send(roomData.code);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Internal Server Error");
  }
});


/* =======================
   Start Server
======================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
