const Place = require("../models/Place");

exports.createPlace = async (req, res) => {
  try {
    console.log('Place creation attempt by user:', req.user?.uid);
    console.log('Request body received:', req.body);
    
    // Add the current user as addedBy if available
    const placeData = { ...req.body };
    
    // Validate required fields
    if (!placeData.name || !placeData.type) {
      console.error('Validation failed: Missing name or type');
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    // Validate coordinates
    if (!placeData.coordinates || !placeData.coordinates.lat || !placeData.coordinates.lng) {
      console.error('Validation failed: Invalid coordinates', placeData.coordinates);
      return res.status(400).json({ error: 'Valid coordinates (lat, lng) are required' });
    }
    
    // Ensure coordinates are numbers
    placeData.coordinates.lat = Number(placeData.coordinates.lat);
    placeData.coordinates.lng = Number(placeData.coordinates.lng);
    
    if (isNaN(placeData.coordinates.lat) || isNaN(placeData.coordinates.lng)) {
      console.error('Validation failed: Coordinates are not valid numbers');
      return res.status(400).json({ error: 'Coordinates must be valid numbers' });
    }
    
    // Note: No authentication required here - frontend handles login check
    // If a userId is provided in the request body, use it (for logged-in users)
    if (req.body.userId) {
      placeData.addedBy = req.body.userId;
      console.log('Added user to place data:', req.body.userId);
    } else {
      console.log('No user specified - creating place without user association');
    }
    
    console.log('Creating place with validated data:', placeData);
    const place = await Place.create(placeData);
    console.log('Place created successfully:', place);
    res.status(201).json(place);
  } catch (err) {
    console.error('Error creating place:', err);
    console.error('Error stack:', err.stack);
    console.error('Request body:', req.body);
    console.error('Validation errors:', err.errors);
    
    res.status(400).json({ 
      error: err.message,
      details: err.errors ? Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })) : undefined
    });
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
