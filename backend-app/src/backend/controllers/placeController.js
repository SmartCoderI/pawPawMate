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
    
    // Check for duplicate places by name (case-insensitive)
    const duplicateByName = await Place.findOne({ 
      name: { $regex: new RegExp(`^${placeData.name.trim()}$`, 'i') }
    });
    
    if (duplicateByName) {
      console.log('Duplicate place found by name:', duplicateByName.name);
      return res.status(400).json({ 
        error: 'A place with this name already exists',
        existingPlace: duplicateByName
      });
    }
    
    // Check for duplicate places by coordinates (within ~100 meters)
    const tolerance = 0.001; // roughly 100 meters
    const duplicateByLocation = await Place.findOne({
      'coordinates.lat': { 
        $gte: placeData.coordinates.lat - tolerance, 
        $lte: placeData.coordinates.lat + tolerance 
      },
      'coordinates.lng': { 
        $gte: placeData.coordinates.lng - tolerance, 
        $lte: placeData.coordinates.lng + tolerance 
      }
    });
    
    if (duplicateByLocation) {
      console.log('Duplicate place found by location:', duplicateByLocation.name);
      return res.status(400).json({ 
        error: 'A place already exists at this location',
        existingPlace: duplicateByLocation
      });
    }
    
    // Check for duplicate by address if provided (case-insensitive, trimmed)
    if (placeData.address && placeData.address.trim()) {
      const duplicateByAddress = await Place.findOne({ 
        address: { $regex: new RegExp(`^${placeData.address.trim()}$`, 'i') }
      });
      
      if (duplicateByAddress) {
        console.log('Duplicate place found by address:', duplicateByAddress.address);
        return res.status(400).json({ 
          error: 'A place with this address already exists',
          existingPlace: duplicateByAddress
        });
      }
    }
    
    // Note: No authentication required here - frontend handles login check
    // If a userId is provided in the request body, use it (for logged-in users)
    if (req.body.userId) {
      placeData.addedBy = req.body.userId;
      placeData.creationSource = "user_created";
      console.log('Added user to place data:', req.body.userId);
    } else {
      console.log('No user specified - creating place without user association');
      placeData.creationSource = "user_created"; // Still user created, just anonymous
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

exports.deletePlace = async (req, res) => {
  try {
    const placeId = req.params.id;
    const userId = req.body.userId; // User ID from request body
    
    console.log('Delete place request:', { placeId, userId });
    
    // Find the place first
    const place = await Place.findById(placeId);
    
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    
    // Check if the place was user-created and user is the creator
    if (place.creationSource !== "user_created") {
      console.log('Cannot delete non-user-created place:', {
        placeId: placeId,
        creationSource: place.creationSource
      });
      return res.status(403).json({ 
        error: "This place cannot be deleted because it was not created by a user." 
      });
    }
    
    if (!place.addedBy || place.addedBy.toString() !== userId) {
      console.log('Unauthorized delete attempt:', {
        placeCreator: place.addedBy,
        requestingUser: userId,
        creationSource: place.creationSource
      });
      return res.status(403).json({ 
        error: "You are not authorized to delete this place. Only the creator can delete it." 
      });
    }
    
    // Delete all reviews associated with this place
    const Review = require("../models/Review");
    const deletedReviews = await Review.deleteMany({ placeId: placeId });
    console.log(`Deleted ${deletedReviews.deletedCount} reviews for place ${placeId}`);
    
    // Delete all cards associated with this place
    const Card = require("../models/Card");
    const deletedCards = await Card.deleteMany({ placeId: placeId });
    console.log(`Deleted ${deletedCards.deletedCount} cards for place ${placeId}`);
    
    // Delete the place
    await Place.findByIdAndDelete(placeId);
    console.log('Place deleted successfully:', placeId);
    
    res.json({ 
      message: "Place deleted successfully",
      deletedReviews: deletedReviews.deletedCount,
      deletedCards: deletedCards.deletedCount
    });
  } catch (err) {
    console.error('Error deleting place:', err);
    res.status(500).json({ error: err.message });
  }
};
