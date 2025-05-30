// set up the main Express app, including CORS, JSON, API
//but it doesn't start the server

//express: web framework
const express = require("express");
//cors: allows frontend running on a different port to access this backend
const cors = require("cors");

//imports route handler modules that map HTTP requests to controller logic
const petRoutes = require("./routes/petRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const lostPetRoutes = require("./routes/lostPetRoutes");

//////////////// test /////////////////
const testDbRoute = require("./routes/testDbRoute");

//initialize the Express app instance
const app = express();

// Enable Cross-Origin Resource Sharing (for frontend to talk to backend)
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());
// Register route handlers
app.use("/api/pets", petRoutes); //handle pet-related routes
app.use("/api/resources", resourceRoutes); //handle resource locations
app.use("/api/lostpets", lostPetRoutes); //handle lost pet reports and alerts

//////////////// test /////////////////
app.use("/api/test-db", testDbRoute);

// Export app to be used by server.js
module.exports = app;
