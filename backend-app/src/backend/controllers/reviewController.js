const Review = require("../models/Review");
const Place = require("../models/Place");
const { generateRewardCard } = require("./cardController");

// Helper function to validate pet store review data (basic enum validation)
const validatePetStoreReview = (petStoreReview) => {
  if (!petStoreReview) return true; // Optional field

  const errors = [];

  // Validate accessAndLocation
  if (petStoreReview.accessAndLocation) {
    const { parkingDifficulty, parkingToParkDistance } = petStoreReview.accessAndLocation;
    if (parkingDifficulty && !["easy", "moderate", "difficult"].includes(parkingDifficulty)) {
      errors.push("Invalid parkingDifficulty value");
    }
    if (parkingToParkDistance && !["close", "moderate", "far"].includes(parkingToParkDistance)) {
      errors.push("Invalid parkingToParkDistance value");
    }
  }

  // Validate servicesAndConveniences
  if (petStoreReview.servicesAndConveniences) {
    const { returnPolicy } = petStoreReview.servicesAndConveniences;
    if (returnPolicy && !["excellent", "good", "fair", "poor"].includes(returnPolicy)) {
      errors.push("Invalid returnPolicy value");
    }
  }

  // Validate productSelectionAndQuality
  if (petStoreReview.productSelectionAndQuality) {
    const { foodBrandVariety, toySelection, suppliesAvailability, productFreshness } = petStoreReview.productSelectionAndQuality;
    const qualityValues = ["excellent", "good", "fair", "poor"];
    
    if (foodBrandVariety && !qualityValues.includes(foodBrandVariety)) {
      errors.push("Invalid foodBrandVariety value");
    }
    if (toySelection && !qualityValues.includes(toySelection)) {
      errors.push("Invalid toySelection value");
    }
    if (suppliesAvailability && !qualityValues.includes(suppliesAvailability)) {
      errors.push("Invalid suppliesAvailability value");
    }
    if (productFreshness && !qualityValues.includes(productFreshness)) {
      errors.push("Invalid productFreshness value");
    }
  }

  // Validate pricingAndValue
  if (petStoreReview.pricingAndValue) {
    const { overallPricing } = petStoreReview.pricingAndValue;
    if (overallPricing && !["low", "moderate", "high", "very_high"].includes(overallPricing)) {
      errors.push("Invalid overallPricing value");
    }
  }

  // Validate staffKnowledgeAndService
  if (petStoreReview.staffKnowledgeAndService) {
    const { petKnowledge, productRecommendations, customerService, helpfulness } = petStoreReview.staffKnowledgeAndService;
    const serviceValues = ["excellent", "good", "fair", "poor"];
    
    if (petKnowledge && !serviceValues.includes(petKnowledge)) {
      errors.push("Invalid petKnowledge value");
    }
    if (productRecommendations && !serviceValues.includes(productRecommendations)) {
      errors.push("Invalid productRecommendations value");
    }
    if (customerService && !serviceValues.includes(customerService)) {
      errors.push("Invalid customerService value");
    }
    if (helpfulness && !serviceValues.includes(helpfulness)) {
      errors.push("Invalid helpfulness value");
    }
  }

  return errors.length === 0 ? true : errors;
};

// Helper function to validate animal shelter review data (basic enum validation)
const validateAnimalShelterReview = (animalShelterReview) => {
  if (!animalShelterReview) return true; // Optional field

  const errors = [];

  // Validate accessAndLocation
  if (animalShelterReview.accessAndLocation) {
    const { parkingDifficulty, parkingToParkDistance } = animalShelterReview.accessAndLocation;
    if (parkingDifficulty && !["easy", "moderate", "difficult"].includes(parkingDifficulty)) {
      errors.push("Invalid parkingDifficulty value");
    }
    if (parkingToParkDistance && !["close", "moderate", "far"].includes(parkingToParkDistance)) {
      errors.push("Invalid parkingToParkDistance value");
    }
  }

  // Validate animalTypeSelection
  if (animalShelterReview.animalTypeSelection) {
    const { availableAnimalTypes, breedVariety, ageRange } = animalShelterReview.animalTypeSelection;
    const validAnimalTypes = ["dogs", "cats", "rabbits", "birds", "reptiles", "small_mammals"];
    const validAgeRanges = ["puppies_kittens", "young_adults", "adults", "seniors"];
    
    if (availableAnimalTypes && Array.isArray(availableAnimalTypes)) {
      availableAnimalTypes.forEach((type, index) => {
        if (!validAnimalTypes.includes(type)) {
          errors.push(`Invalid animal type at index ${index}: ${type}`);
        }
      });
    }
    
    if (breedVariety && !["excellent", "good", "fair", "poor"].includes(breedVariety)) {
      errors.push("Invalid breedVariety value");
    }
    
    if (ageRange && Array.isArray(ageRange)) {
      ageRange.forEach((age, index) => {
        if (!validAgeRanges.includes(age)) {
          errors.push(`Invalid age range at index ${index}: ${age}`);
        }
      });
    }
  }

  // Validate animalCareAndWelfare
  if (animalShelterReview.animalCareAndWelfare) {
    const { animalHealth, livingConditions, medicalCare } = animalShelterReview.animalCareAndWelfare;
    const careValues = ["excellent", "good", "fair", "poor"];
    
    if (animalHealth && !careValues.includes(animalHealth)) {
      errors.push("Invalid animalHealth value");
    }
    if (livingConditions && !careValues.includes(livingConditions)) {
      errors.push("Invalid livingConditions value");
    }
    if (medicalCare && !careValues.includes(medicalCare)) {
      errors.push("Invalid medicalCare value");
    }
  }

  // Validate adoptionProcessAndSupport
  if (animalShelterReview.adoptionProcessAndSupport) {
    const { applicationProcess, processingTime, adoptionFees, returnPolicy } = animalShelterReview.adoptionProcessAndSupport;
    
    if (applicationProcess && !["easy", "moderate", "difficult"].includes(applicationProcess)) {
      errors.push("Invalid applicationProcess value");
    }
    if (processingTime && !["same_day", "within_week", "1_2_weeks", "over_2_weeks"].includes(processingTime)) {
      errors.push("Invalid processingTime value");
    }
    if (adoptionFees && !["low", "moderate", "high", "very_high"].includes(adoptionFees)) {
      errors.push("Invalid adoptionFees value");
    }
    if (returnPolicy && !["excellent", "good", "fair", "poor"].includes(returnPolicy)) {
      errors.push("Invalid returnPolicy value");
    }
  }

  // Validate staffAndVolunteerQuality
  if (animalShelterReview.staffAndVolunteerQuality) {
    const { staffKnowledge, animalHandling, customerService, compassionLevel } = animalShelterReview.staffAndVolunteerQuality;
    const qualityValues = ["excellent", "good", "fair", "poor"];
    
    if (staffKnowledge && !qualityValues.includes(staffKnowledge)) {
      errors.push("Invalid staffKnowledge value");
    }
    if (animalHandling && !qualityValues.includes(animalHandling)) {
      errors.push("Invalid animalHandling value");
    }
    if (customerService && !qualityValues.includes(customerService)) {
      errors.push("Invalid customerService value");
    }
    if (compassionLevel && !qualityValues.includes(compassionLevel)) {
      errors.push("Invalid compassionLevel value");
    }
  }

  return errors.length === 0 ? true : errors;
};

// Helper function to validate dog park review data (basic enum validation)
const validateDogParkReview = (dogParkReview) => {
  if (!dogParkReview) return true; // Optional field

  const errors = [];

  // Validate accessAndLocation
  if (dogParkReview.accessAndLocation) {
    const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = dogParkReview.accessAndLocation;
    if (parkingDifficulty && !["easy", "moderate", "difficult"].includes(parkingDifficulty)) {
      errors.push("Invalid parkingDifficulty value");
    }
    if (parkingToParkDistance && !["close", "moderate", "far"].includes(parkingToParkDistance)) {
      errors.push("Invalid parkingToParkDistance value");
    }
  }

  // Validate safetyLevel
  if (dogParkReview.safetyLevel) {
    const { fencingCondition } = dogParkReview.safetyLevel;
    if (fencingCondition && !["fully_enclosed", "partially_enclosed", "not_enclosed"].includes(fencingCondition)) {
      errors.push("Invalid fencingCondition value");
    }
  }

  // Validate sizeAndLayout
  if (dogParkReview.sizeAndLayout) {
    const { separateAreas, runningSpace, drainagePerformance } = dogParkReview.sizeAndLayout;
    if (separateAreas && !["yes_small_large", "yes_other", "no"].includes(separateAreas)) {
      errors.push("Invalid separateAreas value");
    }
    if (runningSpace && !["enough", "limited", "tight"].includes(runningSpace)) {
      errors.push("Invalid runningSpace value");
    }
    if (drainagePerformance && !["excellent", "good", "poor"].includes(drainagePerformance)) {
      errors.push("Invalid drainagePerformance value");
    }
  }

  // Validate amenitiesAndFacilities
  if (dogParkReview.amenitiesAndFacilities) {
    const { seatingLevel, shadeAndCover, waterAccess } = dogParkReview.amenitiesAndFacilities;
    if (seatingLevel && !["bench", "gazebo", "no_seat"].includes(seatingLevel)) {
      errors.push("Invalid seatingLevel value");
    }
    if (shadeAndCover && !["trees", "shade_structures", "none"].includes(shadeAndCover)) {
      errors.push("Invalid shadeAndCover value");
    }
    if (waterAccess && !["drinking_fountain", "fire_hydrant", "pool", "none"].includes(waterAccess)) {
      errors.push("Invalid waterAccess value");
    }
  }

  // Validate maintenanceAndCleanliness
  if (dogParkReview.maintenanceAndCleanliness) {
    const { overallCleanliness, trashLevel, odorLevel, equipmentCondition } = dogParkReview.maintenanceAndCleanliness;
    if (overallCleanliness && !["good", "neutral", "bad"].includes(overallCleanliness)) {
      errors.push("Invalid overallCleanliness value");
    }
    if (trashLevel && !["clean", "moderate", "dirty"].includes(trashLevel)) {
      errors.push("Invalid trashLevel value");
    }
    if (odorLevel && !["none", "mild", "strong"].includes(odorLevel)) {
      errors.push("Invalid odorLevel value");
    }
    if (equipmentCondition && !["good", "fair", "poor"].includes(equipmentCondition)) {
      errors.push("Invalid equipmentCondition value");
    }
  }

  // Validate crowdAndSocialDynamics
  if (dogParkReview.crowdAndSocialDynamics) {
    const { ownerCulture, wastePickup, ownerFriendliness } = dogParkReview.crowdAndSocialDynamics;
    if (ownerCulture && !["excellent", "good", "fair", "poor"].includes(ownerCulture)) {
      errors.push("Invalid ownerCulture value");
    }
    if (wastePickup && !["always", "usually", "sometimes", "rarely"].includes(wastePickup)) {
      errors.push("Invalid wastePickup value");
    }
    if (ownerFriendliness && !["very_friendly", "friendly", "neutral", "unfriendly"].includes(ownerFriendliness)) {
      errors.push("Invalid ownerFriendliness value");
    }
  }

  // Validate rulesPoliciesAndCommunity
  if (dogParkReview.rulesPoliciesAndCommunity) {
    const { leashPolicy, aggressiveDogPolicy, communityEnforcement } = dogParkReview.rulesPoliciesAndCommunity;
    if (leashPolicy && !["off_leash_allowed", "leash_required", "mixed_areas"].includes(leashPolicy)) {
      errors.push("Invalid leashPolicy value");
    }
    if (aggressiveDogPolicy && !["strict", "moderate", "lenient", "none"].includes(aggressiveDogPolicy)) {
      errors.push("Invalid aggressiveDogPolicy value");
    }
    if (communityEnforcement && !["strict", "moderate", "lenient", "none"].includes(communityEnforcement)) {
      errors.push("Invalid communityEnforcement value");
    }
  }

  return errors.length === 0 ? true : errors;
};

// Helper function to validate vet clinic review data
const validateVetClinicReview = (vetClinicReview) => {
  if (!vetClinicReview) return true; // Optional field

  const errors = [];

  // Validate clinicEnvironmentAndFacilities
  if (vetClinicReview.clinicEnvironmentAndFacilities) {
    const { cleanliness, comfortLevel, facilitySize } = vetClinicReview.clinicEnvironmentAndFacilities;
    if (cleanliness && !["excellent", "good", "fair", "poor"].includes(cleanliness)) {
      errors.push("Invalid cleanliness value");
    }
    if (comfortLevel && !["very_comfortable", "comfortable", "neutral", "uncomfortable"].includes(comfortLevel)) {
      errors.push("Invalid comfortLevel value");
    }
    if (facilitySize && !["small", "medium", "large"].includes(facilitySize)) {
      errors.push("Invalid facilitySize value");
    }
  }

  // Validate costAndTransparency
  if (vetClinicReview.costAndTransparency) {
    const { routineCheckupCost, vaccinationCost, spayNeuterCost, dentalCleaningCost, emergencyVisitCost } = vetClinicReview.costAndTransparency;
    const costValues = ["low", "moderate", "high", "very_high"];
    
    if (routineCheckupCost && !costValues.includes(routineCheckupCost)) {
      errors.push("Invalid routineCheckupCost value");
    }
    if (vaccinationCost && !costValues.includes(vaccinationCost)) {
      errors.push("Invalid vaccinationCost value");
    }
    if (spayNeuterCost && !costValues.includes(spayNeuterCost)) {
      errors.push("Invalid spayNeuterCost value");
    }
    if (dentalCleaningCost && !costValues.includes(dentalCleaningCost)) {
      errors.push("Invalid dentalCleaningCost value");
    }
    if (emergencyVisitCost && !costValues.includes(emergencyVisitCost)) {
      errors.push("Invalid emergencyVisitCost value");
    }
  }

  // Validate medicalStaffAndServices
  if (vetClinicReview.medicalStaffAndServices) {
    const { veterinarianAttitude, veterinarianCompetence, technicianNursePerformance, onSiteDiagnostics } = vetClinicReview.medicalStaffAndServices;
    const performanceValues = ["excellent", "good", "fair", "poor"];
    
    if (veterinarianAttitude && !performanceValues.includes(veterinarianAttitude)) {
      errors.push("Invalid veterinarianAttitude value");
    }
    if (veterinarianCompetence && !performanceValues.includes(veterinarianCompetence)) {
      errors.push("Invalid veterinarianCompetence value");
    }
    if (technicianNursePerformance && !performanceValues.includes(technicianNursePerformance)) {
      errors.push("Invalid technicianNursePerformance value");
    }
    if (onSiteDiagnostics && Array.isArray(onSiteDiagnostics)) {
      const validDiagnostics = ["xray", "ultrasound", "bloodwork", "none"];
      const invalidDiagnostics = onSiteDiagnostics.filter(d => !validDiagnostics.includes(d));
      if (invalidDiagnostics.length > 0) {
        errors.push("Invalid onSiteDiagnostics values: " + invalidDiagnostics.join(", "));
      }
    }
  }

  // Validate schedulingAndCommunication
  if (vetClinicReview.schedulingAndCommunication) {
    const { responseTime, appointmentWaitTime, inClinicWaitingTime, followUpCommunication } = vetClinicReview.schedulingAndCommunication;
    
    if (responseTime && !["immediate", "same_day", "next_day", "several_days"].includes(responseTime)) {
      errors.push("Invalid responseTime value");
    }
    if (appointmentWaitTime && !["same_day", "within_week", "1_2_weeks", "over_2_weeks"].includes(appointmentWaitTime)) {
      errors.push("Invalid appointmentWaitTime value");
    }
    if (inClinicWaitingTime && !["under_15_min", "15_30_min", "30_60_min", "over_1_hour"].includes(inClinicWaitingTime)) {
      errors.push("Invalid inClinicWaitingTime value");
    }
    if (followUpCommunication && !["excellent", "good", "fair", "poor"].includes(followUpCommunication)) {
      errors.push("Invalid followUpCommunication value");
    }
  }

  // Validate emergencyAndAfterHours
  if (vetClinicReview.emergencyAndAfterHours) {
    const { emergencyTriageSpeed, crisisHandlingConfidence } = vetClinicReview.emergencyAndAfterHours;
    
    if (emergencyTriageSpeed && !["immediate", "within_30_min", "within_1_hour", "over_1_hour"].includes(emergencyTriageSpeed)) {
      errors.push("Invalid emergencyTriageSpeed value");
    }
    if (crisisHandlingConfidence && !["excellent", "good", "fair", "poor"].includes(crisisHandlingConfidence)) {
      errors.push("Invalid crisisHandlingConfidence value");
    }
  }

  // Validate emergencyExperiences
  if (vetClinicReview.emergencyExperiences && Array.isArray(vetClinicReview.emergencyExperiences)) {
    vetClinicReview.emergencyExperiences.forEach((exp, index) => {
      if (exp.outcome && !["excellent", "good", "fair", "poor"].includes(exp.outcome)) {
        errors.push(`Invalid outcome value in emergency experience ${index + 1}`);
      }
    });
  }

  // Validate ownerInvolvement
  if (vetClinicReview.ownerInvolvement) {
    const { communicationDuringAnesthesia, communicationDuringSurgery } = vetClinicReview.ownerInvolvement;
    const communicationValues = ["excellent", "good", "fair", "poor"];
    
    if (communicationDuringAnesthesia && !communicationValues.includes(communicationDuringAnesthesia)) {
      errors.push("Invalid communicationDuringAnesthesia value");
    }
    if (communicationDuringSurgery && !communicationValues.includes(communicationDuringSurgery)) {
      errors.push("Invalid communicationDuringSurgery value");
    }
  }

  // Validate reputationAndCommunity
  if (vetClinicReview.reputationAndCommunity) {
    const { onlineReputationConsistency, wordOfMouthReputation, communityInvolvement, socialMediaPresence } = vetClinicReview.reputationAndCommunity;
    const reputationValues = ["excellent", "good", "fair", "poor"];
    
    if (onlineReputationConsistency && !reputationValues.includes(onlineReputationConsistency)) {
      errors.push("Invalid onlineReputationConsistency value");
    }
    if (wordOfMouthReputation && !reputationValues.includes(wordOfMouthReputation)) {
      errors.push("Invalid wordOfMouthReputation value");
    }
    if (communityInvolvement && !["high", "moderate", "low", "none"].includes(communityInvolvement)) {
      errors.push("Invalid communityInvolvement value");
    }
    if (socialMediaPresence && !["excellent", "good", "fair", "poor", "none"].includes(socialMediaPresence)) {
      errors.push("Invalid socialMediaPresence value");
    }
  }

  return errors.length === 0 ? true : errors;
};

// Helper function to clean dog park review data (remove empty strings to avoid enum validation errors)
const cleanDogParkReview = (dogParkReview) => {
  if (!dogParkReview) return dogParkReview;

  const cleanObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === "" || value === null) {
        // Skip empty strings and null values to avoid enum validation errors
        continue;
      } else if (Array.isArray(value)) {
        // Filter out empty strings from arrays
        const cleanedArray = value.filter((item) => item !== "" && item !== null);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else if (typeof value === "object") {
        // Recursively clean nested objects
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        // Keep non-empty values
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  return cleanObject(dogParkReview);
};

// Helper function to clean vet clinic review data (remove empty strings to avoid enum validation errors)
const cleanVetClinicReview = (vetClinicReview) => {
  if (!vetClinicReview) return vetClinicReview;

  const cleanObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === "" || value === null) {
        // Skip empty strings and null values to avoid enum validation errors
        continue;
      } else if (Array.isArray(value)) {
        // Filter out empty strings from arrays
        const cleanedArray = value.filter((item) => item !== "" && item !== null);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else if (typeof value === "object") {
        // Recursively clean nested objects
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        // Keep non-empty values
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  return cleanObject(vetClinicReview);
};

exports.addReview = async (req, res) => {
  try {
    console.log("Review creation request received:", req.body);
    const { placeId, rating, comment, tags, dogParkReview, vetClinicReview, userId, placeData, photos } = req.body;

    // Validate required fields
    if (!rating) {
      return res.status(400).json({ error: "rating is required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Validate user ID (frontend should send MongoDB user ID)
    if (!userId) {
      return res.status(400).json({ error: "userId is required. Please log in to submit a review." });
    }

    // Verify the user exists in the database
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found. Please log in again." });
    }

    // Clean and validate dog park review data if provided
    let cleanedDogParkReview = null;
    if (dogParkReview) {
      // Clean the dog park review data (remove empty strings to avoid enum validation errors)
      cleanedDogParkReview = cleanDogParkReview(dogParkReview);
      console.log("Original dogParkReview:", dogParkReview);
      console.log("Cleaned dogParkReview:", cleanedDogParkReview);

      // Validate the cleaned data
      if (cleanedDogParkReview && Object.keys(cleanedDogParkReview).length > 0) {
        const validationResult = validateDogParkReview(cleanedDogParkReview);
        if (validationResult !== true) {
          return res.status(400).json({
            error: "Invalid dog park review data",
            details: validationResult,
          });
        }
      }
    }

    // Clean and validate vet clinic review data if provided
    let cleanedVetClinicReview = null;
    if (vetClinicReview) {
      // Clean the vet clinic review data (remove empty strings to avoid enum validation errors)
      cleanedVetClinicReview = cleanVetClinicReview(vetClinicReview);
      console.log("Original vetClinicReview:", vetClinicReview);
      console.log("Cleaned vetClinicReview:", cleanedVetClinicReview);

      // Validate the cleaned data
      if (cleanedVetClinicReview && Object.keys(cleanedVetClinicReview).length > 0) {
        const validationResult = validateVetClinicReview(cleanedVetClinicReview);
        if (validationResult !== true) {
          return res.status(400).json({
            error: "Invalid vet clinic review data",
            details: validationResult,
          });
        }
      }
    }

    let finalPlaceId = placeId;

    // Check if we have a placeId first
    if (placeId) {
      // Check if place exists in database
      const existingPlace = await Place.findById(placeId);
      if (!existingPlace) {
        console.log(`Place with ID ${placeId} not found in database`);
        // If placeId provided but place doesn't exist, we need placeData to create it
        if (!placeData) {
          return res.status(404).json({ error: "Place not found and no place data provided to create it" });
        }
        finalPlaceId = null; // We'll create a new place
      }
    }

    // If no placeId or place doesn't exist, create or find the place first
    if (!finalPlaceId) {
      if (!placeData) {
        return res
          .status(400)
          .json({ error: "Either placeId for existing place or placeData for new place is required" });
      }

      // Validate place data
      if (!placeData.name || !placeData.coordinates || !placeData.coordinates.lat || !placeData.coordinates.lng) {
        return res.status(400).json({ error: "Place data must include name and valid coordinates (lat, lng)" });
      }

      const lat = Number(placeData.coordinates.lat);
      const lng = Number(placeData.coordinates.lng);

      // Check if a place already exists at these coordinates (within ~100 meters)
      const existingPlaceAtLocation = await Place.findOne({
        "coordinates.lat": { $gte: lat - 0.001, $lte: lat + 0.001 },
        "coordinates.lng": { $gte: lng - 0.001, $lte: lng + 0.001 },
        type: placeData.type || "shelter",
      });

      if (existingPlaceAtLocation) {
        console.log("Found existing place at similar coordinates:", existingPlaceAtLocation._id);
        finalPlaceId = existingPlaceAtLocation._id;
      } else {
        console.log("Creating new place before adding review:", placeData);

        // Create the place
        const newPlace = await Place.create({
          name: placeData.name,
          type: placeData.type || "shelter",
          coordinates: {
            lat: lat,
            lng: lng,
          },
          address: placeData.address || "",
          phone: placeData.phone || "",
          website: placeData.website || "",
          opening_hours: placeData.opening_hours || "",
          description: placeData.description || "",
          tags: placeData.tags || [],
          addedBy: userId,
        });

        console.log("New place created successfully:", newPlace);
        finalPlaceId = newPlace._id;
      }
    }

    // Create the review with the correct MongoDB user ID
    const review = await Review.create({
      userId: userId, // Use MongoDB user ID from request body
      placeId: finalPlaceId,
      rating,
      comment,
      tags,
      photos: photos || [], // Include photos array
      dogParkReview: cleanedDogParkReview, // Use cleaned data
      vetClinicReview: cleanedVetClinicReview, // Use cleaned vet clinic data
    });

    // Populate user information for response
    await review.populate("userId", "name email profileImage");

    console.log("Review created successfully:", review);

    // REWARD CARD GENERATION LOGIC
    try {
      // Step 1: Content Validity Check (Anti-spam)
      const isValidContent = (comment && comment.length >= 20) || (tags && tags.length > 0) || rating;
      
      if (isValidContent) {
        console.log("Review meets content validity requirements");
        
        // Step 2: Reward Eligibility Check
        let shouldGenerateCard = false;
        let contributionType = "";
        
        // Check if this is the user's first review ever
        const userReviewCount = await Review.countDocuments({ userId: userId });
        
        if (userReviewCount === 1) {
          // This is their first review
          shouldGenerateCard = true;
          contributionType = "first_review";
          console.log("User earned card for first review");
        } else {
          // Check other conditions for additional cards
          
          // Check if user has 3+ total reviews (milestone achievement)
          if (userReviewCount >= 3) {
            shouldGenerateCard = true;
            contributionType = "milestone_achievement";
            console.log("User earned card for milestone achievement (3+ reviews)");
          }
          
          // Note: Community approval (2+ upvotes) will be checked separately 
          // when the helpful count is updated, not during review creation
        }
        
        // Generate the card if eligible
        if (shouldGenerateCard) {
          // Get place name for the card
          const place = await Place.findById(finalPlaceId);
          const locationName = place ? place.name : "Unknown Location";
          
          await generateRewardCard(
            userId,
            review._id,
            finalPlaceId,
            locationName,
            contributionType
          );
          
          console.log(`✅ Reward card generated for user ${userId} - ${contributionType}`);
        }
      }
    } catch (cardError) {
      // Don't fail the review if card generation fails
      console.error("Error generating reward card:", cardError);
    }

    // Include the final place ID in the response for frontend navigation
    const responseData = {
      ...review.toObject(),
      placeId: finalPlaceId, // Ensure we return the actual place ID used
    };

    res.status(201).json(responseData);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewsForPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    console.log("Fetching reviews for place:", placeId);
    
    // First, get reviews without population to see if they exist
    const reviewsRaw = await Review.find({ placeId });
    console.log(`Found ${reviewsRaw.length} reviews for place ${placeId}`);
    
    if (reviewsRaw.length === 0) {
      console.log("No reviews found, returning empty array");
      return res.json([]);
    }
    
    // Then populate user data with error handling
    const reviews = await Review.find({ placeId })
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews by a specific user
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId })
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: err.message });
  }
};

// New endpoint to get dog park specific review statistics
exports.getDogParkReviewStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    // Get all dog park reviews for this place
    const reviews = await Review.find({
      placeId,
      dogParkReview: { $exists: true, $ne: null },
    });

    if (reviews.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        categoryStats: {},
      });
    }

    // Calculate overall statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    // Calculate category-specific statistics
    const categoryStats = {
      accessAndLocation: {
        parkingDifficulty: {},
        handicapFriendly: { true: 0, false: 0 },
        parkingToParkDistance: {},
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        dawnToDusk: { true: 0, false: 0 },
      },
      safetyLevel: {
        fencingCondition: {},
        doubleGated: { true: 0, false: 0 },
        nightIllumination: { true: 0, false: 0 },
        firstAidStation: { true: 0, false: 0 },
        emergencyContact: { true: 0, false: 0 },
        surveillanceCameras: { true: 0, false: 0 },
        noSharpEdges: { true: 0, false: 0 },
      },
      sizeAndLayout: {
        separateAreas: {},
        runningSpace: {},
        drainagePerformance: {},
      },
      amenitiesAndFacilities: {
        seatingLevel: {},
        shadeAndCover: {},
        wasteStation: { true: 0, false: 0 },
        biodegradableBags: { true: 0, false: 0 },
        restroom: { true: 0, false: 0 },
        waterAccess: {},
      },
      maintenanceAndCleanliness: {
        overallCleanliness: {},
        trashLevel: {},
        odorLevel: {},
        equipmentCondition: {},
      },
      crowdAndSocialDynamics: {
        ownerCulture: {},
        wastePickup: {},
        ownerFriendliness: {},
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: {},
        vaccinationRequired: { true: 0, false: 0 },
        aggressiveDogPolicy: {},
        communityEnforcement: {},
      },
    };

    // Aggregate statistics from all reviews
    reviews.forEach((review) => {
      if (review.dogParkReview) {
        const { dogParkReview } = review;

        // Access & Location
        if (dogParkReview.accessAndLocation) {
          const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = dogParkReview.accessAndLocation;
          if (parkingDifficulty) {
            categoryStats.accessAndLocation.parkingDifficulty[parkingDifficulty] =
              (categoryStats.accessAndLocation.parkingDifficulty[parkingDifficulty] || 0) + 1;
          }
          if (handicapFriendly !== undefined) {
            categoryStats.accessAndLocation.handicapFriendly[handicapFriendly]++;
          }
          if (parkingToParkDistance) {
            categoryStats.accessAndLocation.parkingToParkDistance[parkingToParkDistance] =
              (categoryStats.accessAndLocation.parkingToParkDistance[parkingToParkDistance] || 0) + 1;
          }
        }

        // Hours of Operation
        if (dogParkReview.hoursOfOperation) {
          const { is24Hours, dawnToDusk } = dogParkReview.hoursOfOperation;
          if (is24Hours !== undefined) {
            categoryStats.hoursOfOperation.is24Hours[is24Hours]++;
          }
          if (dawnToDusk !== undefined) {
            categoryStats.hoursOfOperation.dawnToDusk[dawnToDusk]++;
          }
        }

        // Safety Level
        if (dogParkReview.safetyLevel) {
          const {
            fencingCondition,
            doubleGated,
            nightIllumination,
            firstAidStation,
            emergencyContact,
            surveillanceCameras,
            noSharpEdges,
          } = dogParkReview.safetyLevel;
          if (fencingCondition) {
            categoryStats.safetyLevel.fencingCondition[fencingCondition] =
              (categoryStats.safetyLevel.fencingCondition[fencingCondition] || 0) + 1;
          }
          if (doubleGated !== undefined) categoryStats.safetyLevel.doubleGated[doubleGated]++;
          if (nightIllumination !== undefined) categoryStats.safetyLevel.nightIllumination[nightIllumination]++;
          if (firstAidStation !== undefined) categoryStats.safetyLevel.firstAidStation[firstAidStation]++;
          if (emergencyContact !== undefined) categoryStats.safetyLevel.emergencyContact[emergencyContact]++;
          if (surveillanceCameras !== undefined) categoryStats.safetyLevel.surveillanceCameras[surveillanceCameras]++;
          if (noSharpEdges !== undefined) categoryStats.safetyLevel.noSharpEdges[noSharpEdges]++;
        }

        // Size & Layout
        if (dogParkReview.sizeAndLayout) {
          const { separateAreas, runningSpace, drainagePerformance } = dogParkReview.sizeAndLayout;
          if (separateAreas) {
            categoryStats.sizeAndLayout.separateAreas[separateAreas] =
              (categoryStats.sizeAndLayout.separateAreas[separateAreas] || 0) + 1;
          }
          if (runningSpace) {
            categoryStats.sizeAndLayout.runningSpace[runningSpace] =
              (categoryStats.sizeAndLayout.runningSpace[runningSpace] || 0) + 1;
          }
          if (drainagePerformance) {
            categoryStats.sizeAndLayout.drainagePerformance[drainagePerformance] =
              (categoryStats.sizeAndLayout.drainagePerformance[drainagePerformance] || 0) + 1;
          }
        }

        // Amenities & Facilities
        if (dogParkReview.amenitiesAndFacilities) {
          const { seatingLevel, shadeAndCover, wasteStation, biodegradableBags, restroom, waterAccess } =
            dogParkReview.amenitiesAndFacilities;
          if (seatingLevel) {
            categoryStats.amenitiesAndFacilities.seatingLevel[seatingLevel] =
              (categoryStats.amenitiesAndFacilities.seatingLevel[seatingLevel] || 0) + 1;
          }
          if (shadeAndCover) {
            categoryStats.amenitiesAndFacilities.shadeAndCover[shadeAndCover] =
              (categoryStats.amenitiesAndFacilities.shadeAndCover[shadeAndCover] || 0) + 1;
          }
          if (wasteStation !== undefined) categoryStats.amenitiesAndFacilities.wasteStation[wasteStation]++;
          if (biodegradableBags !== undefined)
            categoryStats.amenitiesAndFacilities.biodegradableBags[biodegradableBags]++;
          if (restroom !== undefined) categoryStats.amenitiesAndFacilities.restroom[restroom]++;
          if (waterAccess) {
            categoryStats.amenitiesAndFacilities.waterAccess[waterAccess] =
              (categoryStats.amenitiesAndFacilities.waterAccess[waterAccess] || 0) + 1;
          }
        }

        // Maintenance & Cleanliness
        if (dogParkReview.maintenanceAndCleanliness) {
          const { overallCleanliness, trashLevel, odorLevel, equipmentCondition } =
            dogParkReview.maintenanceAndCleanliness;
          if (overallCleanliness) {
            categoryStats.maintenanceAndCleanliness.overallCleanliness[overallCleanliness] =
              (categoryStats.maintenanceAndCleanliness.overallCleanliness[overallCleanliness] || 0) + 1;
          }
          if (trashLevel) {
            categoryStats.maintenanceAndCleanliness.trashLevel[trashLevel] =
              (categoryStats.maintenanceAndCleanliness.trashLevel[trashLevel] || 0) + 1;
          }
          if (odorLevel) {
            categoryStats.maintenanceAndCleanliness.odorLevel[odorLevel] =
              (categoryStats.maintenanceAndCleanliness.odorLevel[odorLevel] || 0) + 1;
          }
          if (equipmentCondition) {
            categoryStats.maintenanceAndCleanliness.equipmentCondition[equipmentCondition] =
              (categoryStats.maintenanceAndCleanliness.equipmentCondition[equipmentCondition] || 0) + 1;
          }
        }

        // Crowd & Social Dynamics
        if (dogParkReview.crowdAndSocialDynamics) {
          const { ownerCulture, wastePickup, ownerFriendliness } = dogParkReview.crowdAndSocialDynamics;
          if (ownerCulture) {
            categoryStats.crowdAndSocialDynamics.ownerCulture[ownerCulture] =
              (categoryStats.crowdAndSocialDynamics.ownerCulture[ownerCulture] || 0) + 1;
          }
          if (wastePickup) {
            categoryStats.crowdAndSocialDynamics.wastePickup[wastePickup] =
              (categoryStats.crowdAndSocialDynamics.wastePickup[wastePickup] || 0) + 1;
          }
          if (ownerFriendliness) {
            categoryStats.crowdAndSocialDynamics.ownerFriendliness[ownerFriendliness] =
              (categoryStats.crowdAndSocialDynamics.ownerFriendliness[ownerFriendliness] || 0) + 1;
          }
        }

        // Rules, Policies & Community
        if (dogParkReview.rulesPoliciesAndCommunity) {
          const { leashPolicy, vaccinationRequired, aggressiveDogPolicy, communityEnforcement } =
            dogParkReview.rulesPoliciesAndCommunity;
          if (leashPolicy) {
            categoryStats.rulesPoliciesAndCommunity.leashPolicy[leashPolicy] =
              (categoryStats.rulesPoliciesAndCommunity.leashPolicy[leashPolicy] || 0) + 1;
          }
          if (vaccinationRequired !== undefined)
            categoryStats.rulesPoliciesAndCommunity.vaccinationRequired[vaccinationRequired]++;
          if (aggressiveDogPolicy) {
            categoryStats.rulesPoliciesAndCommunity.aggressiveDogPolicy[aggressiveDogPolicy] =
              (categoryStats.rulesPoliciesAndCommunity.aggressiveDogPolicy[aggressiveDogPolicy] || 0) + 1;
          }
          if (communityEnforcement) {
            categoryStats.rulesPoliciesAndCommunity.communityEnforcement[communityEnforcement] =
              (categoryStats.rulesPoliciesAndCommunity.communityEnforcement[communityEnforcement] || 0) + 1;
          }
        }
      }
    });

    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      categoryStats,
    });
  } catch (err) {
    console.error("Error fetching dog park review stats:", err);
    res.status(500).json({ error: err.message });
  }
};

// New endpoint to get vet clinic specific review statistics
exports.getVetClinicReviewStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    // Get all vet clinic reviews for this place
    const reviews = await Review.find({
      placeId,
      vetClinicReview: { $exists: true, $ne: null },
    });

    if (reviews.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        categoryStats: {},
      });
    }

    // Calculate overall statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    // Calculate category-specific statistics
    const categoryStats = {
      clinicEnvironmentAndFacilities: {
        cleanliness: {},
        comfortLevel: {},
        facilitySize: {},
      },
      costAndTransparency: {
        routineCheckupCost: {},
        vaccinationCost: {},
        spayNeuterCost: {},
        dentalCleaningCost: {},
        emergencyVisitCost: {},
        feesExplainedUpfront: { true: 0, false: 0 },
        printedEstimatesAvailable: { true: 0, false: 0 },
        insuranceAccepted: { true: 0, false: 0 },
        paymentPlansOffered: { true: 0, false: 0 },
      },
      medicalStaffAndServices: {
        veterinarianAttitude: {},
        veterinarianCompetence: {},
        technicianNursePerformance: {},
        onSiteDiagnostics: {},
        surgeryOrthopedics: { true: 0, false: 0 },
        behavioralCounseling: { true: 0, false: 0 },
        nutritionConsultation: { true: 0, false: 0 },
      },
      schedulingAndCommunication: {
        responseTime: {},
        appointmentWaitTime: {},
        inClinicWaitingTime: {},
        followUpCommunication: {},
      },
      emergencyAndAfterHours: {
        openWeekends: { true: 0, false: 0 },
        openEvenings: { true: 0, false: 0 },
        onCallEmergencyNumber: { true: 0, false: 0 },
        connectedToEmergencyHospitals: { true: 0, false: 0 },
        clearHandoffsToSpecialists: { true: 0, false: 0 },
        emergencyTriageSpeed: {},
        crisisHandlingConfidence: {},
      },
      emergencyExperiences: {
        totalExperiences: 0,
        situationTypes: {},
        outcomes: {},
      },
      ownerInvolvement: {
        allowedDuringExams: {},
        allowedDuringProcedures: {},
        communicationDuringAnesthesia: {},
        communicationDuringSurgery: {},
        explainsProceduresWell: {},
        involvesOwnerInDecisions: {},
      },
      reputationAndCommunity: {
        onlineReputationConsistency: {},
        wordOfMouthReputation: {},
        communityInvolvement: {},
        hostsVaccineClinic: {},
        shelterPartnerships: {},
        communityEvents: {},
        educationalPrograms: {},
        socialMediaPresence: {},
      },
    };

    // Aggregate statistics from all reviews
    reviews.forEach((review) => {
      if (review.vetClinicReview) {
        const { vetClinicReview } = review;

        // 1. Clinic Environment & Facilities
        if (vetClinicReview.clinicEnvironmentAndFacilities) {
          const { cleanliness, comfortLevel, facilitySize } = vetClinicReview.clinicEnvironmentAndFacilities;
          if (cleanliness) {
            categoryStats.clinicEnvironmentAndFacilities.cleanliness[cleanliness] =
              (categoryStats.clinicEnvironmentAndFacilities.cleanliness[cleanliness] || 0) + 1;
          }
          if (comfortLevel) {
            categoryStats.clinicEnvironmentAndFacilities.comfortLevel[comfortLevel] =
              (categoryStats.clinicEnvironmentAndFacilities.comfortLevel[comfortLevel] || 0) + 1;
          }
          if (facilitySize) {
            categoryStats.clinicEnvironmentAndFacilities.facilitySize[facilitySize] =
              (categoryStats.clinicEnvironmentAndFacilities.facilitySize[facilitySize] || 0) + 1;
          }
        }

        // 2. Cost & Transparency
        if (vetClinicReview.costAndTransparency) {
          const {
            routineCheckupCost,
            vaccinationCost,
            spayNeuterCost,
            dentalCleaningCost,
            emergencyVisitCost,
            feesExplainedUpfront,
            printedEstimatesAvailable,
            insuranceAccepted,
            paymentPlansOffered,
          } = vetClinicReview.costAndTransparency;

          if (routineCheckupCost) {
            categoryStats.costAndTransparency.routineCheckupCost[routineCheckupCost] =
              (categoryStats.costAndTransparency.routineCheckupCost[routineCheckupCost] || 0) + 1;
          }
          if (vaccinationCost) {
            categoryStats.costAndTransparency.vaccinationCost[vaccinationCost] =
              (categoryStats.costAndTransparency.vaccinationCost[vaccinationCost] || 0) + 1;
          }
          if (spayNeuterCost) {
            categoryStats.costAndTransparency.spayNeuterCost[spayNeuterCost] =
              (categoryStats.costAndTransparency.spayNeuterCost[spayNeuterCost] || 0) + 1;
          }
          if (dentalCleaningCost) {
            categoryStats.costAndTransparency.dentalCleaningCost[dentalCleaningCost] =
              (categoryStats.costAndTransparency.dentalCleaningCost[dentalCleaningCost] || 0) + 1;
          }
          if (emergencyVisitCost) {
            categoryStats.costAndTransparency.emergencyVisitCost[emergencyVisitCost] =
              (categoryStats.costAndTransparency.emergencyVisitCost[emergencyVisitCost] || 0) + 1;
          }
          if (feesExplainedUpfront !== undefined) categoryStats.costAndTransparency.feesExplainedUpfront[feesExplainedUpfront]++;
          if (printedEstimatesAvailable !== undefined) categoryStats.costAndTransparency.printedEstimatesAvailable[printedEstimatesAvailable]++;
          if (insuranceAccepted !== undefined) categoryStats.costAndTransparency.insuranceAccepted[insuranceAccepted]++;
          if (paymentPlansOffered !== undefined) categoryStats.costAndTransparency.paymentPlansOffered[paymentPlansOffered]++;
        }

        // 3. Medical Staff & Services
        if (vetClinicReview.medicalStaffAndServices) {
          const {
            veterinarianAttitude,
            veterinarianCompetence,
            technicianNursePerformance,
            onSiteDiagnostics,
            surgeryOrthopedics,
            behavioralCounseling,
            nutritionConsultation,
          } = vetClinicReview.medicalStaffAndServices;

          if (veterinarianAttitude) {
            categoryStats.medicalStaffAndServices.veterinarianAttitude[veterinarianAttitude] =
              (categoryStats.medicalStaffAndServices.veterinarianAttitude[veterinarianAttitude] || 0) + 1;
          }
          if (veterinarianCompetence) {
            categoryStats.medicalStaffAndServices.veterinarianCompetence[veterinarianCompetence] =
              (categoryStats.medicalStaffAndServices.veterinarianCompetence[veterinarianCompetence] || 0) + 1;
          }
          if (technicianNursePerformance) {
            categoryStats.medicalStaffAndServices.technicianNursePerformance[technicianNursePerformance] =
              (categoryStats.medicalStaffAndServices.technicianNursePerformance[technicianNursePerformance] || 0) + 1;
          }
          if (onSiteDiagnostics && Array.isArray(onSiteDiagnostics)) {
            onSiteDiagnostics.forEach((diagnostic) => {
              categoryStats.medicalStaffAndServices.onSiteDiagnostics[diagnostic] =
                (categoryStats.medicalStaffAndServices.onSiteDiagnostics[diagnostic] || 0) + 1;
            });
          }
          if (surgeryOrthopedics !== undefined) categoryStats.medicalStaffAndServices.surgeryOrthopedics[surgeryOrthopedics]++;
          if (behavioralCounseling !== undefined) categoryStats.medicalStaffAndServices.behavioralCounseling[behavioralCounseling]++;
          if (nutritionConsultation !== undefined) categoryStats.medicalStaffAndServices.nutritionConsultation[nutritionConsultation]++;
        }

        // 4. Scheduling & Communication
        if (vetClinicReview.schedulingAndCommunication) {
          const { responseTime, appointmentWaitTime, inClinicWaitingTime, followUpCommunication } = vetClinicReview.schedulingAndCommunication;
          
          if (responseTime) {
            categoryStats.schedulingAndCommunication.responseTime[responseTime] =
              (categoryStats.schedulingAndCommunication.responseTime[responseTime] || 0) + 1;
          }
          if (appointmentWaitTime) {
            categoryStats.schedulingAndCommunication.appointmentWaitTime[appointmentWaitTime] =
              (categoryStats.schedulingAndCommunication.appointmentWaitTime[appointmentWaitTime] || 0) + 1;
          }
          if (inClinicWaitingTime) {
            categoryStats.schedulingAndCommunication.inClinicWaitingTime[inClinicWaitingTime] =
              (categoryStats.schedulingAndCommunication.inClinicWaitingTime[inClinicWaitingTime] || 0) + 1;
          }
          if (followUpCommunication) {
            categoryStats.schedulingAndCommunication.followUpCommunication[followUpCommunication] =
              (categoryStats.schedulingAndCommunication.followUpCommunication[followUpCommunication] || 0) + 1;
          }
        }

        // 5. Emergency & After-Hours Care
        if (vetClinicReview.emergencyAndAfterHours) {
          const {
            openWeekends,
            openEvenings,
            onCallEmergencyNumber,
            connectedToEmergencyHospitals,
            clearHandoffsToSpecialists,
            emergencyTriageSpeed,
            crisisHandlingConfidence,
          } = vetClinicReview.emergencyAndAfterHours;

          if (openWeekends !== undefined) categoryStats.emergencyAndAfterHours.openWeekends[openWeekends]++;
          if (openEvenings !== undefined) categoryStats.emergencyAndAfterHours.openEvenings[openEvenings]++;
          if (onCallEmergencyNumber !== undefined) categoryStats.emergencyAndAfterHours.onCallEmergencyNumber[onCallEmergencyNumber]++;
          if (connectedToEmergencyHospitals !== undefined) categoryStats.emergencyAndAfterHours.connectedToEmergencyHospitals[connectedToEmergencyHospitals]++;
          if (clearHandoffsToSpecialists !== undefined) categoryStats.emergencyAndAfterHours.clearHandoffsToSpecialists[clearHandoffsToSpecialists]++;
          
          if (emergencyTriageSpeed) {
            categoryStats.emergencyAndAfterHours.emergencyTriageSpeed[emergencyTriageSpeed] =
              (categoryStats.emergencyAndAfterHours.emergencyTriageSpeed[emergencyTriageSpeed] || 0) + 1;
          }
          if (crisisHandlingConfidence) {
            categoryStats.emergencyAndAfterHours.crisisHandlingConfidence[crisisHandlingConfidence] =
              (categoryStats.emergencyAndAfterHours.crisisHandlingConfidence[crisisHandlingConfidence] || 0) + 1;
          }
        }

        // Emergency Experiences
        if (vetClinicReview.emergencyExperiences && Array.isArray(vetClinicReview.emergencyExperiences)) {
          categoryStats.emergencyExperiences.totalExperiences += vetClinicReview.emergencyExperiences.length;
          
          vetClinicReview.emergencyExperiences.forEach((experience) => {
            if (experience.situationType) {
              categoryStats.emergencyExperiences.situationTypes[experience.situationType] =
                (categoryStats.emergencyExperiences.situationTypes[experience.situationType] || 0) + 1;
            }
            if (experience.outcome) {
              categoryStats.emergencyExperiences.outcomes[experience.outcome] =
                (categoryStats.emergencyExperiences.outcomes[experience.outcome] || 0) + 1;
            }
          });
        }

        // Owner Involvement
        if (vetClinicReview.ownerInvolvement) {
          const { communicationDuringAnesthesia, communicationDuringSurgery } = vetClinicReview.ownerInvolvement;
          const communicationValues = ["excellent", "good", "fair", "poor"];
          
          if (communicationDuringAnesthesia && !communicationValues.includes(communicationDuringAnesthesia)) {
            errors.push("Invalid communicationDuringAnesthesia value");
          }
          if (communicationDuringSurgery && !communicationValues.includes(communicationDuringSurgery)) {
            errors.push("Invalid communicationDuringSurgery value");
          }
        }

        // Reputation & Community
        if (vetClinicReview.reputationAndCommunity) {
          const { onlineReputationConsistency, wordOfMouthReputation, communityInvolvement, socialMediaPresence } = vetClinicReview.reputationAndCommunity;
          const reputationValues = ["excellent", "good", "fair", "poor"];
          
          if (onlineReputationConsistency && !reputationValues.includes(onlineReputationConsistency)) {
            errors.push("Invalid onlineReputationConsistency value");
          }
          if (wordOfMouthReputation && !reputationValues.includes(wordOfMouthReputation)) {
            errors.push("Invalid wordOfMouthReputation value");
          }
          if (communityInvolvement && !["high", "moderate", "low", "none"].includes(communityInvolvement)) {
            errors.push("Invalid communityInvolvement value");
          }
          if (socialMediaPresence && !["excellent", "good", "fair", "poor", "none"].includes(socialMediaPresence)) {
            errors.push("Invalid socialMediaPresence value");
          }
        }
      }
    });

    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      categoryStats,
    });
  } catch (err) {
    console.error("Error fetching vet clinic review stats:", err);
    res.status(500).json({ error: err.message });
  }
};

// Upload review images
exports.uploadReviewImages = async (req, res) => {
  try {
    console.log("Review images upload request received");
    console.log("Headers:", req.headers);
    console.log("Files:", req.files);
    console.log("Request body:", req.body);
    console.log("Request URL:", req.originalUrl);

    if (!req.files || req.files.length === 0) {
      console.log("No files received in request");
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Check if AWS S3 is configured
    const { hasAWSConfig } = require("../utils/upload");
    console.log("AWS S3 configured:", hasAWSConfig);

    // Generate image URLs
    const imageUrls = req.files.map((file) => {
      console.log("Processing file:", {
        originalname: file.originalname,
        filename: file.filename,
        location: file.location,
        key: file.key,
        hasLocation: !!file.location,
        size: file.size,
      });

      if (hasAWSConfig) {
        // AWS S3 URL - use location from custom storage
        if (file.location) {
          return file.location;
        } else if (file.key) {
          // Fallback: construct S3 URL from key
          return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`;
        } else {
          console.error("S3 file location and key missing for file:", file.originalname);
          throw new Error(`S3 upload failed for file: ${file.originalname}`);
        }
      } else {
        // Local storage URL
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        return `${baseUrl}/uploads/reviews/${file.filename}`;
      }
    });

    console.log("Generated image URLs:", imageUrls);

    res.json({
      message: "Images uploaded successfully",
      imageUrls: imageUrls,
      uploadedFiles: req.files.map((f) => ({
        originalName: f.originalname,
        filename: f.filename || f.key,
        size: f.size,
        location: f.location,
        key: f.key,
        bucket: f.bucket,
      })),
    });
  } catch (error) {
    console.error("Error uploading review images:", error);
    console.error("Error stack:", error.stack);

    // Handle specific multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size too large. Maximum 5MB per image." });
    } else if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files. Maximum 5 images allowed." });
    } else if (error.message && error.message.includes("Only JPEG, PNG, GIF, and WebP")) {
      return res.status(400).json({ error: error.message });
    } else if (error.message && error.message.includes("S3 upload failed")) {
      return res.status(500).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to upload images",
      details: error.message,
      code: error.code,
    });
  }
};
