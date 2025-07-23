// set up the main Express app, including CORS, JSON, API
//but it doesn't start the server

//express: web framework
const express = require("express");
//cors: allows frontend running on a different port to access this backend
const cors = require("cors");

//imports route handler modules that map HTTP requests to controller logic
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const placeRoutes = require("./routes/placeRoutes");
const cardRoutes = require("./routes/cardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const lostPetRoutes = require("./routes/lostPetRoutes");

//initialize the Express app instance
const app = express();

// Enable Cross-Origin Resource Sharing (for frontend to talk to backend)
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());
// Register route handlers
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/lostpets", lostPetRoutes);

// Export app to be used by server.js
module.exports = app;
