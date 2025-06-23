const Review = require("../models/Review");
const Place = require("../models/Place");

// Helper function to validate dog park review data
const validateDogParkReview = (dogParkReview) => {
  if (!dogParkReview) return true; // Optional field
  
  const errors = [];
  
  // Validate accessAndLocation
  if (dogParkReview.accessAndLocation) {
    const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = dogParkReview.accessAndLocation;
    if (parkingDifficulty && !['easy', 'moderate', 'difficult'].includes(parkingDifficulty)) {
      errors.push('Invalid parkingDifficulty value');
    }
    if (parkingToParkDistance && !['close', 'moderate', 'far'].includes(parkingToParkDistance)) {
      errors.push('Invalid parkingToParkDistance value');
    }
  }
  
  // Validate safetyLevel
  if (dogParkReview.safetyLevel) {
    const { fencingCondition } = dogParkReview.safetyLevel;
    if (fencingCondition && !['fully_enclosed', 'partially_enclosed', 'not_enclosed'].includes(fencingCondition)) {
      errors.push('Invalid fencingCondition value');
    }
  }
  
  // Validate sizeAndLayout
  if (dogParkReview.sizeAndLayout) {
    const { separateAreas, runningSpace, drainagePerformance } = dogParkReview.sizeAndLayout;
    if (separateAreas && !['yes_small_large', 'yes_other', 'no'].includes(separateAreas)) {
      errors.push('Invalid separateAreas value');
    }
    if (runningSpace && !['enough', 'limited', 'tight'].includes(runningSpace)) {
      errors.push('Invalid runningSpace value');
    }
    if (drainagePerformance && !['excellent', 'good', 'poor'].includes(drainagePerformance)) {
      errors.push('Invalid drainagePerformance value');
    }
  }
  
  // Validate amenitiesAndFacilities
  if (dogParkReview.amenitiesAndFacilities) {
    const { seatingLevel, shadeAndCover, waterAccess } = dogParkReview.amenitiesAndFacilities;
    if (seatingLevel && !['bench', 'gazebo', 'no_seat'].includes(seatingLevel)) {
      errors.push('Invalid seatingLevel value');
    }
    if (shadeAndCover && !['trees', 'shade_structures', 'none'].includes(shadeAndCover)) {
      errors.push('Invalid shadeAndCover value');
    }
    if (waterAccess && !['drinking_fountain', 'fire_hydrant', 'pool', 'none'].includes(waterAccess)) {
      errors.push('Invalid waterAccess value');
    }
  }
  
  // Validate maintenanceAndCleanliness
  if (dogParkReview.maintenanceAndCleanliness) {
    const { overallCleanliness, trashLevel, odorLevel, equipmentCondition } = dogParkReview.maintenanceAndCleanliness;
    if (overallCleanliness && !['good', 'neutral', 'bad'].includes(overallCleanliness)) {
      errors.push('Invalid overallCleanliness value');
    }
    if (trashLevel && !['clean', 'moderate', 'dirty'].includes(trashLevel)) {
      errors.push('Invalid trashLevel value');
    }
    if (odorLevel && !['none', 'mild', 'strong'].includes(odorLevel)) {
      errors.push('Invalid odorLevel value');
    }
    if (equipmentCondition && !['good', 'fair', 'poor'].includes(equipmentCondition)) {
      errors.push('Invalid equipmentCondition value');
    }
  }
  
  // Validate crowdAndSocialDynamics
  if (dogParkReview.crowdAndSocialDynamics) {
    const { ownerCulture, wastePickup, ownerFriendliness } = dogParkReview.crowdAndSocialDynamics;
    if (ownerCulture && !['excellent', 'good', 'fair', 'poor'].includes(ownerCulture)) {
      errors.push('Invalid ownerCulture value');
    }
    if (wastePickup && !['always', 'usually', 'sometimes', 'rarely'].includes(wastePickup)) {
      errors.push('Invalid wastePickup value');
    }
    if (ownerFriendliness && !['very_friendly', 'friendly', 'neutral', 'unfriendly'].includes(ownerFriendliness)) {
      errors.push('Invalid ownerFriendliness value');
    }
  }
  
  // Validate rulesPoliciesAndCommunity
  if (dogParkReview.rulesPoliciesAndCommunity) {
    const { leashPolicy, aggressiveDogPolicy, communityEnforcement } = dogParkReview.rulesPoliciesAndCommunity;
    if (leashPolicy && !['off_leash_allowed', 'leash_required', 'mixed_areas'].includes(leashPolicy)) {
      errors.push('Invalid leashPolicy value');
    }
    if (aggressiveDogPolicy && !['strict', 'moderate', 'lenient', 'none'].includes(aggressiveDogPolicy)) {
      errors.push('Invalid aggressiveDogPolicy value');
    }
    if (communityEnforcement && !['strict', 'moderate', 'lenient', 'none'].includes(communityEnforcement)) {
      errors.push('Invalid communityEnforcement value');
    }
  }
  
  return errors.length === 0 ? true : errors;
};

exports.addReview = async (req, res) => {
  try {
    const { placeId, rating, comment, tags, dogParkReview } = req.body;
    
    // Validate required fields
    if (!placeId || !rating) {
      return res.status(400).json({ error: 'placeId and rating are required' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Validate dog park review data if provided
    if (dogParkReview) {
      const validationResult = validateDogParkReview(dogParkReview);
      if (validationResult !== true) {
        return res.status(400).json({ 
          error: 'Invalid dog park review data', 
          details: validationResult 
        });
      }
    }
    
    // Check if place exists and is a dog park (if dog park review is provided)
    if (dogParkReview) {
      const place = await Place.findById(placeId);
      if (!place) {
        return res.status(404).json({ error: 'Place not found' });
      }
      if (place.type !== 'dog park') {
        return res.status(400).json({ error: 'Dog park reviews can only be added to dog parks' });
      }
    }
    
    // Create the review
    const review = await Review.create({ 
      userId: req.user.uid,
      placeId,
      rating,
      comment,
      tags,
      dogParkReview
    });
    
    // Populate user information for response
    await review.populate('userId', 'name email');
    
    res.status(201).json(review);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewsForPlace = async (req, res) => {
  try {
    const { placeId } = req.params;
    const reviews = await Review.find({ placeId })
      .populate('userId', 'name email profileImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
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
      dogParkReview: { $exists: true, $ne: null } 
    });
    
    if (reviews.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        categoryStats: {}
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
        parkingToParkDistance: {}
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        dawnToDusk: { true: 0, false: 0 }
      },
      safetyLevel: {
        fencingCondition: {},
        doubleGated: { true: 0, false: 0 },
        nightIllumination: { true: 0, false: 0 },
        firstAidStation: { true: 0, false: 0 },
        emergencyContact: { true: 0, false: 0 },
        surveillanceCameras: { true: 0, false: 0 },
        noSharpEdges: { true: 0, false: 0 }
      },
      sizeAndLayout: {
        separateAreas: {},
        runningSpace: {},
        drainagePerformance: {}
      },
      amenitiesAndFacilities: {
        seatingLevel: {},
        shadeAndCover: {},
        wasteStation: { true: 0, false: 0 },
        biodegradableBags: { true: 0, false: 0 },
        restroom: { true: 0, false: 0 },
        waterAccess: {}
      },
      maintenanceAndCleanliness: {
        overallCleanliness: {},
        trashLevel: {},
        odorLevel: {},
        equipmentCondition: {}
      },
      crowdAndSocialDynamics: {
        ownerCulture: {},
        wastePickup: {},
        ownerFriendliness: {}
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: {},
        vaccinationRequired: { true: 0, false: 0 },
        aggressiveDogPolicy: {},
        communityEnforcement: {}
      }
    };
    
    // Aggregate statistics from all reviews
    reviews.forEach(review => {
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
          const { fencingCondition, doubleGated, nightIllumination, firstAidStation, emergencyContact, surveillanceCameras, noSharpEdges } = dogParkReview.safetyLevel;
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
          const { seatingLevel, shadeAndCover, wasteStation, biodegradableBags, restroom, waterAccess } = dogParkReview.amenitiesAndFacilities;
          if (seatingLevel) {
            categoryStats.amenitiesAndFacilities.seatingLevel[seatingLevel] = 
              (categoryStats.amenitiesAndFacilities.seatingLevel[seatingLevel] || 0) + 1;
          }
          if (shadeAndCover) {
            categoryStats.amenitiesAndFacilities.shadeAndCover[shadeAndCover] = 
              (categoryStats.amenitiesAndFacilities.shadeAndCover[shadeAndCover] || 0) + 1;
          }
          if (wasteStation !== undefined) categoryStats.amenitiesAndFacilities.wasteStation[wasteStation]++;
          if (biodegradableBags !== undefined) categoryStats.amenitiesAndFacilities.biodegradableBags[biodegradableBags]++;
          if (restroom !== undefined) categoryStats.amenitiesAndFacilities.restroom[restroom]++;
          if (waterAccess) {
            categoryStats.amenitiesAndFacilities.waterAccess[waterAccess] = 
              (categoryStats.amenitiesAndFacilities.waterAccess[waterAccess] || 0) + 1;
          }
        }
        
        // Maintenance & Cleanliness
        if (dogParkReview.maintenanceAndCleanliness) {
          const { overallCleanliness, trashLevel, odorLevel, equipmentCondition } = dogParkReview.maintenanceAndCleanliness;
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
          const { leashPolicy, vaccinationRequired, aggressiveDogPolicy, communityEnforcement } = dogParkReview.rulesPoliciesAndCommunity;
          if (leashPolicy) {
            categoryStats.rulesPoliciesAndCommunity.leashPolicy[leashPolicy] = 
              (categoryStats.rulesPoliciesAndCommunity.leashPolicy[leashPolicy] || 0) + 1;
          }
          if (vaccinationRequired !== undefined) categoryStats.rulesPoliciesAndCommunity.vaccinationRequired[vaccinationRequired]++;
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
      categoryStats
    });
    
  } catch (err) {
    console.error('Error fetching dog park review stats:', err);
    res.status(500).json({ error: err.message });
  }
};
