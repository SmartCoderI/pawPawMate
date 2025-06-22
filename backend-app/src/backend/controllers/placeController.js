const Place = require("../models/Place");

exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPlaces = async (req, res) => {
  try {
    const filters = req.query || {};
    const places = await Place.find(filters);
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
