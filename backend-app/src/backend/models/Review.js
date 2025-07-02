const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },

  // Overall rating (1-5 stars)
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  tags: [String], // e.g. ["low cost", "clean", "gentle vet"]
  photos: [String], // Array of image URLs

  // 8-category review system for dog parks
  dogParkReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      handicapFriendly: { type: Boolean, required: false },
      parkingToParkDistance: { type: String, enum: ["close", "moderate", "far"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      dawnToDusk: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },

    // 3. Safety Level
    safetyLevel: {
      fencingCondition: {
        type: String,
        enum: ["fully_enclosed", "partially_enclosed", "not_enclosed"],
        required: false,
      },
      doubleGated: { type: Boolean, required: false },
      nightIllumination: { type: Boolean, required: false },
      firstAidStation: { type: Boolean, required: false },
      emergencyContact: { type: Boolean, required: false },
      surveillanceCameras: { type: Boolean, required: false },
      noSharpEdges: { type: Boolean, required: false },
    },

    // 4. Size & Layout
    sizeAndLayout: {
      separateAreas: { type: String, enum: ["yes_small_large", "yes_other", "no"], required: false },
      runningSpace: { type: String, enum: ["enough", "limited", "tight"], required: false },
      drainagePerformance: { type: String, enum: ["excellent", "good", "poor"], required: false },
    },

    // 5. Amenities & Facilities
    amenitiesAndFacilities: {
      seatingLevel: { type: String, enum: ["bench", "gazebo", "no_seat"], required: false },
      shadeAndCover: { type: String, enum: ["trees", "shade_structures", "none"], required: false },
      wasteStation: { type: Boolean, required: false },
      biodegradableBags: { type: Boolean, required: false },
      restroom: { type: Boolean, required: false },
      waterAccess: { type: String, enum: ["drinking_fountain", "fire_hydrant", "pool", "none"], required: false },
    },

    // 6. Maintenance & Cleanliness
    maintenanceAndCleanliness: {
      overallCleanliness: { type: String, enum: ["good", "neutral", "bad"], required: false },
      trashLevel: { type: String, enum: ["clean", "moderate", "dirty"], required: false },
      odorLevel: { type: String, enum: ["none", "mild", "strong"], required: false },
      equipmentCondition: { type: String, enum: ["good", "fair", "poor"], required: false },
    },

    // 7. Crowd & Social Dynamics
    crowdAndSocialDynamics: {
      peakDays: {
        type: [String],
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        required: false,
      },
      peakHours: { type: String, required: false }, // e.g., "5-7 PM"
      socialEvents: {
        type: [String],
        enum: ["dog_meet_events", "training_classes", "adoption_events", "none"],
        required: false,
      },
      ownerCulture: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      wastePickup: { type: String, enum: ["always", "usually", "sometimes", "rarely"], required: false },
      ownerFriendliness: {
        type: String,
        enum: ["very_friendly", "friendly", "neutral", "unfriendly"],
        required: false,
      },
    },

    // 8. Rules, Policies & Community
    rulesPoliciesAndCommunity: {
      leashPolicy: { type: String, enum: ["off_leash_allowed", "leash_required", "mixed_areas"], required: false },
      vaccinationRequired: { type: Boolean, required: false },
      aggressiveDogPolicy: { type: String, enum: ["strict", "moderate", "lenient", "none"], required: false },
      otherRules: { type: String, required: false }, // Additional rules as text
      communityEnforcement: { type: String, enum: ["strict", "moderate", "lenient", "none"], required: false },
    },
  },

  // 7-category review system for vet clinics
  vetClinicReview: {
    // 1. Clinic Environment & Facilities
    clinicEnvironmentAndFacilities: {
      cleanliness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      comfortLevel: { type: String, enum: ["very_comfortable", "comfortable", "neutral", "uncomfortable"], required: false },
      facilitySize: { type: String, enum: ["small", "medium", "large"], required: false },
    },

    // 2. Cost & Transparency
    costAndTransparency: {
      // Cost of Services
      routineCheckupCost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      vaccinationCost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      spayNeuterCost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      dentalCleaningCost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      emergencyVisitCost: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      
      // Price Transparency
      feesExplainedUpfront: { type: Boolean, required: false },
      printedEstimatesAvailable: { type: Boolean, required: false },
      insuranceAccepted: { type: Boolean, required: false },
      paymentPlansOffered: { type: Boolean, required: false },
    },

    // 3. Medical Staff & Services
    medicalStaffAndServices: {
      // Staff Performance
      veterinarianAttitude: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      veterinarianCompetence: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      technicianNursePerformance: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      
      // Services & Specializations
      onSiteDiagnostics: {
        type: [String],
        enum: ["xray", "ultrasound", "bloodwork", "none"],
        required: false,
      },
      surgeryOrthopedics: { type: Boolean, required: false },
      behavioralCounseling: { type: Boolean, required: false },
      nutritionConsultation: { type: Boolean, required: false },
    },

    // 4. Scheduling & Communication
    schedulingAndCommunication: {
      responseTime: { type: String, enum: ["immediate", "same_day", "next_day", "several_days"], required: false },
      appointmentWaitTime: { type: String, enum: ["same_day", "within_week", "1_2_weeks", "over_2_weeks"], required: false },
      inClinicWaitingTime: { type: String, enum: ["under_15_min", "15_30_min", "30_60_min", "over_1_hour"], required: false },
      followUpCommunication: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 5. Emergency & After-Hours Care
    emergencyAndAfterHours: {
      // Availability
      openWeekends: { type: Boolean, required: false },
      openEvenings: { type: Boolean, required: false },
      onCallEmergencyNumber: { type: Boolean, required: false },
      
      // Referral Process
      connectedToEmergencyHospitals: { type: Boolean, required: false },
      clearHandoffsToSpecialists: { type: Boolean, required: false },
      
      // Urgency Response
      emergencyTriageSpeed: { type: String, enum: ["immediate", "within_30_min", "within_1_hour", "over_1_hour"], required: false },
      crisisHandlingConfidence: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // Emergency Experiences & Photos
    emergencyExperiences: [{
      situationType: { type: String, required: false }, // e.g., "Poisoning", "Broken bone", "Allergic reaction"
      description: { type: String, required: false },
      photos: [String], // Array of image URLs for this specific emergency
      outcome: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      dateOfIncident: { type: Date, required: false },
    }],

    // 6. Owner Involvement
    ownerInvolvement: {
      allowedDuringExams: { type: Boolean, required: false },
      allowedDuringProcedures: { type: Boolean, required: false },
      communicationDuringAnesthesia: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      communicationDuringSurgery: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      explainsProceduresWell: { type: Boolean, required: false },
      involvesOwnerInDecisions: { type: Boolean, required: false },
    },

    // 7. Reputation & Community Engagement
    reputationAndCommunity: {
      onlineReputationConsistency: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      wordOfMouthReputation: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      communityInvolvement: { type: String, enum: ["high", "moderate", "low", "none"], required: false },
      hostsVaccineClinic: { type: Boolean, required: false },
      shelterPartnerships: { type: Boolean, required: false },
      communityEvents: { type: Boolean, required: false },
      educationalPrograms: { type: Boolean, required: false },
      socialMediaPresence: { type: String, enum: ["excellent", "good", "fair", "poor", "none"], required: false },
    },
  },

  // 6-category review system for PET STORE
  petStoreReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      handicapFriendly: { type: Boolean, required: false },
      parkingToParkDistance: { type: String, enum: ["close", "moderate", "far"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      dawnToDusk: { type: Boolean, required: false },
      specificHours: { type: String, required: false }, // e.g., "6 AM - 10 PM"
    },

    // 3. Services & Conveniences
    servicesAndConveniences: {
      grooming: { type: Boolean, required: false },
      veterinaryServices: { type: Boolean, required: false },
      petTraining: { type: Boolean, required: false },
      deliveryService: { type: Boolean, required: false },
      onlineOrdering: { type: Boolean, required: false },
      curbsidePickup: { type: Boolean, required: false },
      returnPolicy: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 4. Product Selection & Quality
    productSelectionAndQuality: {
      foodBrandVariety: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      toySelection: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      suppliesAvailability: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      productFreshness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      organicNaturalOptions: { type: Boolean, required: false },
      prescriptionDietAvailable: { type: Boolean, required: false },
    },

    // 5. Pricing & Value
    pricingAndValue: {
      overallPricing: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      loyaltyProgram: { type: Boolean, required: false },
      frequentSales: { type: Boolean, required: false },
      priceMatching: { type: Boolean, required: false },
      bulkDiscounts: { type: Boolean, required: false },
      seniorDiscounts: { type: Boolean, required: false },
    },

    // 6. Staff Knowledge & Service
    staffKnowledgeAndService: {
      petKnowledge: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      productRecommendations: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      customerService: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      helpfulness: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      multilingual: { type: Boolean, required: false },
      trainingCertified: { type: Boolean, required: false },
    },
  },

  // 6-category review system for SHELTER
  animalShelterReview: {
    // 1. Access & Location
    accessAndLocation: {
      parkingDifficulty: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      handicapFriendly: { type: Boolean, required: false },
      parkingToParkDistance: { type: String, enum: ["close", "moderate", "far"], required: false },
    },

    // 2. Hours of Operation
    hoursOfOperation: {
      is24Hours: { type: Boolean, required: false },
      dawnToDusk: { type: Boolean, required: false },
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
      ageRange: {
        type: [String],
        enum: ["puppies_kittens", "young_adults", "adults", "seniors"],
        required: false,
      },
    },

    // 4. Animal Care & Welfare
    animalCareAndWelfare: {
      animalHealth: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      livingConditions: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      exercisePrograms: { type: Boolean, required: false },
      medicalCare: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      behavioralAssessment: { type: Boolean, required: false },
      specialNeedsCare: { type: Boolean, required: false },
    },

    // 5. Adoption Process & Support
    adoptionProcessAndSupport: {
      applicationProcess: { type: String, enum: ["easy", "moderate", "difficult"], required: false },
      processingTime: { type: String, enum: ["same_day", "within_week", "1_2_weeks", "over_2_weeks"], required: false },
      homeVisitRequired: { type: Boolean, required: false },
      adoptionFees: { type: String, enum: ["low", "moderate", "high", "very_high"], required: false },
      postAdoptionSupport: { type: Boolean, required: false },
      returnPolicy: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },

    // 6. Staff & Volunteer Quality
    staffAndVolunteerQuality: {
      staffKnowledge: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      animalHandling: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      customerService: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
      volunteerProgram: { type: Boolean, required: false },
      staffTraining: { type: Boolean, required: false },
      compassionLevel: { type: String, enum: ["excellent", "good", "fair", "poor"], required: false },
    },
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
