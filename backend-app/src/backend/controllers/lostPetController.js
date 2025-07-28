const LostPet = require("../models/LostPet");
const User = require("../models/User");
const { findUserNearLocation } = require("./userController");

let io;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Create a new lost pet report
exports.createLostPetReport = async (req, res) => {
  try {
    console.log('Lost pet report creation request:', req.body);

    const {
      petName,
      species,
      breed,
      color,
      size,
      features,
      lastSeenLocation,
      lastSeenTime,
      ownerContact,
      microchip,
      collar,
      favoritePlaces,
      reward,
      photos,
      userId
    } = req.body;

    // Validate required fields
    if (!petName || !species || !color || !size || !lastSeenLocation || !lastSeenTime || !ownerContact || !userId) {
      return res.status(400).json({
        error: "Missing required fields: petName, species, color, size, lastSeenLocation, lastSeenTime, ownerContact, userId"
      });
    }

    // Validate coordinates
    if (!lastSeenLocation.lat || !lastSeenLocation.lng) {
      return res.status(400).json({ error: "Valid coordinates (lat, lng) are required for last seen location" });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the lost pet report
    const lostPet = await LostPet.create({
      petName,
      species,
      breed: breed || "",
      color,
      size,
      features: features || "",
      status: "missing", // Default status
      lastSeenLocation: {
        lat: Number(lastSeenLocation.lat),
        lng: Number(lastSeenLocation.lng),
        address: lastSeenLocation.address || ""
      },
      lastSeenTime: new Date(lastSeenTime),
      ownerContact,
      microchip: microchip || "",
      collar: collar || "",
      favoritePlaces: favoritePlaces || [],
      reward: reward || "",
      photos: photos || [],
      reportedBy: userId
    });

    // Populate the reporter information
    await lostPet.populate("reportedBy", "name email profileImage");

    try {
      let nearbyUsers = await findUserNearLocation(lostPet.lastSeenLocation.lat, lostPet.lastSeenLocation.lng, 10);
      nearbyUsers = nearbyUsers.filter(u => u._id.toString() !== userId);
      if (nearbyUsers.length > 0 && io) {
        const alertData = {
          id: lostPet._id,
          petName: lostPet.petName,
          species: lostPet.species,
          breed: lostPet.breed,
          color: lostPet.color,
          size: lostPet.size,
          lastSeenLocation: lostPet.lastSeenLocation,
          lastSeenTime: lostPet.lastSeenTime,
          ownerContact: lostPet.ownerContact,
          reward: lostPet.reward,
          photos: lostPet.photos,
          reportedBy: lostPet.reportedBy,
          timestamp: new Date()
        };

        nearbyUsers.forEach(user => {
          io.to(`user_${user._id}`).emit('lost-pet-alert', {
            ...alertData,
            message: `A ${lostPet.species} named ${lostPet.petName} has gone missing near your location.`
          });
        });
        console.log(`Real-time alerts sent to ${nearbyUsers.length} users`);
      }

    } catch (error) {
      console.error('Error finding nearby users:', error);
    }

    // console.log('Lost pet report created successfully:', lostPet);
    res.status(201).json(lostPet);
  } catch (error) {
    console.error('Error creating lost pet report:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.setSocketIO = setSocketIO;

// Get all lost pet reports with optional filtering
exports.getAllLostPets = async (req, res) => {
  try {
    const {
      status,
      species,
      bounds, // For map bounds filtering
      dateRange, // For time filtering
      limit = 100
    } = req.query;

    // Build query object
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by species
    if (species && species !== 'all') {
      query.species = species;
    }

    // Filter by date range
    if (dateRange) {
      const days = parseInt(dateRange);
      if (!isNaN(days)) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        query.createdAt = { $gte: dateThreshold };
      }
    }

    // Filter by map bounds if provided
    if (bounds) {
      try {
        const boundsObj = JSON.parse(bounds);
        if (boundsObj._sw && boundsObj._ne) {
          query['lastSeenLocation.lat'] = {
            $gte: boundsObj._sw.lat,
            $lte: boundsObj._ne.lat
          };
          query['lastSeenLocation.lng'] = {
            $gte: boundsObj._sw.lng,
            $lte: boundsObj._ne.lng
          };
        }
      } catch (e) {
        console.warn('Invalid bounds parameter:', e.message);
      }
    }

    console.log('Fetching lost pets with query:', query);

    const lostPets = await LostPet.find(query)
      .populate("reportedBy", "name email profileImage")
      .populate("sightings.reportedBy", "name email profileImage")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    console.log(`Found ${lostPets.length} lost pets`);
    res.json(lostPets);
  } catch (error) {
    console.error('Error fetching lost pets:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific lost pet by ID
exports.getLostPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const lostPet = await LostPet.findById(id)
      .populate("reportedBy", "name email profileImage")
      .populate("sightings.reportedBy", "name email profileImage");

    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet report not found" });
    }

    res.json(lostPet);
  } catch (error) {
    console.error('Error fetching lost pet:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a sighting report to an existing lost pet
exports.addSightingReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location,
      sightingTime,
      description,
      photos,
      userId
    } = req.body;

    // Validate required fields
    if (!location || !sightingTime || !userId) {
      return res.status(400).json({
        error: "Missing required fields: location, sightingTime, userId"
      });
    }

    // Validate coordinates
    if (!location.lat || !location.lng) {
      return res.status(400).json({ error: "Valid coordinates (lat, lng) are required for sighting location" });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the lost pet
    const lostPet = await LostPet.findById(id);
    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet report not found" });
    }

    // Add the sighting
    const sighting = {
      reportedBy: userId,
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
        address: location.address || ""
      },
      sightingTime: new Date(sightingTime),
      description: description || "",
      photos: photos || [],
      reportedAt: new Date()
    };

    lostPet.sightings.push(sighting);

    // Update status to "seen" if it was "missing"
    if (lostPet.status === "missing") {
      lostPet.status = "seen";
    }

    await lostPet.save();

    // Populate and return updated lost pet
    await lostPet.populate("reportedBy", "name email profileImage");
    await lostPet.populate("sightings.reportedBy", "name email profileImage");

    console.log('Sighting report added successfully');
    res.json(lostPet);
  } catch (error) {
    console.error('Error adding sighting report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update lost pet status (e.g., mark as found)
exports.updateLostPetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      reunionInfo,
      userId
    } = req.body;

    // Validate required fields
    if (!status || !userId) {
      return res.status(400).json({ error: "Status and userId are required" });
    }

    // Find the lost pet
    const lostPet = await LostPet.findById(id);
    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet report not found" });
    }

    // Check if user is the owner of the report
    if (lostPet.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "Only the pet owner can update the status" });
    }

    // Update status
    lostPet.status = status;

    // If marking as found, add reunion info
    if (status === "found" && reunionInfo) {
      lostPet.reunionInfo = {
        foundAt: reunionInfo.foundAt ? new Date(reunionInfo.foundAt) : new Date(),
        foundLocation: reunionInfo.foundLocation || lostPet.lastSeenLocation,
        reunionNote: reunionInfo.reunionNote || "",
        reunionPhoto: reunionInfo.reunionPhoto || ""
      };
    }

    await lostPet.save();

    // Populate and return updated lost pet
    await lostPet.populate("reportedBy", "name email profileImage");
    await lostPet.populate("sightings.reportedBy", "name email profileImage");

    console.log('Lost pet status updated successfully');
    res.json(lostPet);
  } catch (error) {
    console.error('Error updating lost pet status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a lost pet report
exports.deleteLostPetReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Find the lost pet
    const lostPet = await LostPet.findById(id);
    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet report not found" });
    }

    // Check if user is the owner of the report
    if (lostPet.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "Only the pet owner can delete this report" });
    }

    await LostPet.findByIdAndDelete(id);

    console.log('Lost pet report deleted successfully');
    res.json({ message: "Lost pet report deleted successfully" });
  } catch (error) {
    console.error('Error deleting lost pet report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get statistics for lost pets (for dashboard/overview)
exports.getLostPetStats = async (req, res) => {
  try {
    const totalReports = await LostPet.countDocuments();
    const missingCount = await LostPet.countDocuments({ status: "missing" });
    const seenCount = await LostPet.countDocuments({ status: "seen" });
    const foundCount = await LostPet.countDocuments({ status: "found" });

    // Get species breakdown
    const speciesStats = await LostPet.aggregate([
      { $group: { _id: "$species", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent reports (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentReports = await LostPet.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    res.json({
      total: totalReports,
      missing: missingCount,
      seen: seenCount,
      found: foundCount,
      speciesBreakdown: speciesStats,
      recentReports
    });
  } catch (error) {
    console.error('Error fetching lost pet stats:', error);
    res.status(500).json({ error: error.message });
  }
}; 