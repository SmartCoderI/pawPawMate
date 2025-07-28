const Review = require("../models/Review");
const Place = require("../models/Place");
const Card = require("../models/Card");
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
    const { foodBrandVariety, toySelection, suppliesAvailability, productFreshness } =
      petStoreReview.productSelectionAndQuality;
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
    const { petKnowledge, productRecommendations, customerService, helpfulness } =
      petStoreReview.staffKnowledgeAndService;
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
    const { applicationProcess, processingTime, adoptionFees, returnPolicy } =
      animalShelterReview.adoptionProcessAndSupport;

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
    const { staffKnowledge, animalHandling, customerService, compassionLevel } =
      animalShelterReview.staffAndVolunteerQuality;
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

// Helper function to validate vet clinic review data - ALIGNED WITH NEW BACKEND STRUCTURE
const validateVetClinicReview = (vetClinicReview) => {
  if (!vetClinicReview) return true; // Optional field

  const errors = [];

  // 1. Validate accessAndLocation
  if (vetClinicReview.accessAndLocation) {
    const { parkingDifficulty, publicTransportAccess } = vetClinicReview.accessAndLocation;
    if (parkingDifficulty && !["easy", "moderate", "difficult"].includes(parkingDifficulty)) {
      errors.push("Invalid parkingDifficulty value");
    }
    // publicTransportAccess is boolean, no enum validation needed
  }

  // 2. Validate hoursOfOperation
  if (vetClinicReview.hoursOfOperation) {
    // is24Hours is boolean, specificHours is string - no enum validation needed
  }

  // 3. Validate clinicEnvironmentAndFacilities
  if (vetClinicReview.clinicEnvironmentAndFacilities) {
    const { cleanliness, facilitySize } = vetClinicReview.clinicEnvironmentAndFacilities;
    if (cleanliness && !["excellent", "good", "fair", "poor"].includes(cleanliness)) {
      errors.push("Invalid cleanliness value");
    }
    if (facilitySize && !["small", "medium", "large"].includes(facilitySize)) {
      errors.push("Invalid facilitySize value");
    }
  }

  // 4. Validate costAndTransparency
  if (vetClinicReview.costAndTransparency) {
    const { cost } = vetClinicReview.costAndTransparency;
    if (cost && !["low", "moderate", "high", "very_high"].includes(cost)) {
      errors.push("Invalid cost value");
    }
    // feesExplainedUpfront and insuranceAccepted are boolean - no enum validation needed
  }

  // 5. Validate servicesAndSpecializations
  if (vetClinicReview.servicesAndSpecializations) {
    const { onSiteDiagnostics, surgeryCapabilities, specializations } = vetClinicReview.servicesAndSpecializations;
    
    if (onSiteDiagnostics && Array.isArray(onSiteDiagnostics)) {
      const validDiagnostics = ["xray", "ultrasound", "bloodwork", "ecg", "none"];
      const invalidDiagnostics = onSiteDiagnostics.filter((d) => !validDiagnostics.includes(d));
      if (invalidDiagnostics.length > 0) {
        errors.push("Invalid onSiteDiagnostics values: " + invalidDiagnostics.join(", "));
      }
    }
    
    if (surgeryCapabilities && Array.isArray(surgeryCapabilities)) {
      const validSurgeries = ["routine_spay_neuter", "orthopedic", "emergency", "dental", "none"];
      const invalidSurgeries = surgeryCapabilities.filter((s) => !validSurgeries.includes(s));
      if (invalidSurgeries.length > 0) {
        errors.push("Invalid surgeryCapabilities values: " + invalidSurgeries.join(", "));
      }
    }
    
    if (specializations && Array.isArray(specializations)) {
      const validSpecializations = ["cardiology", "dermatology", "oncology", "behavior", "exotic_animals", "none"];
      const invalidSpecializations = specializations.filter((s) => !validSpecializations.includes(s));
      if (invalidSpecializations.length > 0) {
        errors.push("Invalid specializations values: " + invalidSpecializations.join(", "));
      }
    }
  }

  // 6. Validate emergencyAndAfterHours
  if (vetClinicReview.emergencyAndAfterHours) {
    const { emergencyTriageSpeed } = vetClinicReview.emergencyAndAfterHours;
    
    if (
      emergencyTriageSpeed &&
      !["immediate", "within_30_min", "within_1_hour", "over_1_hour"].includes(emergencyTriageSpeed)
    ) {
      errors.push("Invalid emergencyTriageSpeed value");
    }
    // openWeekends, openEvenings, onCallEmergencyNumber are boolean - no enum validation needed
  }

  // 7. Validate staffAndServiceQuality
  if (vetClinicReview.staffAndServiceQuality) {
    const { staffFriendliness, veterinarianExperience } = vetClinicReview.staffAndServiceQuality;
    
    if (staffFriendliness && !["excellent", "good", "fair", "poor"].includes(staffFriendliness)) {
      errors.push("Invalid staffFriendliness value");
    }
    if (veterinarianExperience && !["novice", "experienced", "expert"].includes(veterinarianExperience)) {
      errors.push("Invalid veterinarianExperience value");
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

// Helper function to clean pet store review data (remove empty strings to avoid enum validation errors)
const cleanPetStoreReview = (petStoreReview) => {
  if (!petStoreReview) return petStoreReview;

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

  return cleanObject(petStoreReview);
};

// Helper function to clean animal shelter review data (remove empty strings to avoid enum validation errors)
const cleanAnimalShelterReview = (animalShelterReview) => {
  if (!animalShelterReview) return animalShelterReview;

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

  return cleanObject(animalShelterReview);
};

exports.addReview = async (req, res) => {
  try {
    console.log("Review creation request received:", req.body);
    const {
      placeId,
      rating,
      comment,
      tags,
      dogParkReview,
      vetClinicReview,
      petStoreReview,
      animalShelterReview,
      userId,
      placeData,
      photos,
    } = req.body;

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

    // Clean and validate pet store review data if provided
    let cleanedPetStoreReview = null;
    if (petStoreReview) {
      // Clean the pet store review data (remove empty strings to avoid enum validation errors)
      cleanedPetStoreReview = cleanPetStoreReview(petStoreReview);
      console.log("Original petStoreReview:", petStoreReview);
      console.log("Cleaned petStoreReview:", cleanedPetStoreReview);

      // Validate the cleaned data
      if (cleanedPetStoreReview && Object.keys(cleanedPetStoreReview).length > 0) {
        const validationResult = validatePetStoreReview(cleanedPetStoreReview);
        if (validationResult !== true) {
          return res.status(400).json({
            error: "Invalid pet store review data",
            details: validationResult,
          });
        }
      }
    }

    // Clean and validate animal shelter review data if provided
    let cleanedAnimalShelterReview = null;
    if (animalShelterReview) {
      // Clean the animal shelter review data (remove empty strings to avoid enum validation errors)
      cleanedAnimalShelterReview = cleanAnimalShelterReview(animalShelterReview);

      // Validate the cleaned data
      if (cleanedAnimalShelterReview && Object.keys(cleanedAnimalShelterReview).length > 0) {
        const validationResult = validateAnimalShelterReview(cleanedAnimalShelterReview);
        if (validationResult !== true) {
          return res.status(400).json({
            error: "Invalid animal shelter review data",
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
          addedBy: null, // Don't set addedBy for auto-created places
          creationSource: "review_auto_created",
        });

        console.log("New place created successfully:", newPlace);
        finalPlaceId = newPlace._id;
      }
    }

    // Log the review data being saved
    const reviewData = {
      userId: userId, // Use MongoDB user ID from request body
      placeId: finalPlaceId,
      rating,
      comment,
      tags,
      photos: photos || [], // Include photos array
      dogParkReview: cleanedDogParkReview, // Use cleaned data
      vetClinicReview: cleanedVetClinicReview, // Use cleaned vet clinic data
      petStoreReview: cleanedPetStoreReview, // Use cleaned pet store data
      animalShelterReview: cleanedAnimalShelterReview, // Use cleaned animal shelter data
    };

    // Create the review with the correct MongoDB user ID
    const review = await Review.create(reviewData);

    // Populate user information for response
    await review.populate("userId", "name email profileImage");

    console.log("Review created successfully:", review);

    // REWARD CARD GENERATION LOGIC
    try {
      // Step 1: Content Validity Check (Anti-spam)
      const isValidContent = (comment && comment.length >= 10) || (tags && tags.length > 0) || rating;

      if (isValidContent) {
        console.log("Review meets content validity requirements");

        // Step 2: Reward Eligibility Check
        let shouldGenerateCard = false;
        let contributionType = "";

        // Check if this is the user's first review ever
        const userReviewCount = await Review.countDocuments({ userId: userId });
        console.log(`User review count: ${userReviewCount}`);

        // Check existing cards to prevent duplicates
        const existingCards = await Card.find({ earnedBy: userId });
        
        // First review reward (welcome card)
        if (userReviewCount === 1) {
          const hasFirstReviewCard = existingCards.some((card) => card.contributionType === "first_review");
          if (!hasFirstReviewCard) {
            shouldGenerateCard = true;
            contributionType = "first_review";
            console.log("User earned welcome card for first review");
          } else {
            console.log("User already has first review card");
          }
        }
        // Every 3 reviews milestone (3rd, 6th, 9th, etc.)
        else if (userReviewCount % 3 === 0) {
          // User just reached a multiple of 3 reviews (3, 6, 9, 12, etc.)
          const cardNumber = userReviewCount / 3; // 1st milestone card, 2nd milestone card, etc.
          
          // Check if they already have a card for this milestone
          const hasCardForThisMilestone = existingCards.some((card) => 
            card.contributionType === `milestone_${userReviewCount}_reviews`
          );
          
          if (!hasCardForThisMilestone) {
            shouldGenerateCard = true;
            contributionType = `milestone_${userReviewCount}_reviews`;
            console.log(`User earned milestone card #${cardNumber} for reaching ${userReviewCount} reviews`);
          } else {
            console.log(`User already has card for ${userReviewCount} reviews milestone`);
          }
        }

        // Generate the card if eligible
        if (shouldGenerateCard) {
          // Get place name for the card
          const place = await Place.findById(finalPlaceId);
          const locationName = place ? place.name : "Unknown Location";

          await generateRewardCard(userId, review._id, finalPlaceId, locationName, contributionType);

          console.log(`✅ Reward card generated for user ${userId} - ${contributionType}`);
        } else {
          console.log(
            `No card generated - Review count: ${userReviewCount}, Not first review or multiple of 3, or card already exists`
          );
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
    // First, get reviews without population to see if they exist
    const reviewsRaw = await Review.find({ placeId });

    if (reviewsRaw.length === 0) {
      return res.json([]);
    }

    // Then populate user data with error handling
    const reviews = await Review.find({ placeId })
      .populate({
        path: "userId",
        select: "name email profileImage",
        // Handle cases where user might not exist
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    // Filter out reviews with invalid user references
    const validReviews = reviews.filter((review) => {
      if (!review.userId) {
        console.warn(`Review ${review._id} has invalid userId reference`);
        // Keep the review but with null user data
        review.userId = null;
        return true;
      }
      return true;
    });

    res.json(validReviews);
  } catch (err) {
    console.error("🔍 BACKEND: Error fetching reviews:", err);
    console.error("🔍 BACKEND: Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

// Get all reviews by a specific user
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId }).populate("userId", "name email profileImage").sort({ createdAt: -1 });

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

    // Calculate category-specific statistics - UPDATED FOR NEW 7-CATEGORY STRUCTURE
    const categoryStats = {
      // 1. Access & Location
      accessAndLocation: {
        parkingDifficulty: {},
        publicTransportAccess: { true: 0, false: 0 },
      },
      // 2. Hours of Operation
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        specificHours: {},
      },
      // 3. Clinic Environment & Facilities
      clinicEnvironmentAndFacilities: {
        cleanliness: {},
        facilitySize: {},
      },
      // 4. Cost & Transparency
      costAndTransparency: {
        cost: {},
        feesExplainedUpfront: { true: 0, false: 0 },
        insuranceAccepted: { true: 0, false: 0 },
      },
      // 5. Services & Specializations
      servicesAndSpecializations: {
        onSiteDiagnostics: {},
        surgeryCapabilities: {},
        specializations: {},
      },
      // 6. Emergency & After-Hours Care
      emergencyAndAfterHours: {
        openWeekends: { true: 0, false: 0 },
        openEvenings: { true: 0, false: 0 },
        onCallEmergencyNumber: { true: 0, false: 0 },
        emergencyTriageSpeed: {},
      },
      // 7. Staff & Service Quality
      staffAndServiceQuality: {
        staffFriendliness: {},
        veterinarianExperience: {},
      },
    };

    // Aggregate statistics from all reviews - UPDATED FOR NEW 7-CATEGORY STRUCTURE
    reviews.forEach((review) => {
      if (review.vetClinicReview) {
        const { vetClinicReview } = review;

        // 1. Access & Location
        if (vetClinicReview.accessAndLocation) {
          const { parkingDifficulty, publicTransportAccess } = vetClinicReview.accessAndLocation;
          if (parkingDifficulty) {
            categoryStats.accessAndLocation.parkingDifficulty[parkingDifficulty] =
              (categoryStats.accessAndLocation.parkingDifficulty[parkingDifficulty] || 0) + 1;
          }
          if (publicTransportAccess !== undefined) {
            categoryStats.accessAndLocation.publicTransportAccess[publicTransportAccess]++;
          }
        }

        // 2. Hours of Operation
        if (vetClinicReview.hoursOfOperation) {
          const { is24Hours, specificHours } = vetClinicReview.hoursOfOperation;
          if (is24Hours !== undefined) {
            categoryStats.hoursOfOperation.is24Hours[is24Hours]++;
          }
          if (specificHours) {
            categoryStats.hoursOfOperation.specificHours[specificHours] =
              (categoryStats.hoursOfOperation.specificHours[specificHours] || 0) + 1;
          }
        }

        // 3. Clinic Environment & Facilities
        if (vetClinicReview.clinicEnvironmentAndFacilities) {
          const { cleanliness, facilitySize } = vetClinicReview.clinicEnvironmentAndFacilities;
          if (cleanliness) {
            categoryStats.clinicEnvironmentAndFacilities.cleanliness[cleanliness] =
              (categoryStats.clinicEnvironmentAndFacilities.cleanliness[cleanliness] || 0) + 1;
          }
          if (facilitySize) {
            categoryStats.clinicEnvironmentAndFacilities.facilitySize[facilitySize] =
              (categoryStats.clinicEnvironmentAndFacilities.facilitySize[facilitySize] || 0) + 1;
          }
        }

        // 2. Cost & Transparency
        if (vetClinicReview.costAndTransparency) {
          const { cost, feesExplainedUpfront, insuranceAccepted } = vetClinicReview.costAndTransparency;

          if (cost) {
            categoryStats.costAndTransparency.cost[cost] =
              (categoryStats.costAndTransparency.cost[cost] || 0) + 1;
          }
          if (feesExplainedUpfront !== undefined) {
            categoryStats.costAndTransparency.feesExplainedUpfront[feesExplainedUpfront]++;
          }
          if (insuranceAccepted !== undefined) {
            categoryStats.costAndTransparency.insuranceAccepted[insuranceAccepted]++;
          }
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
          if (surgeryOrthopedics !== undefined)
            categoryStats.medicalStaffAndServices.surgeryOrthopedics[surgeryOrthopedics]++;
          if (behavioralCounseling !== undefined)
            categoryStats.medicalStaffAndServices.behavioralCounseling[behavioralCounseling]++;
          if (nutritionConsultation !== undefined)
            categoryStats.medicalStaffAndServices.nutritionConsultation[nutritionConsultation]++;
        }

        // 5. Services & Specializations
        if (vetClinicReview.servicesAndSpecializations) {
          const { onSiteDiagnostics, surgeryCapabilities, specializations } = vetClinicReview.servicesAndSpecializations;
          
          if (onSiteDiagnostics && Array.isArray(onSiteDiagnostics)) {
            onSiteDiagnostics.forEach((diagnostic) => {
              categoryStats.servicesAndSpecializations.onSiteDiagnostics[diagnostic] =
                (categoryStats.servicesAndSpecializations.onSiteDiagnostics[diagnostic] || 0) + 1;
            });
          }
          if (surgeryCapabilities && Array.isArray(surgeryCapabilities)) {
            surgeryCapabilities.forEach((surgery) => {
              categoryStats.servicesAndSpecializations.surgeryCapabilities[surgery] =
                (categoryStats.servicesAndSpecializations.surgeryCapabilities[surgery] || 0) + 1;
            });
          }
          if (specializations && Array.isArray(specializations)) {
            specializations.forEach((specialization) => {
              categoryStats.servicesAndSpecializations.specializations[specialization] =
                (categoryStats.servicesAndSpecializations.specializations[specialization] || 0) + 1;
            });
          }
        }

        // 6. Emergency & After-Hours Care
        if (vetClinicReview.emergencyAndAfterHours) {
          const { openWeekends, openEvenings, onCallEmergencyNumber, emergencyTriageSpeed } = 
            vetClinicReview.emergencyAndAfterHours;

          if (openWeekends !== undefined) {
            categoryStats.emergencyAndAfterHours.openWeekends[openWeekends]++;
          }
          if (openEvenings !== undefined) {
            categoryStats.emergencyAndAfterHours.openEvenings[openEvenings]++;
          }
          if (onCallEmergencyNumber !== undefined) {
            categoryStats.emergencyAndAfterHours.onCallEmergencyNumber[onCallEmergencyNumber]++;
          }
          if (emergencyTriageSpeed) {
            categoryStats.emergencyAndAfterHours.emergencyTriageSpeed[emergencyTriageSpeed] =
              (categoryStats.emergencyAndAfterHours.emergencyTriageSpeed[emergencyTriageSpeed] || 0) + 1;
          }
        }

        // 7. Staff & Service Quality
        if (vetClinicReview.staffAndServiceQuality) {
          const { staffFriendliness, veterinarianExperience } = vetClinicReview.staffAndServiceQuality;
          
          if (staffFriendliness) {
            categoryStats.staffAndServiceQuality.staffFriendliness[staffFriendliness] =
              (categoryStats.staffAndServiceQuality.staffFriendliness[staffFriendliness] || 0) + 1;
          }
          if (veterinarianExperience) {
            categoryStats.staffAndServiceQuality.veterinarianExperience[veterinarianExperience] =
              (categoryStats.staffAndServiceQuality.veterinarianExperience[veterinarianExperience] || 0) + 1;
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

// New endpoint to get pet store specific review statistics
exports.getPetStoreReviewStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    // Get all pet store reviews for this place
    const reviews = await Review.find({
      placeId,
      petStoreReview: { $exists: true, $ne: null },
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
        specificHours: {},
      },
      servicesAndConveniences: {
        grooming: { true: 0, false: 0 },
        veterinaryServices: { true: 0, false: 0 },
        petTraining: { true: 0, false: 0 },
        deliveryService: { true: 0, false: 0 },
        onlineOrdering: { true: 0, false: 0 },
        curbsidePickup: { true: 0, false: 0 },
        returnPolicy: {},
      },
      productSelectionAndQuality: {
        foodBrandVariety: {},
        toySelection: {},
        suppliesAvailability: {},
        productFreshness: {},
        organicNaturalOptions: { true: 0, false: 0 },
        prescriptionDietAvailable: { true: 0, false: 0 },
      },
      pricingAndValue: {
        overallPricing: {},
        loyaltyProgram: { true: 0, false: 0 },
        frequentSales: { true: 0, false: 0 },
        priceMatching: { true: 0, false: 0 },
        bulkDiscounts: { true: 0, false: 0 },
        seniorDiscounts: { true: 0, false: 0 },
      },
      staffKnowledgeAndService: {
        petKnowledge: {},
        productRecommendations: {},
        customerService: {},
        helpfulness: {},
        multilingual: { true: 0, false: 0 },
        trainingCertified: { true: 0, false: 0 },
      },
    };

    // Aggregate statistics from all reviews
    reviews.forEach((review) => {
      if (review.petStoreReview) {
        const { petStoreReview } = review;

        // 1. Access & Location
        if (petStoreReview.accessAndLocation) {
          const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = petStoreReview.accessAndLocation;
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

        // 2. Hours of Operation
        if (petStoreReview.hoursOfOperation) {
          const { is24Hours, dawnToDusk, specificHours } = petStoreReview.hoursOfOperation;
          if (is24Hours !== undefined) categoryStats.hoursOfOperation.is24Hours[is24Hours]++;
          if (dawnToDusk !== undefined) categoryStats.hoursOfOperation.dawnToDusk[dawnToDusk]++;
          if (specificHours) {
            categoryStats.hoursOfOperation.specificHours[specificHours] =
              (categoryStats.hoursOfOperation.specificHours[specificHours] || 0) + 1;
          }
        }

        // 3. Services & Conveniences
        if (petStoreReview.servicesAndConveniences) {
          const {
            grooming,
            veterinaryServices,
            petTraining,
            deliveryService,
            onlineOrdering,
            curbsidePickup,
            returnPolicy,
          } = petStoreReview.servicesAndConveniences;
          if (grooming !== undefined) categoryStats.servicesAndConveniences.grooming[grooming]++;
          if (veterinaryServices !== undefined)
            categoryStats.servicesAndConveniences.veterinaryServices[veterinaryServices]++;
          if (petTraining !== undefined) categoryStats.servicesAndConveniences.petTraining[petTraining]++;
          if (deliveryService !== undefined) categoryStats.servicesAndConveniences.deliveryService[deliveryService]++;
          if (onlineOrdering !== undefined) categoryStats.servicesAndConveniences.onlineOrdering[onlineOrdering]++;
          if (curbsidePickup !== undefined) categoryStats.servicesAndConveniences.curbsidePickup[curbsidePickup]++;
          if (returnPolicy) {
            categoryStats.servicesAndConveniences.returnPolicy[returnPolicy] =
              (categoryStats.servicesAndConveniences.returnPolicy[returnPolicy] || 0) + 1;
          }
        }

        // 4. Product Selection & Quality
        if (petStoreReview.productSelectionAndQuality) {
          const {
            foodBrandVariety,
            toySelection,
            suppliesAvailability,
            productFreshness,
            organicNaturalOptions,
            prescriptionDietAvailable,
          } = petStoreReview.productSelectionAndQuality;
          if (foodBrandVariety) {
            categoryStats.productSelectionAndQuality.foodBrandVariety[foodBrandVariety] =
              (categoryStats.productSelectionAndQuality.foodBrandVariety[foodBrandVariety] || 0) + 1;
          }
          if (toySelection) {
            categoryStats.productSelectionAndQuality.toySelection[toySelection] =
              (categoryStats.productSelectionAndQuality.toySelection[toySelection] || 0) + 1;
          }
          if (suppliesAvailability) {
            categoryStats.productSelectionAndQuality.suppliesAvailability[suppliesAvailability] =
              (categoryStats.productSelectionAndQuality.suppliesAvailability[suppliesAvailability] || 0) + 1;
          }
          if (productFreshness) {
            categoryStats.productSelectionAndQuality.productFreshness[productFreshness] =
              (categoryStats.productSelectionAndQuality.productFreshness[productFreshness] || 0) + 1;
          }
          if (organicNaturalOptions !== undefined)
            categoryStats.productSelectionAndQuality.organicNaturalOptions[organicNaturalOptions]++;
          if (prescriptionDietAvailable !== undefined)
            categoryStats.productSelectionAndQuality.prescriptionDietAvailable[prescriptionDietAvailable]++;
        }

        // 5. Pricing & Value
        if (petStoreReview.pricingAndValue) {
          const { overallPricing, loyaltyProgram, frequentSales, priceMatching, bulkDiscounts, seniorDiscounts } =
            petStoreReview.pricingAndValue;
          if (overallPricing) {
            categoryStats.pricingAndValue.overallPricing[overallPricing] =
              (categoryStats.pricingAndValue.overallPricing[overallPricing] || 0) + 1;
          }
          if (loyaltyProgram !== undefined) categoryStats.pricingAndValue.loyaltyProgram[loyaltyProgram]++;
          if (frequentSales !== undefined) categoryStats.pricingAndValue.frequentSales[frequentSales]++;
          if (priceMatching !== undefined) categoryStats.pricingAndValue.priceMatching[priceMatching]++;
          if (bulkDiscounts !== undefined) categoryStats.pricingAndValue.bulkDiscounts[bulkDiscounts]++;
          if (seniorDiscounts !== undefined) categoryStats.pricingAndValue.seniorDiscounts[seniorDiscounts]++;
        }

        // 6. Staff Knowledge & Service
        if (petStoreReview.staffKnowledgeAndService) {
          const {
            petKnowledge,
            productRecommendations,
            customerService,
            helpfulness,
            multilingual,
            trainingCertified,
          } = petStoreReview.staffKnowledgeAndService;
          if (petKnowledge) {
            categoryStats.staffKnowledgeAndService.petKnowledge[petKnowledge] =
              (categoryStats.staffKnowledgeAndService.petKnowledge[petKnowledge] || 0) + 1;
          }
          if (productRecommendations) {
            categoryStats.staffKnowledgeAndService.productRecommendations[productRecommendations] =
              (categoryStats.staffKnowledgeAndService.productRecommendations[productRecommendations] || 0) + 1;
          }
          if (customerService) {
            categoryStats.staffKnowledgeAndService.customerService[customerService] =
              (categoryStats.staffKnowledgeAndService.customerService[customerService] || 0) + 1;
          }
          if (helpfulness) {
            categoryStats.staffKnowledgeAndService.helpfulness[helpfulness] =
              (categoryStats.staffKnowledgeAndService.helpfulness[helpfulness] || 0) + 1;
          }
          if (multilingual !== undefined) categoryStats.staffKnowledgeAndService.multilingual[multilingual]++;
          if (trainingCertified !== undefined)
            categoryStats.staffKnowledgeAndService.trainingCertified[trainingCertified]++;
        }
      }
    });

    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      categoryStats,
    });
  } catch (err) {
    console.error("Error fetching pet store review stats:", err);
    res.status(500).json({ error: err.message });
  }
};

// New endpoint to get animal shelter specific review statistics
exports.getAnimalShelterReviewStats = async (req, res) => {
  try {
    const { placeId } = req.params;

    // Get all animal shelter reviews for this place
    const reviews = await Review.find({
      placeId,
      animalShelterReview: { $exists: true, $ne: null },
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
        specificHours: {},
      },
      animalTypeSelection: {
        availableAnimalTypes: {},
        breedVariety: {},
        ageRange: {},
      },
      animalCareAndWelfare: {
        animalHealth: {},
        livingConditions: {},
        exercisePrograms: { true: 0, false: 0 },
        medicalCare: {},
        behavioralAssessment: { true: 0, false: 0 },
        specialNeedsCare: { true: 0, false: 0 },
      },
      adoptionProcessAndSupport: {
        applicationProcess: {},
        processingTime: {},
        homeVisitRequired: { true: 0, false: 0 },
        adoptionFees: {},
        postAdoptionSupport: { true: 0, false: 0 },
        returnPolicy: {},
      },
      staffAndVolunteerQuality: {
        staffKnowledge: {},
        animalHandling: {},
        customerService: {},
        volunteerProgram: { true: 0, false: 0 },
        staffTraining: { true: 0, false: 0 },
        compassionLevel: {},
      },
    };

    // Aggregate statistics from all reviews
    reviews.forEach((review) => {
      if (review.animalShelterReview) {
        const { animalShelterReview } = review;

        // 1. Access & Location
        if (animalShelterReview.accessAndLocation) {
          const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = animalShelterReview.accessAndLocation;
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

        // 2. Hours of Operation
        if (animalShelterReview.hoursOfOperation) {
          const { is24Hours, dawnToDusk, specificHours } = animalShelterReview.hoursOfOperation;
          if (is24Hours !== undefined) categoryStats.hoursOfOperation.is24Hours[is24Hours]++;
          if (dawnToDusk !== undefined) categoryStats.hoursOfOperation.dawnToDusk[dawnToDusk]++;
          if (specificHours) {
            categoryStats.hoursOfOperation.specificHours[specificHours] =
              (categoryStats.hoursOfOperation.specificHours[specificHours] || 0) + 1;
          }
        }

        // 3. Animal Type Selection
        if (animalShelterReview.animalTypeSelection) {
          const { availableAnimalTypes, breedVariety, ageRange } = animalShelterReview.animalTypeSelection;
          if (availableAnimalTypes && Array.isArray(availableAnimalTypes)) {
            availableAnimalTypes.forEach((type) => {
              categoryStats.animalTypeSelection.availableAnimalTypes[type] =
                (categoryStats.animalTypeSelection.availableAnimalTypes[type] || 0) + 1;
            });
          }
          if (breedVariety) {
            categoryStats.animalTypeSelection.breedVariety[breedVariety] =
              (categoryStats.animalTypeSelection.breedVariety[breedVariety] || 0) + 1;
          }
          if (ageRange && Array.isArray(ageRange)) {
            ageRange.forEach((age) => {
              categoryStats.animalTypeSelection.ageRange[age] =
                (categoryStats.animalTypeSelection.ageRange[age] || 0) + 1;
            });
          }
        }

        // 4. Animal Care & Welfare
        if (animalShelterReview.animalCareAndWelfare) {
          const {
            animalHealth,
            livingConditions,
            exercisePrograms,
            medicalCare,
            behavioralAssessment,
            specialNeedsCare,
          } = animalShelterReview.animalCareAndWelfare;
          if (animalHealth) {
            categoryStats.animalCareAndWelfare.animalHealth[animalHealth] =
              (categoryStats.animalCareAndWelfare.animalHealth[animalHealth] || 0) + 1;
          }
          if (livingConditions) {
            categoryStats.animalCareAndWelfare.livingConditions[livingConditions] =
              (categoryStats.animalCareAndWelfare.livingConditions[livingConditions] || 0) + 1;
          }
          if (exercisePrograms !== undefined) categoryStats.animalCareAndWelfare.exercisePrograms[exercisePrograms]++;
          if (medicalCare) {
            categoryStats.animalCareAndWelfare.medicalCare[medicalCare] =
              (categoryStats.animalCareAndWelfare.medicalCare[medicalCare] || 0) + 1;
          }
          if (behavioralAssessment !== undefined)
            categoryStats.animalCareAndWelfare.behavioralAssessment[behavioralAssessment]++;
          if (specialNeedsCare !== undefined) categoryStats.animalCareAndWelfare.specialNeedsCare[specialNeedsCare]++;
        }

        // 5. Adoption Process & Support
        if (animalShelterReview.adoptionProcessAndSupport) {
          const {
            applicationProcess,
            processingTime,
            homeVisitRequired,
            adoptionFees,
            postAdoptionSupport,
            returnPolicy,
          } = animalShelterReview.adoptionProcessAndSupport;
          if (applicationProcess) {
            categoryStats.adoptionProcessAndSupport.applicationProcess[applicationProcess] =
              (categoryStats.adoptionProcessAndSupport.applicationProcess[applicationProcess] || 0) + 1;
          }
          if (processingTime) {
            categoryStats.adoptionProcessAndSupport.processingTime[processingTime] =
              (categoryStats.adoptionProcessAndSupport.processingTime[processingTime] || 0) + 1;
          }
          if (homeVisitRequired !== undefined)
            categoryStats.adoptionProcessAndSupport.homeVisitRequired[homeVisitRequired]++;
          if (adoptionFees) {
            categoryStats.adoptionProcessAndSupport.adoptionFees[adoptionFees] =
              (categoryStats.adoptionProcessAndSupport.adoptionFees[adoptionFees] || 0) + 1;
          }
          if (postAdoptionSupport !== undefined)
            categoryStats.adoptionProcessAndSupport.postAdoptionSupport[postAdoptionSupport]++;
          if (returnPolicy) {
            categoryStats.adoptionProcessAndSupport.returnPolicy[returnPolicy] =
              (categoryStats.adoptionProcessAndSupport.returnPolicy[returnPolicy] || 0) + 1;
          }
        }

        // 6. Staff & Volunteer Quality
        if (animalShelterReview.staffAndVolunteerQuality) {
          const { staffKnowledge, animalHandling, customerService, volunteerProgram, staffTraining, compassionLevel } =
            animalShelterReview.staffAndVolunteerQuality;
          if (staffKnowledge) {
            categoryStats.staffAndVolunteerQuality.staffKnowledge[staffKnowledge] =
              (categoryStats.staffAndVolunteerQuality.staffKnowledge[staffKnowledge] || 0) + 1;
          }
          if (animalHandling) {
            categoryStats.staffAndVolunteerQuality.animalHandling[animalHandling] =
              (categoryStats.staffAndVolunteerQuality.animalHandling[animalHandling] || 0) + 1;
          }
          if (customerService) {
            categoryStats.staffAndVolunteerQuality.customerService[customerService] =
              (categoryStats.staffAndVolunteerQuality.customerService[customerService] || 0) + 1;
          }
          if (volunteerProgram !== undefined)
            categoryStats.staffAndVolunteerQuality.volunteerProgram[volunteerProgram]++;
          if (staffTraining !== undefined) categoryStats.staffAndVolunteerQuality.staffTraining[staffTraining]++;
          if (compassionLevel) {
            categoryStats.staffAndVolunteerQuality.compassionLevel[compassionLevel] =
              (categoryStats.staffAndVolunteerQuality.compassionLevel[compassionLevel] || 0) + 1;
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
    console.error("Error fetching animal shelter review stats:", err);
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

// Delete a review (only by the review author)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body; // User ID from request body

    console.log("Delete review request:", { reviewId, userId });

    // Find the review first
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if the user is the author of the review
    if (!review.userId || review.userId.toString() !== userId) {
      console.log("Unauthorized delete attempt:", {
        reviewAuthor: review.userId,
        requestingUser: userId,
      });
      return res.status(403).json({
        error: "You are not authorized to delete this review. Only the author can delete it.",
      });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    console.log("Review deleted successfully:", reviewId);

    res.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: err.message });
  }
};

// Like or unlike a review
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    console.log("Like review request:", { reviewId, userId });

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user already liked the review
    const userLikedIndex = review.likedBy.indexOf(userId);
    let liked = false;

    if (userLikedIndex === -1) {
      // User hasn't liked the review, add like
      review.likedBy.push(userId);
      review.likeCount = review.likedBy.length;
      liked = true;
      console.log("User liked the review");
    } else {
      // User already liked the review, remove like
      review.likedBy.splice(userLikedIndex, 1);
      review.likeCount = review.likedBy.length;
      liked = false;
      console.log("User unliked the review");
    }

    // Save the updated review
    const updatedReview = await review.save();

    // Update corresponding card's helpful count if it exists
    try {
      const card = await Card.findOne({ reviewId: reviewId });
      if (card) {
        await Card.findByIdAndUpdate(card._id, { helpfulCount: updatedReview.likeCount });
        console.log(`Updated card ${card._id} helpful count to ${updatedReview.likeCount}`);
      }
    } catch (cardError) {
      console.error("Error updating card helpful count:", cardError);
    }

    // POPULAR REVIEW CARD GENERATION LOGIC
    try {
      // Only check for card generation when liking (not unliking) and when reaching 5+ likes
      if (liked && updatedReview.likeCount >= 5) {
        console.log(`Review reached ${updatedReview.likeCount} likes, checking for popular review card...`);
        
        // Check if the review author already has a popular review card for this specific review
        const existingPopularCard = await Card.findOne({ 
          reviewId: reviewId,
          contributionType: "popular_review"
        });
        
        if (!existingPopularCard) {
          // Get the review author and place info for card generation
          const reviewAuthorId = updatedReview.userId;
          const placeId = updatedReview.placeId;
          
          // Get place name for the card
          const place = await Place.findById(placeId);
          const locationName = place ? place.name : "Unknown Location";
          
          // Generate the popular review card
          await generateRewardCard(
            reviewAuthorId, 
            reviewId, 
            placeId, 
            locationName, 
            "popular_review"
          );
          
          console.log(`✅ Popular review card generated for user ${reviewAuthorId} - review with ${updatedReview.likeCount} likes`);
        } else {
          console.log(`User already has a popular review card for this review`);
        }
      }
    } catch (popularCardError) {
      // Don't fail the like operation if card generation fails
      console.error("Error generating popular review card:", popularCardError);
    }

    res.json({
      liked: liked,
      likeCount: updatedReview.likeCount,
      message: liked ? "Review liked successfully" : "Review unliked successfully",
    });
  } catch (err) {
    console.error("Error liking/unliking review:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get like status for a review by a specific user
exports.getReviewLikeStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.query;

    console.log("Get review like status request:", { reviewId, userId });

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user liked the review
    const liked = review.likedBy.includes(userId);

    res.json({
      liked: liked,
      likeCount: review.likeCount,
    });
  } catch (err) {
    console.error("Error getting review like status:", err);
    res.status(500).json({ error: err.message });
  }
};
