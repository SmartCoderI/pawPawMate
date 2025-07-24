/*
Entry point
Loads environmental variables;
connect to MongoDB
Starts the Express app on a port;
set up real time Socket.io
 */

//load variables from .env
require("dotenv").config();

const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import routes
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const placeRoutes = require("./routes/placeRoutes");
const cardRoutes = require("./routes/cardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const lostPetRoutes = require("./routes/lostPetRoutes");

// Connect to MongoDB before starting the server
connectDB();

// Set up Express app and HTTP server
const app = express();
const server = http.createServer(app);

// CORS middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001", // Alternative frontend port
      "http://localhost:3000", // Default frontend port
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Static file serving - provide access to uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/lostpets", lostPetRoutes);

//Set up socket.io for real-time lost pet alerts, handle real-time communication (Optional)
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//listen for new client connections and sets up event listeners
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("report-lost-pet", (data) => {
    //notify others nearby
    socket.broadcast.emit("lost-pet-alert", data);
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

//start server

// Use port from centralized configuration (set by start scripts via config.sh/config.bat)
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5001;


//starts the HTTP + websocket server on the desired port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
