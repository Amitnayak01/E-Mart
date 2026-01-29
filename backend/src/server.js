import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initCloudinary } from "./config/cloudinary.js";
import { initSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 5000;

console.log("🚀 Booting E-Mart Backend...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", PORT);

const start = async () => {
  try {
    /* ================= DATABASE ================= */
    console.log("⏳ Connecting DB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    /* ================= CLOUDINARY ================= */
    initCloudinary();

    /* ================= HTTP SERVER ================= */
    const server = http.createServer(app);

    /* ================= SOCKET.IO ================= */
     const allowedOrigins = [
  "http://localhost:5173",
  "https://e-mart11.netlify.app"
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman etc.
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Socket.IO CORS blocked"));
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 20000,
  pingInterval: 25000
});


    initSocket(io);

    /* ================= START SERVER ================= */
    server.listen(PORT, () => {
      console.log(`🌍 Server running → http://localhost:${PORT}`);
    });

    /* ================= GRACEFUL SHUTDOWN ================= */
    process.on("SIGINT", async () => {
      console.log("🛑 Shutting down server...");
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });
    });

    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled rejection:", err);
    });

  } catch (err) {
    console.error("❌ Server start failed:", err);
    process.exit(1);
  }
};

start();
