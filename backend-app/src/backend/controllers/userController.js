const User = require("../models/User");
const mongoose = require("mongoose");

exports.createUser = async (req, res) => {
  try {
    console.log("Backend: Creating user with data:", req.body);
    const user = await User.create(req.body);
    console.log("Backend: Created user successfully:", user);
    res.status(201).json(user);
  } catch (err) {
    console.error("Backend: Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get user by Firebase UID
exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const uid = req.params.uid.trim();
    console.log("Backend: Looking for user with Firebase UID:", uid);

    const user = await User.findOne({ uid: uid });
    if (!user) {
      console.log("Backend: No user found with UID:", uid);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Backend: Found user:", user);
    res.json(user);
  } catch (err) {
    console.error("Backend: Error finding user by UID:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload user profile photo
exports.uploadUserPhoto = async (req, res) => {
  try {
    console.log("User photo upload request received");
    console.log("File:", req.file);
    console.log("Request URL:", req.originalUrl);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if AWS S3 is configured
    const { hasAWSConfig } = require("../utils/upload");
    console.log("AWS S3 configured:", hasAWSConfig);

    let imageUrl;
    if (hasAWSConfig) {
      // AWS S3 URL - use location from custom storage
      if (req.file.location) {
        imageUrl = req.file.location;
      } else if (req.file.key) {
        // Fallback: construct S3 URL from key
        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
      } else {
        console.error("S3 file location and key missing for file:", req.file.originalname);
        throw new Error(`S3 upload failed for file: ${req.file.originalname}`);
      }
    } else {
      // Local storage URL
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/users/${req.file.filename}`;
    }

    console.log("Generated image URL:", imageUrl);

    res.json({
      message: "User photo uploaded successfully",
      imageUrl: imageUrl,
      uploadedFile: {
        originalName: req.file.originalname,
        filename: req.file.filename || req.file.key,
        size: req.file.size,
        location: req.file.location,
        key: req.file.key,
        bucket: req.file.bucket,
      },
    });
  } catch (error) {
    console.error("Error uploading user photo:", error);
    console.error("Error stack:", error.stack);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large. Maximum 5MB per image." });
    } else if (error.message && error.message.includes("Only JPEG, PNG, GIF, and WebP")) {
      return res.status(400).json({ error: error.message });
    } else if (error.message && error.message.includes("S3 upload failed")) {
      return res.status(500).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to upload user photo",
      details: error.message,
      code: error.code,
    });
  }
};

// Helper function to find users near a specific location
exports.findUserNearLocation = async (lat, lng, radiusMiles = 10) => {
  try {
    const latDelta = radiusMiles / 69; // 1 degree lat ≈ 69 miles
    const lngDelta = radiusMiles / 54.6; // 1 degree lng ≈ 54.6 miles (varies by latitude)

    const nearbyUsers = await User.find({
      "lastLoginLocation.lat": {
        $gte: lat - latDelta,
        $lte: lat + latDelta,
        $exists: true,
        $ne: null,
      },
      "lastLoginLocation.lng": {
        $gte: lng - lngDelta,
        $lte: lng + lngDelta,
        $exists: true,
        $ne: null,
      },
    }).select("name email profileImage lastLoginLocation");

    return nearbyUsers;
  } catch (error) {
    console.error("Error finding users near location:", error);
    throw error;
  }
};

// Mark the welcome modal as seen for a user
exports.markWelcomeModalSeen = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Marking welcome modal as seen for user:", userId);

    const user = await User.findByIdAndUpdate(userId, { hasSeenWelcomeModal: true }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Welcome modal status updated successfully for user:", userId);
    res.status(200).json({
      message: "Welcome modal status updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error marking welcome modal as seen:", error);
    res.status(500).json({ error: error.message });
  }
};
