const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },

  // Overall rating (1-5 stars)
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  tags: [String], // e.g. ["low cost", "clean", "gentle vet"]
  photos: [String], // Array of image URLs

  // Like functionality
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who liked this review
  likeCount: { type: Number, default: 0 }, // Total number of likes

  // 8-category review system for dog parks
  dogParkReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },

    // 3. Safety Level
    safetyLevel: {
      fencingCondition: {
        type: String,
        enum: ["fully_enclosed", "partially_enclosed", "not_enclosed"],
        required: false,
      },
      nightIllumination: { type: Boolean, required: false },
      firstAidStation: { type: Boolean, required: false },
      surveillanceCameras: { type: Boolean, required: false },
    },

    // 4. Size & Layout
    sizeAndLayout: {
      runningSpace: { type: String, enum: ["enough", "limited", "tight"], required: false },
      drainagePerformance: { type: String, enum: ["excellent", "good", "poor"], required: false },
    },

    // 5. Amenities & Facilities
    amenitiesAndFacilities: {
      seatingLevel: { type: String, enum: ["bench", "gazebo", "no_seat"], required: false },
      shadeAndCover: { type: String, enum: ["trees", "shade_structures", "none"], required: false },
      biodegradableBags: { type: Boolean, required: false },
      waterAccess: { type: String, enum: ["drinking_fountain", "fire_hydrant", "pool", "none"], required: false },
    },

    // 6. Maintenance & Cleanliness
    maintenanceAndCleanliness: {
      overallCleanliness: { type: String, enum: ["good", "neutral", "bad"], required: false },
      equipmentCondition: { type: String, enum: ["good", "fair", "poor"], required: false },
    },

    // 7. Crowd & Social Dynamics
    crowdAndSocialDynamics: {
      peakDays: {
        type: [String],
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        required: false,
      },
      ownerCulture: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      ownerFriendliness: {
        type: String,
        enum: ["very_friendly", "friendly", "neutral", "unfriendly"],
        required: false,
      },
    },

    // 8. Rules, Policies & Community
    rulesPoliciesAndCommunity: {
      leashPolicy: { type: String, enum: ["off_leash_allowed", "leash_required", "mixed_areas"], required: false },
      communityEnforcement: { type: String, enum: ["strict", "moderate", "lenient", "none"], required: false },
    },
  },

  // 7-category review system for vet clinics
  vetClinicReview: {

    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      publicTransportAccess: { type: Boolean, required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },

    // 3. Clinic Environment & Facilities
    clinicEnvironmentAndFacilities: {
      cleanliness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      facilitySize: { type: String, enum: ["small", "medium", "large"], required: false },
    },

    // 4. Cost & Transparency
    costAndTransparency: {
      // Cost of Services
      cost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      // Transparency
      feesExplainedUpfront: { type: Boolean, required: false },
      insuranceAccepted: { type: Boolean, required: false },
    },

    // 5. Services & Specializations
    servicesAndSpecializations: {
      onSiteDiagnostics: {
        type: [String],
        enum: ["xray", "ultrasound", "bloodwork", "ecg", "none"],
        required: false,
      },
      surgeryCapabilities: {
        type: [String],
        enum: ["routine_spay_neuter", "orthopedic", "emergency", "dental", "none"],
        required: false,
      },
      specializations: {
        type: [String],
        enum: ["cardiology", "dermatology", "oncology", "behavior", "exotic_animals", "none"],
        required: false,
      },
    },

    // 6. Emergency & After-Hours Care
    emergencyAndAfterHours: {
      // Availability
      openWeekends: { type: Boolean, required: false },
      openEvenings: { type: Boolean, required: false },
      onCallEmergencyNumber: { type: Boolean, required: false },
      // Urgency Response
      emergencyTriageSpeed: {
        type: String,
        enum: ["immediate", "within_30_min", "within_1_hour", "over_1_hour"],
        required: false,
      },
    },

    // 7. Staff & Service Quality
    staffAndServiceQuality: {
      staffFriendliness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      veterinarianExperience: { type: String, enum: ["novice", "experienced", "expert"], required: false },
    },

  },


  // 6-category review system for PET STORE
  petStoreReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },


    // 3. Services & Conveniences
    servicesAndConveniences: {
      grooming: { type: Boolean, required: false },
      veterinaryServices: { type: Boolean, required: false },
      petTraining: { type: Boolean, required: false },
      onlineOrdering: { type: Boolean, required: false },
      curbsidePickup: { type: Boolean, required: false },
      returnPolicy: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 4. Product Selection & Quality
    productSelectionAndQuality: {
      foodBrandVariety: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      toySelection: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      productFreshness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 5. Pricing & Value
    pricingAndValue: {
      overallPricing: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      priceMatching: { type: Boolean, required: false },
    },

    // 6. Staff Knowledge & Service
    staffKnowledgeAndService: {
      petKnowledge: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      trainingCertified: { type: Boolean, required: false },
    },
  },

  // 6-category review system for SHELTER
  animalShelterReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },


    // 3. Animal Type Selection
    animalTypeSelection: {
      availableAnimalTypes: {
        type: [String],
        enum: ["dogs", "cats", "rabbits", "birds", "reptiles", "small_mammals"],
        required: false,
      },
      breedVariety: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 4. Animal Care & Welfare
    animalCareAndWelfare: {
      animalHealth: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      livingConditions: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 5. Adoption Process & Support
    adoptionProcessAndSupport: {
      applicationProcess: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      processingTime: { type: String, enum: ["same_day", "within_week", "1_2_weeks", "over_2_weeks"], required: false },
      homeVisitRequired: { type: Boolean, required: false },
    },

    // 6. Staff & Volunteer Quality
    staffAndVolunteerQuality: {
      staffKnowledge: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      customerService: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      volunteerProgram: { type: Boolean, required: false },
    },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema); 