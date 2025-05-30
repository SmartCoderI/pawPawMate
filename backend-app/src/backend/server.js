/*
Entry point
Loads environmental variables;
connect to MongoDB
Starts the Express app on a port;
set up real time Socket.io
 */

//load variables from .env
require("dotenv").config();

//load Express app from app.js, wrap it in an HTTP server
const app = require("./app");
const http = require("http");
//attach a socket.io server on top of the HTTP server to handle real-time communication
const socketio = require("socket.io");

const connectDB = require("./config/db");
// Connect to MongoDB before starting the server
connectDB();

//create an http server from the express app
const server = http.createServer(app);

//set up socket.io for real-time lost pet alerts, handle real-time communication
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
const PORT = process.env.PORT || 4000;

//starts the HTTP + websocket server on the desired port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
