//Dog parks, clinics, etc.
/*
add new locations via /api/resources/add
get all locations via /api/resources
post reviews on a specific location via /api/resources/:id/review
 */

const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: String,
  type: String, // e.g. dog_park, vet_clinic
  coordinates: {
    lat: Number,
    lng: Number,
  },
  tags: [String],
  reviews: [
    {
      userId: String,
      rating: Number,
      comment: String,
    },
  ],
});

module.exports = mongoose.model("Resource", resourceSchema);
