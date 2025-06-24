const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
  
  // Overall rating (1-5 stars)
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  tags: [String], // e.g. ["low cost", "clean", "gentle vet"]
  
  // New 8-category review system for dog parks
  dogParkReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ['easy', 'moderate', 'difficult'], required: false },
      handicapFriendly: { type: Boolean, required: false },
      parkingToParkDistance: { type: String, enum: ['close', 'moderate', 'far'], required: false }
    },
    
    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      dawnToDusk: { type: Boolean, required: false },
      specificHours: { type: String, required: false } // e.g., "6 AM - 10 PM"
    },
    
    // 3. Safety Level
    safetyLevel: {
      fencingCondition: { type: String, enum: ['fully_enclosed', 'partially_enclosed', 'not_enclosed'], required: false },
      doubleGated: { type: Boolean, required: false },
      nightIllumination: { type: Boolean, required: false },
      firstAidStation: { type: Boolean, required: false },
      emergencyContact: { type: Boolean, required: false },
      surveillanceCameras: { type: Boolean, required: false },
      noSharpEdges: { type: Boolean, required: false }
    },
    
    // 4. Size & Layout
    sizeAndLayout: {
      separateAreas: { type: String, enum: ['yes_small_large', 'yes_other', 'no'], required: false },
      runningSpace: { type: String, enum: ['enough', 'limited', 'tight'], required: false },
      drainagePerformance: { type: String, enum: ['excellent', 'good', 'poor'], required: false }
    },
    
    // 5. Amenities & Facilities
    amenitiesAndFacilities: {
      seatingLevel: { type: String, enum: ['bench', 'gazebo', 'no_seat'], required: false },
      shadeAndCover: { type: String, enum: ['trees', 'shade_structures', 'none'], required: false },
      wasteStation: { type: Boolean, required: false },
      biodegradableBags: { type: Boolean, required: false },
      restroom: { type: Boolean, required: false },
      waterAccess: { type: String, enum: ['drinking_fountain', 'fire_hydrant', 'pool', 'none'], required: false }
    },
    
    // 6. Maintenance & Cleanliness
    maintenanceAndCleanliness: {
      overallCleanliness: { type: String, enum: ['good', 'neutral', 'bad'], required: false },
      trashLevel: { type: String, enum: ['clean', 'moderate', 'dirty'], required: false },
      odorLevel: { type: String, enum: ['none', 'mild', 'strong'], required: false },
      equipmentCondition: { type: String, enum: ['good', 'fair', 'poor'], required: false }
    },
    
    // 7. Crowd & Social Dynamics
    crowdAndSocialDynamics: {
      peakDays: { type: [String], enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], required: false },
      peakHours: { type: String, required: false }, // e.g., "5-7 PM"
      socialEvents: { type: [String], enum: ['dog_meet_events', 'training_classes', 'adoption_events', 'none'], required: false },
      ownerCulture: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], required: false },
      wastePickup: { type: String, enum: ['always', 'usually', 'sometimes', 'rarely'], required: false },
      ownerFriendliness: { type: String, enum: ['very_friendly', 'friendly', 'neutral', 'unfriendly'], required: false }
    },
    
    // 8. Rules, Policies & Community
    rulesPoliciesAndCommunity: {
      leashPolicy: { type: String, enum: ['off_leash_allowed', 'leash_required', 'mixed_areas'], required: false },
      vaccinationRequired: { type: Boolean, required: false },
      aggressiveDogPolicy: { type: String, enum: ['strict', 'moderate', 'lenient', 'none'], required: false },
      otherRules: { type: String, required: false }, // Additional rules as text
      communityEnforcement: { type: String, enum: ['strict', 'moderate', 'lenient', 'none'], required: false }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
