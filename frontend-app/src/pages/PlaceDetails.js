import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { placeAPI, reviewAPI } from "../services/api";
import "../styles/PlaceDetails.css";
import api from '../services/api';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { mongoUser, firebaseUser } = useUser();

  // State management
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dogParkStats, setDogParkStats] = useState(null);
  const [vetClinicStats, setVetClinicStats] = useState(null);
  const [petStoreStats, setPetStoreStats] = useState(null);
  const [animalShelterStats, setAnimalShelterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);


  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Image upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }

      return true;
    });

    // Check total file count
    if (selectedFiles.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed per review.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    try {
      setUploading(true);
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post('/reviews/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrls;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Image upload failed: ${error.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    dogParkReview: {
      accessAndLocation: {
        parkingDifficulty: "",
        handicapFriendly: false,
        parkingToParkDistance: "",
      },
      hoursOfOperation: {
        is24Hours: false,
        dawnToDusk: false,
        specificHours: "",
      },
      safetyLevel: {
        fencingCondition: "",
        doubleGated: false,
        nightIllumination: false,
        firstAidStation: false,
        emergencyContact: false,
        surveillanceCameras: false,
        noSharpEdges: false,
      },
      sizeAndLayout: {
        separateAreas: "",
        runningSpace: "",
        drainagePerformance: "",
      },
      amenitiesAndFacilities: {
        seatingLevel: "",
        shadeAndCover: "",
        wasteStation: false,
        biodegradableBags: false,
        restroom: false,
        waterAccess: "",
      },
      maintenanceAndCleanliness: {
        overallCleanliness: "",
        trashLevel: "",
        odorLevel: "",
        equipmentCondition: "",
      },
      crowdAndSocialDynamics: {
        peakDays: [],
        peakHours: "",
        socialEvents: [],
        ownerCulture: "",
        wastePickup: "",
        ownerFriendliness: "",
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: "",
        vaccinationRequired: false,
        aggressiveDogPolicy: "",
        otherRules: "",
        communityEnforcement: "",
      },
    },
    vetClinicReview: {
      clinicEnvironmentAndFacilities: {
        cleanliness: "",
        comfortLevel: "",
        facilitySize: "",
      },
      costAndTransparency: {
        routineCheckupCost: "",
        vaccinationCost: "",
        spayNeuterCost: "",
        dentalCleaningCost: "",
        emergencyVisitCost: "",
        feesExplainedUpfront: false,
        printedEstimatesAvailable: false,
        insuranceAccepted: false,
        paymentPlansOffered: false,
      },
      medicalStaffAndServices: {
        veterinarianAttitude: "",
        veterinarianCompetence: "",
        technicianNursePerformance: "",
        onSiteDiagnostics: [],
        surgeryOrthopedics: false,
        behavioralCounseling: false,
        nutritionConsultation: false,
      },
      schedulingAndCommunication: {
        responseTime: "",
        appointmentWaitTime: "",
        inClinicWaitingTime: "",
        followUpCommunication: "",
      },
      emergencyAndAfterHours: {
        openWeekends: false,
        openEvenings: false,
        onCallEmergencyNumber: false,
        connectedToEmergencyHospitals: false,
        clearHandoffsToSpecialists: false,
        emergencyTriageSpeed: "",
        crisisHandlingConfidence: "",
      },
      ownerInvolvement: {
        allowedDuringExams: false,
        allowedDuringProcedures: false,
        communicationDuringAnesthesia: "",
        communicationDuringSurgery: "",
        explainsProceduresWell: false,
        involvesOwnerInDecisions: false,
      },
      reputationAndCommunity: {
        onlineReputationConsistency: "",
        wordOfMouthReputation: "",
        communityInvolvement: "",
        hostsVaccineClinic: false,
        shelterPartnerships: false,
        communityEvents: false,
        educationalPrograms: false,
        socialMediaPresence: "",
      },
    },
    petStoreReview: {
      accessAndLocation: {
        parkingDifficulty: "",
        handicapFriendly: false,
        parkingToParkDistance: "",
      },
      hoursOfOperation: {
        is24Hours: false,
        dawnToDusk: false,
        specificHours: "",
      },
      servicesAndConveniences: {
        grooming: false,
        veterinaryServices: false,
        petTraining: false,
        deliveryService: false,
        onlineOrdering: false,
        curbsidePickup: false,
        returnPolicy: "",
      },
      productSelectionAndQuality: {
        foodBrandVariety: "",
        toySelection: "",
        suppliesAvailability: "",
        productFreshness: "",
        organicNaturalOptions: false,
        prescriptionDietAvailable: false,
      },
      pricingAndValue: {
        overallPricing: "",
        loyaltyProgram: false,
        frequentSales: false,
        priceMatching: false,
        bulkDiscounts: false,
        seniorDiscounts: false,
      },
      staffKnowledgeAndService: {
        petKnowledge: "",
        productRecommendations: "",
        customerService: "",
        helpfulness: "",
        multilingual: false,
        trainingCertified: false,
      },
    },
    animalShelterReview: {
      accessAndLocation: {
        parkingDifficulty: "",
        handicapFriendly: false,
        parkingToParkDistance: "",
      },
      hoursOfOperation: {
        is24Hours: false,
        dawnToDusk: false,
        specificHours: "",
      },
      animalTypeSelection: {
        availableAnimalTypes: [],
        breedVariety: "",
        ageRange: [],
      },
      animalCareAndWelfare: {
        animalHealth: "",
        livingConditions: "",
        exercisePrograms: false,
        medicalCare: "",
        behavioralAssessment: false,
        specialNeedsCare: false,
      },
      adoptionProcessAndSupport: {
        applicationProcess: "",
        processingTime: "",
        homeVisitRequired: false,
        adoptionFees: "",
        postAdoptionSupport: false,
        returnPolicy: "",
      },
      staffAndVolunteerQuality: {
        staffKnowledge: "",
        animalHandling: "",
        customerService: "",
        volunteerProgram: false,
        staffTraining: false,
        compassionLevel: "",
      },
    },
  });

  // Location types with icons
  const locationTypes = {
    "dog park": { label: "Dog Park", icon: "🐕", color: "#22c55e" },
    dog_park: { label: "Dog Park", icon: "🐕", color: "#22c55e" },
    leisure: { label: "Dog Park", icon: "🐕", color: "#22c55e" },

    vet: { label: "VET", icon: "🏥", color: "#3b82f6" },
    veterinary: { label: "VET", icon: "🏥", color: "#3b82f6" },

    "pet store": { label: "Pet Store", icon: "🏪", color: "#f59e0b" },
    shelter: { label: "Shelter", icon: "🏠", color: "#ef4444" },
    other: { label: "Other", icon: "📍", color: "#6b7280" },
  };

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      if (data && data.display_name) {
        // Try to construct a nice address from the components
        const addr = data.address || {};

        let streetAddress = "";

        // Try to build street address
        if (addr.house_number && addr.road) {
          streetAddress = `${addr.house_number} ${addr.road}`;
        } else if (addr.road) {
          streetAddress = addr.road;
        } else if (addr.pedestrian) {
          streetAddress = addr.pedestrian;
        } else if (addr.footway) {
          streetAddress = addr.footway;
        }

        // Add city and state/country
        let cityInfo = "";
        if (addr.city) {
          cityInfo = addr.city;
        } else if (addr.town) {
          cityInfo = addr.town;
        } else if (addr.village) {
          cityInfo = addr.village;
        } else if (addr.suburb) {
          cityInfo = addr.suburb;
        }

        if (addr.state) {
          cityInfo = cityInfo ? `${cityInfo}, ${addr.state}` : addr.state;
        }

        // Combine street and city
        let fullAddress = "";
        if (streetAddress && cityInfo) {
          fullAddress = `${streetAddress}, ${cityInfo}`;
        } else if (streetAddress) {
          fullAddress = streetAddress;
        } else if (cityInfo) {
          fullAddress = cityInfo;
        } else {
          // Fallback to display name
          fullAddress = data.display_name;
        }

        return fullAddress;
      }

      return null;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  };

  // Load place data and reviews
  useEffect(() => {
    const loadPlaceData = async () => {
      try {
        setLoading(true);
        console.log("Loading place data for ID:", id);
        console.log("Location state:", location.state);

        // Check if this is an OSM-based ID OR a numeric OSM node ID
        if (id.startsWith("osm-") || /^\d+$/.test(id)) {
          let osmLocation = null;

          if (location.state?.locationData) {
            osmLocation = location.state.locationData;
          } else if (id.startsWith("osm-")) {
            // Parse coordinates from OSM ID format: osm-lat-lng
            const parts = id.split("-");
            if (parts.length >= 3) {
              const lat = parseFloat(parts[1]);
              const lng = parseFloat(parts[2]);
              osmLocation = {
                name: "Location from Map",
                type: "other",
                latitude: lat,
                longitude: lng,
                tags: ["from-map"],
              };
            }
          } else if (/^\d+$/.test(id)) {
            // This is a pure OSM node ID - we need the location data from navigation state
            if (!location.state?.locationData) {
              throw new Error("OSM location data not found. Please navigate from the map.");
            }
            osmLocation = location.state.locationData;
          }

          if (osmLocation) {
            // First, try to find if this place already exists in database by coordinates
            let existingPlace = null;
            try {
              console.log("Checking if place exists in database by coordinates:", {
                lat: osmLocation.latitude,
                lng: osmLocation.longitude,
              });

              // Try to find place by coordinates (within ~100 meters)
              const places = await placeAPI.getAllPlaces();
              const tolerance = 0.001; // roughly 100 meters

              console.log("Searching for existing places. OSM location coords:", {
                lat: osmLocation.latitude,
                lng: osmLocation.longitude,
              });
              console.log(
                "Database places:",
                places.map((p) => ({
                  id: p._id,
                  name: p.name,
                  coords: p.coordinates,
                }))
              );

              existingPlace = places.find((p) => {
                if (!p.coordinates) return false;
                const latDiff = Math.abs(p.coordinates.lat - osmLocation.latitude);
                const lngDiff = Math.abs(p.coordinates.lng - osmLocation.longitude);
                const matches = latDiff < tolerance && lngDiff < tolerance;

                console.log("Comparing with place:", {
                  id: p._id,
                  name: p.name,
                  dbCoords: p.coordinates,
                  osmCoords: { lat: osmLocation.latitude, lng: osmLocation.longitude },
                  latDiff,
                  lngDiff,
                  tolerance,
                  matches,
                });

                return matches;
              });

              if (existingPlace) {
                console.log("Found existing place in database:", existingPlace);
                // Redirect to the existing place instead of treating as OSM
                navigate(`/place/${existingPlace._id}`, { replace: true });
                return;
              } else {
                console.log("No existing place found - will treat as new OSM location");
              }
            } catch (coordError) {
              console.log("Could not search for existing place by coordinates:", coordError);
            }

            // Create enhanced place object from OSM data
            const enhancedPlace = {
              _id: id,
              name: osmLocation.name || "Unnamed Location",
              type: osmLocation.type || "other",
              coordinates: {
                lat: osmLocation.latitude,
                lng: osmLocation.longitude,
              },
              tags: osmLocation.tags || [],
              address: osmLocation.address || "",
              phone: osmLocation.phone || "",
              website: osmLocation.website || "",
              opening_hours: osmLocation.opening_hours || "",
              description: osmLocation.description || "",
              addedBy: null,
              createdAt: new Date(),
              isOSMLocation: true, // Flag to indicate this is from OSM
            };

            setPlace(enhancedPlace);

            // Try to get a proper street address from coordinates
            if (osmLocation.latitude && osmLocation.longitude && !enhancedPlace.address) {
              console.log("Attempting reverse geocoding for coordinates:", osmLocation.latitude, osmLocation.longitude);
              const resolvedAddress = await reverseGeocode(osmLocation.latitude, osmLocation.longitude);
              if (resolvedAddress) {
                console.log("Resolved address:", resolvedAddress);
                // Update the place object with the resolved address
                setPlace((prev) => ({ ...prev, address: resolvedAddress }));
              }
            }

            // ALWAYS try to load reviews for OSM locations in case they were already saved
            try {
              console.log("Attempting to load reviews for OSM location:", id);
              const reviewsData = await reviewAPI.getReviewsByPlace(id);
              console.log("Found reviews for OSM location:", reviewsData);
              setReviews(reviewsData);

              // Load dog park stats if it's a dog park and has reviews
              if ((osmLocation.type === "dog park" || osmLocation.type === "dog_park" || osmLocation.type === "leisure") && reviewsData.length > 0) {
                try {
                  const statsData = await reviewAPI.getDogParkStats(id);
                  setDogParkStats(statsData);
                } catch (statsError) {
                  console.error("Error loading dog park stats for OSM location:", statsError);
                  setDogParkStats(null);
                }
              } else {
                setDogParkStats(null);
              }

              // Load vet clinic stats if it's a vet clinic and has reviews
              if ((osmLocation.type === "vet" || osmLocation.type === "veterinary") && reviewsData.length > 0) {
                try {
                  const statsData = await reviewAPI.getVetClinicStats(id);
                  setVetClinicStats(statsData);
                } catch (statsError) {
                  console.error("Error loading vet clinic stats for OSM location:", statsError);
                  setVetClinicStats(null);
                }
              } else {
                setVetClinicStats(null);
              }

              // Load pet store stats if it's a pet store and has reviews
              if ((osmLocation.type === "pet_store" || osmLocation.type === "pet store") && reviewsData.length > 0) {
                try {
                  const statsData = await reviewAPI.getPetStoreStats(id);
                  setPetStoreStats(statsData);
                } catch (statsError) {
                  console.error("Error loading pet store stats for OSM location:", statsError);
                  setPetStoreStats(null);
                }
              } else {
                setPetStoreStats(null);
              }

              // Load animal shelter stats if it's a shelter and has reviews
              if ((osmLocation.type === "animal_shelter" || osmLocation.type === "shelter") && reviewsData.length > 0) {
                try {
                  const statsData = await reviewAPI.getAnimalShelterStats(id);
                  setAnimalShelterStats(statsData);
                } catch (statsError) {
                  console.error("Error loading animal shelter stats for OSM location:", statsError);
                  setAnimalShelterStats(null);
                }
              } else {
                setAnimalShelterStats(null);
              }
            } catch (reviewError) {
              console.log("No reviews found for OSM location (this is normal for new locations):", reviewError);
              setReviews([]);
              setDogParkStats(null);
            }

            setLoading(false);
            return;
          }
        }

        // Load place details from database
        try {
          const placeData = await placeAPI.getPlaceById(id);
          setPlace(placeData);

          // Try to get address if not available but coordinates exist
          if (placeData.coordinates && !placeData.address) {
            console.log("Attempting reverse geocoding for database place:", placeData.coordinates);
            const resolvedAddress = await reverseGeocode(placeData.coordinates.lat, placeData.coordinates.lng);
            if (resolvedAddress) {
              console.log("Resolved address for database place:", resolvedAddress);
              // Update the place object with the resolved address
              setPlace((prev) => ({ ...prev, address: resolvedAddress }));
            }
          }

          // Load reviews
          const reviewsData = await reviewAPI.getReviewsByPlace(id);
          setReviews(reviewsData);

          // Load dog park stats if it's a dog park
          if (placeData.type === "dog park" || placeData.type === "dog_park" || placeData.type === "leisure") {
            try {
              const statsData = await reviewAPI.getDogParkStats(id);
              setDogParkStats(statsData);
            } catch (statsError) {
              console.error("Error loading dog park stats:", statsError);
            }
          }

          // Load vet clinic stats if it's a vet clinic
          if (placeData.type === "vet" || placeData.type === "veterinary") {
            try {
              const statsData = await reviewAPI.getVetClinicStats(id);
              setVetClinicStats(statsData);
            } catch (statsError) {
              console.error("Error loading vet clinic stats:", statsError);
            }
          }

          // Load pet store stats if it's a pet store
          if (placeData.type === "pet store" || placeData.type === "pet_store") {
            try {
              const statsData = await reviewAPI.getPetStoreStats(id);
              setPetStoreStats(statsData);
            } catch (statsError) {
              console.error("Error loading pet store stats:", statsError);
            }
          }

          // Load animal shelter stats if it's a shelter
          if (placeData.type === "shelter" || placeData.type === "animal_shelter") {
            try {
              const statsData = await reviewAPI.getAnimalShelterStats(id);
              setAnimalShelterStats(statsData);
            } catch (statsError) {
              console.error("Error loading animal shelter stats:", statsError);
            }
          }
        } catch (placeError) {
          console.error("Error loading place from database:", placeError);
          // If place not found in database, treat as invalid ID
          throw new Error(`Place with ID ${id} not found`);
        }
      } catch (err) {
        console.error("Error loading place data:", err);
        setError("Failed to load place information. The place might not exist or there might be a server issue.");

        // If it's a malformed OSM ID or other issue, offer to go back to home
        if (id.startsWith("osm-") || /^\d+$/.test(id)) {
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPlaceData();
    }
  }, [id]);

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    console.log("🔄 Starting review submission...");

    // Check if user is logged in
    if (!mongoUser || !firebaseUser) {
      alert("Please log in to leave a review. You will be redirected to the login page.");
      navigate("/login");
      return;
    }

    // First, upload images if any
    console.log("📷 Uploading images...");
    const imageUrls = await uploadImages();
    console.log("✅ Images uploaded:", imageUrls);

    // Check if this is an OSM location that needs to be saved first
    if (id.startsWith("osm-") || /^\d+$/.test(id)) {
      try {
        // For OSM locations, we'll let the backend create the place automatically
        const lat = Number(place.coordinates?.lat);
        const lng = Number(place.coordinates?.lng);

        // Validate coordinates before creating place data
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          throw new Error(`Invalid coordinates: lat=${place.coordinates?.lat}, lng=${place.coordinates?.lng}`);
        }

        // Map OSM place types to our database enum values
        let mappedType = place.type || "other";
        if (mappedType === "dog_park") mappedType = "dog park";
        if (mappedType === "pet_store") mappedType = "pet store";
        if (mappedType === "animal_shelter") mappedType = "shelter";
        if (mappedType === "veterinary") mappedType = "vet";

        // Prepare place data for the backend to create automatically
        const placeData = {
          name: place.name || "Unnamed Location",
          type: mappedType,
          coordinates: {
            lat: lat,
            lng: lng,
          },
          tags: place.tags || [],
          address: place.address || "",
          phone: place.phone || "",
          website: place.website || "",
          opening_hours: place.opening_hours || "",
          description: place.description || "",
        };

        // Submit the review with place data - backend will create place automatically
        const reviewData = {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          photos: imageUrls,
          userId: mongoUser._id,
          placeData: placeData, // Include place data for automatic creation
        };

        // Add dog park review data if it's a dog park
        if (mappedType === "dog park") {
          reviewData.dogParkReview = reviewForm.dogParkReview;
        }

        // Add vet clinic review data if it's a vet clinic
        if (mappedType === "vet") {
          reviewData.vetClinicReview = reviewForm.vetClinicReview;
        }

        // Add pet store review data if it's a pet store
        if (mappedType === "pet store") {
          reviewData.petStoreReview = reviewForm.petStoreReview;
        }

        // Add animal shelter review data if it's a shelter
        if (mappedType === "shelter") {
          reviewData.animalShelterReview = reviewForm.animalShelterReview;
        }

        console.log("Submitting review with place auto-creation:", reviewData);
        const createdReview = await reviewAPI.createReview(reviewData);
        console.log("Review created successfully (place auto-created or found):", createdReview);

        // Extract the place ID from the review response
        const actualPlaceId = createdReview.placeId;
        console.log("Actual place ID used:", actualPlaceId);

        // If the place ID is different from current URL, navigate to the correct place
        if (actualPlaceId !== id) {
          console.log("Navigating to existing place:", actualPlaceId);
          navigate(`/place/${actualPlaceId}`);
          return;
        }

        // Update the place state to reflect it's now in the database
        setPlace({ ...place, _id: actualPlaceId, isOSMLocation: false });

        // Reload reviews
        const updatedReviews = await reviewAPI.getReviewsByPlace(actualPlaceId);
        setReviews(updatedReviews);

        // Reload stats if dog park
        if (mappedType === "dog park") {
          const updatedStats = await reviewAPI.getDogParkStats(actualPlaceId);
          setDogParkStats(updatedStats);
        }

        // Reload stats if vet clinic
        if (mappedType === "vet") {
          const updatedStats = await reviewAPI.getVetClinicStats(actualPlaceId);
          setVetClinicStats(updatedStats);
        }

        // Reload stats if pet store
        if (mappedType === "pet store") {
          const updatedStats = await reviewAPI.getPetStoreStats(actualPlaceId);
          setPetStoreStats(updatedStats);
        }

        // Reload stats if animal shelter
        if (mappedType === "shelter") {
          const updatedStats = await reviewAPI.getAnimalShelterStats(actualPlaceId);
          setAnimalShelterStats(updatedStats);
        }

        // Reset form and hide it
        console.log("✅ OSM review submission successful, closing form...");
        setShowReviewForm(false);
        setSelectedFiles([]);
        setReviewForm({
          rating: 5,
          comment: "",
          dogParkReview: reviewForm.dogParkReview,
          vetClinicReview: reviewForm.vetClinicReview,
          petStoreReview: reviewForm.petStoreReview,
          animalShelterReview: reviewForm.animalShelterReview,
        });

        alert("Review submitted successfully!");
        return;
      } catch (err) {
        console.error("Error submitting review with place auto-creation:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          stack: err.stack,
        });

        let errorMessage = "Failed to save place and submit review. ";
        if (err.response?.status === 401) {
          errorMessage += "Authentication failed. Please try logging out and back in.";
        } else if (err.response?.status === 403) {
          errorMessage += "Permission denied. Please check your login status.";
        } else if (err.response?.status === 400) {
          const errorDetails = err.response?.data?.details || err.response?.data?.error || err.message;
          errorMessage += `Invalid data: ${errorDetails}`;
          console.log("Full error response:", err.response?.data);
        } else {
          errorMessage += "Please try again.";
        }

        alert(errorMessage);
        return;
      }
    }

    try {
      const reviewData = {
        placeId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        photos: imageUrls,
        userId: mongoUser._id, // Add user ID to review
      };

      // Add dog park review data if it's a dog park
      if (place.type === "dog park" || place.type === "dog_park" || place.type === "leisure") {
        reviewData.dogParkReview = reviewForm.dogParkReview;
      }

      // Add vet clinic review data if it's a vet clinic
      if (place.type === "vet" || place.type === "veterinary") {
        reviewData.vetClinicReview = reviewForm.vetClinicReview;
      }

      // Add pet store review data if it's a pet store
      if (place.type === "pet store" || place.type === "pet_store") {
        reviewData.petStoreReview = reviewForm.petStoreReview;
      }

      // Add animal shelter review data if it's a shelter
      if (place.type === "shelter" || place.type === "animal_shelter") {
        reviewData.animalShelterReview = reviewForm.animalShelterReview;
      }

      console.log("Submitting review with data:", reviewData);
      const createdReview = await reviewAPI.createReview(reviewData);
      console.log("Review created successfully:", createdReview);

      // Reload reviews
      const updatedReviews = await reviewAPI.getReviewsByPlace(id);
      setReviews(updatedReviews);

      // Reload stats if dog park
      if (place.type === "dog park" || place.type === "dog_park" || place.type === "leisure") {
        const updatedStats = await reviewAPI.getDogParkStats(id);
        setDogParkStats(updatedStats);
      }

      // Reload stats if vet clinic
      if (place.type === "vet" || place.type === "veterinary") {
        const updatedStats = await reviewAPI.getVetClinicStats(id);
        setVetClinicStats(updatedStats);
      }

      // Reload stats if pet store
      if (place.type === "pet store" || place.type === "pet_store") {
        const updatedStats = await reviewAPI.getPetStoreStats(id);
        setPetStoreStats(updatedStats);
      }

      // Reload stats if animal shelter
      if (place.type === "shelter" || place.type === "animal_shelter") {
        const updatedStats = await reviewAPI.getAnimalShelterStats(id);
        setAnimalShelterStats(updatedStats);
      }

      // Reset form and hide it
      console.log("✅ Regular review submission successful, closing form...");
      setShowReviewForm(false);
      setSelectedFiles([]);
      setReviewForm({
        rating: 5,
        comment: "",
        dogParkReview: reviewForm.dogParkReview, // Keep structure but reset values
        vetClinicReview: reviewForm.vetClinicReview, // Keep structure but reset values
        petStoreReview: reviewForm.petStoreReview, // Keep structure but reset values
        animalShelterReview: reviewForm.animalShelterReview, // Keep structure but reset values
      });

      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
      // Don't close form on error, so user can try again
    } finally {
      console.log("📝 Review submission process completed");
    }
  };

  // Analyze reviews to get tag popularity for smart coloring
  const analyzeReviewTags = () => {
    if (!reviews || reviews.length === 0) {
      return {};
    }

    const tagCounts = {
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0 },
        handicapFriendly: { true: 0, false: 0 },
        parkingToParkDistance: { close: 0, moderate: 0, far: 0 },
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        dawnToDusk: { true: 0, false: 0 },
      },
      safetyLevel: {
        fencingCondition: { fully_enclosed: 0, partially_enclosed: 0, not_enclosed: 0 },
        doubleGated: { true: 0, false: 0 },
        nightIllumination: { true: 0, false: 0 },
        firstAidStation: { true: 0, false: 0 },
        emergencyContact: { true: 0, false: 0 },
        surveillanceCameras: { true: 0, false: 0 },
        noSharpEdges: { true: 0, false: 0 },
      },
      sizeAndLayout: {
        separateAreas: { yes_small_large: 0, yes_other: 0, no: 0 },
        runningSpace: { enough: 0, limited: 0, tight: 0 },
        drainagePerformance: { excellent: 0, good: 0, poor: 0 },
      },
      amenitiesAndFacilities: {
        seatingLevel: { bench: 0, gazebo: 0, no_seat: 0 },
        shadeAndCover: { trees: 0, shade_structures: 0, none: 0 },
        wasteStation: { true: 0, false: 0 },
        biodegradableBags: { true: 0, false: 0 },
        restroom: { true: 0, false: 0 },
        waterAccess: { drinking_fountain: 0, fire_hydrant: 0, pool: 0, none: 0 },
      },
      maintenanceAndCleanliness: {
        overallCleanliness: { good: 0, neutral: 0, bad: 0 },
        trashLevel: { clean: 0, moderate: 0, dirty: 0 },
        odorLevel: { none: 0, mild: 0, strong: 0 },
        equipmentCondition: { good: 0, fair: 0, poor: 0 },
      },
      crowdAndSocialDynamics: {
        ownerCulture: { excellent: 0, good: 0, fair: 0, poor: 0 },
        wastePickup: { always: 0, usually: 0, sometimes: 0, rarely: 0 },
        ownerFriendliness: { very_friendly: 0, friendly: 0, neutral: 0, unfriendly: 0 },
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: { off_leash_allowed: 0, leash_required: 0, mixed_areas: 0 },
        vaccinationRequired: { true: 0, false: 0 },
        aggressiveDogPolicy: { strict: 0, moderate: 0, lenient: 0, none: 0 },
        communityEnforcement: { strict: 0, moderate: 0, lenient: 0, none: 0 },
      },
    };

    // Count occurrences from all reviews
    reviews.forEach((review) => {
      if (review.dogParkReview) {
        const dpReview = review.dogParkReview;

        // Access & Location
        if (dpReview.accessAndLocation) {
          const al = dpReview.accessAndLocation;
          if (al.parkingDifficulty) tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
          if (al.handicapFriendly !== undefined) tagCounts.accessAndLocation.handicapFriendly[al.handicapFriendly]++;
          if (al.parkingToParkDistance) tagCounts.accessAndLocation.parkingToParkDistance[al.parkingToParkDistance]++;
        }

        // Hours of Operation
        if (dpReview.hoursOfOperation) {
          const ho = dpReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.dawnToDusk !== undefined) tagCounts.hoursOfOperation.dawnToDusk[ho.dawnToDusk]++;
        }

        // Safety Level
        if (dpReview.safetyLevel) {
          const sl = dpReview.safetyLevel;
          if (sl.fencingCondition) tagCounts.safetyLevel.fencingCondition[sl.fencingCondition]++;
          if (sl.doubleGated !== undefined) tagCounts.safetyLevel.doubleGated[sl.doubleGated]++;
          if (sl.nightIllumination !== undefined) tagCounts.safetyLevel.nightIllumination[sl.nightIllumination]++;
          if (sl.firstAidStation !== undefined) tagCounts.safetyLevel.firstAidStation[sl.firstAidStation]++;
          if (sl.emergencyContact !== undefined) tagCounts.safetyLevel.emergencyContact[sl.emergencyContact]++;
          if (sl.surveillanceCameras !== undefined) tagCounts.safetyLevel.surveillanceCameras[sl.surveillanceCameras]++;
          if (sl.noSharpEdges !== undefined) tagCounts.safetyLevel.noSharpEdges[sl.noSharpEdges]++;
        }

        // Size & Layout
        if (dpReview.sizeAndLayout) {
          const szl = dpReview.sizeAndLayout;
          if (szl.separateAreas) tagCounts.sizeAndLayout.separateAreas[szl.separateAreas]++;
          if (szl.runningSpace) tagCounts.sizeAndLayout.runningSpace[szl.runningSpace]++;
          if (szl.drainagePerformance) tagCounts.sizeAndLayout.drainagePerformance[szl.drainagePerformance]++;
        }

        // Amenities & Facilities
        if (dpReview.amenitiesAndFacilities) {
          const af = dpReview.amenitiesAndFacilities;
          if (af.seatingLevel) tagCounts.amenitiesAndFacilities.seatingLevel[af.seatingLevel]++;
          if (af.shadeAndCover) tagCounts.amenitiesAndFacilities.shadeAndCover[af.shadeAndCover]++;
          if (af.wasteStation !== undefined) tagCounts.amenitiesAndFacilities.wasteStation[af.wasteStation]++;
          if (af.biodegradableBags !== undefined)
            tagCounts.amenitiesAndFacilities.biodegradableBags[af.biodegradableBags]++;
          if (af.restroom !== undefined) tagCounts.amenitiesAndFacilities.restroom[af.restroom]++;
          if (af.waterAccess) tagCounts.amenitiesAndFacilities.waterAccess[af.waterAccess]++;
        }

        // Maintenance & Cleanliness
        if (dpReview.maintenanceAndCleanliness) {
          const mc = dpReview.maintenanceAndCleanliness;
          if (mc.overallCleanliness) tagCounts.maintenanceAndCleanliness.overallCleanliness[mc.overallCleanliness]++;
          if (mc.trashLevel) tagCounts.maintenanceAndCleanliness.trashLevel[mc.trashLevel]++;
          if (mc.odorLevel) tagCounts.maintenanceAndCleanliness.odorLevel[mc.odorLevel]++;
          if (mc.equipmentCondition) tagCounts.maintenanceAndCleanliness.equipmentCondition[mc.equipmentCondition]++;
        }

        // Crowd & Social Dynamics
        if (dpReview.crowdAndSocialDynamics) {
          const csd = dpReview.crowdAndSocialDynamics;
          if (csd.ownerCulture) tagCounts.crowdAndSocialDynamics.ownerCulture[csd.ownerCulture]++;
          if (csd.wastePickup) tagCounts.crowdAndSocialDynamics.wastePickup[csd.wastePickup]++;
          if (csd.ownerFriendliness) tagCounts.crowdAndSocialDynamics.ownerFriendliness[csd.ownerFriendliness]++;
        }

        // Rules, Policies & Community
        if (dpReview.rulesPoliciesAndCommunity) {
          const rpc = dpReview.rulesPoliciesAndCommunity;
          if (rpc.leashPolicy) tagCounts.rulesPoliciesAndCommunity.leashPolicy[rpc.leashPolicy]++;
          if (rpc.vaccinationRequired !== undefined)
            tagCounts.rulesPoliciesAndCommunity.vaccinationRequired[rpc.vaccinationRequired]++;
          if (rpc.aggressiveDogPolicy)
            tagCounts.rulesPoliciesAndCommunity.aggressiveDogPolicy[rpc.aggressiveDogPolicy]++;
          if (rpc.communityEnforcement)
            tagCounts.rulesPoliciesAndCommunity.communityEnforcement[rpc.communityEnforcement]++;
        }
      }
    });

    return tagCounts;
  };

  // Get tag styling based on frequency
  const getTagStyle = (category, field, value, tagCounts) => {
    if (!tagCounts[category] || !tagCounts[category][field]) {
      return "option-tag gray"; // Default gray for no data
    }

    const count = tagCounts[category][field][value] || 0;
    const totalReviews = reviews.length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    if (count === 0) return "option-tag gray";
    if (percentage >= 60) return "option-tag popular"; // Most popular (bright color)
    if (percentage >= 30) return "option-tag common"; // Common (medium color)
    if (percentage >= 10) return "option-tag mentioned"; // Mentioned (light color)
    return "option-tag rare"; // Rarely mentioned (faded color)
  };

  // Render smart category tags - show top 3-5 relevant tags per category
  const renderSmartCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        {
          category: "accessAndLocation",
          field: "parkingDifficulty",
          value: "difficult",
          label: "🚗 Difficult Parking",
        },
        { category: "accessAndLocation", field: "handicapFriendly", value: true, label: "♿ Handicap Friendly" },
      ],
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
        { category: "hoursOfOperation", field: "dawnToDusk", value: true, label: "🌅 Dawn to Dusk" },
      ],
      safetyLevel: [
        { category: "safetyLevel", field: "fencingCondition", value: "fully_enclosed", label: "🚧 Fully Enclosed" },
        {
          category: "safetyLevel",
          field: "fencingCondition",
          value: "partially_enclosed",
          label: "🚧 Partially Enclosed",
        },
        { category: "safetyLevel", field: "doubleGated", value: true, label: "🚪 Double Gated" },
        { category: "safetyLevel", field: "nightIllumination", value: true, label: "💡 Night Lighting" },
      ],
      sizeAndLayout: [
        { category: "sizeAndLayout", field: "separateAreas", value: "yes_small_large", label: "📐 Small/Large Areas" },
        { category: "sizeAndLayout", field: "runningSpace", value: "enough", label: "🏃 Enough Space" },
        { category: "sizeAndLayout", field: "runningSpace", value: "limited", label: "🏃 Limited Space" },
      ],
      amenitiesAndFacilities: [
        { category: "amenitiesAndFacilities", field: "seatingLevel", value: "bench", label: "🪑 Bench Seating" },
        { category: "amenitiesAndFacilities", field: "wasteStation", value: true, label: "🗑️ Waste Station" },
        { category: "amenitiesAndFacilities", field: "restroom", value: true, label: "🚻 Restroom" },
        { category: "amenitiesAndFacilities", field: "shadeAndCover", value: "trees", label: "🌳 Tree Shade" },
      ],
      maintenanceAndCleanliness: [
        {
          category: "maintenanceAndCleanliness",
          field: "overallCleanliness",
          value: "good",
          label: "🧽 Good Cleanliness",
        },
        {
          category: "maintenanceAndCleanliness",
          field: "overallCleanliness",
          value: "neutral",
          label: "🧽 Fair Cleanliness",
        },
        {
          category: "maintenanceAndCleanliness",
          field: "overallCleanliness",
          value: "bad",
          label: "🧽 Poor Cleanliness",
        },
      ],
      crowdAndSocialDynamics: [
        {
          category: "crowdAndSocialDynamics",
          field: "ownerCulture",
          value: "excellent",
          label: "⭐ Excellent Culture",
        },
        { category: "crowdAndSocialDynamics", field: "ownerCulture", value: "good", label: "⭐ Good Culture" },
        {
          category: "crowdAndSocialDynamics",
          field: "ownerFriendliness",
          value: "very_friendly",
          label: "😊 Very Friendly",
        },
        { category: "crowdAndSocialDynamics", field: "ownerFriendliness", value: "friendly", label: "🙂 Friendly" },
      ],
      rulesPoliciesAndCommunity: [
        {
          category: "rulesPoliciesAndCommunity",
          field: "leashPolicy",
          value: "off_leash_allowed",
          label: "🦮 Off-Leash Allowed",
        },
        {
          category: "rulesPoliciesAndCommunity",
          field: "leashPolicy",
          value: "leash_required",
          label: "🦮 Leash Required",
        },
        {
          category: "rulesPoliciesAndCommunity",
          field: "vaccinationRequired",
          value: true,
          label: "💉 Vaccination Required",
        },
      ],
    };

    const mapping = tagMappings[category];
    if (!mapping) return [];

    // Calculate popularity scores and sort
    const tagsWithScores = mapping.map((tag) => {
      const count = tagCounts[tag.category]?.[tag.field]?.[tag.value] || 0;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return {
        ...tag,
        count,
        percentage,
        styleClass: getTagStyle(tag.category, tag.field, tag.value, tagCounts),
      };
    });

    // Sort by count (popular first) and limit to 4 tags
    const sortedTags = tagsWithScores.sort((a, b) => b.count - a.count).slice(0, 4);

    return sortedTags.map((tag) => (
      <span
        key={`${tag.field}-${tag.value}`}
        className={tag.styleClass}
        title={
          tag.count > 0
            ? `${tag.count} review${tag.count !== 1 ? "s" : ""} mention this`
            : "No reviews mention this yet"
        }
      >
        {tag.label}
        {tag.count > 0 && <span className="tag-count"> ({tag.count})</span>}
      </span>
    ));
  };

  // Analyze vet clinic review tags
  const analyzeVetReviewTags = () => {
    const tagCounts = {
      clinicEnvironmentAndFacilities: {
        cleanliness: { excellent: 0, good: 0, fair: 0, poor: 0 },
        comfortLevel: { very_comfortable: 0, comfortable: 0, neutral: 0, uncomfortable: 0 },
        facilitySize: { small: 0, medium: 0, large: 0 },
      },
      costAndTransparency: {
        routineCheckupCost: { low: 0, moderate: 0, high: 0, very_high: 0 },
        vaccinationCost: { low: 0, moderate: 0, high: 0, very_high: 0 },
        spayNeuterCost: { low: 0, moderate: 0, high: 0, very_high: 0 },
        feesExplainedUpfront: { true: 0, false: 0 },
        printedEstimatesAvailable: { true: 0, false: 0 },
        insuranceAccepted: { true: 0, false: 0 },
      },
      medicalStaffAndServices: {
        veterinarianAttitude: { excellent: 0, good: 0, fair: 0, poor: 0 },
        veterinarianCompetence: { excellent: 0, good: 0, fair: 0, poor: 0 },
        technicianNursePerformance: { excellent: 0, good: 0, fair: 0, poor: 0 },
        surgeryOrthopedics: { true: 0, false: 0 },
        behavioralCounseling: { true: 0, false: 0 },
      },
      schedulingAndCommunication: {
        responseTime: { immediate: 0, same_day: 0, next_day: 0, several_days: 0 },
        appointmentWaitTime: { same_day: 0, within_week: 0, '1_2_weeks': 0, over_2_weeks: 0 },
        inClinicWaitingTime: { under_15_min: 0, '15_30_min': 0, '30_60_min': 0, over_1_hour: 0 },
        followUpCommunication: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      emergencyAndAfterHours: {
        openWeekends: { true: 0, false: 0 },
        openEvenings: { true: 0, false: 0 },
        onCallEmergencyNumber: { true: 0, false: 0 },

        connectedToEmergencyHospitals: { true: 0, false: 0 },
        clearHandoffsToSpecialists: { true: 0, false: 0 },

        emergencyTriageSpeed: { immediate: 0, within_30_min: 0, within_1_hour: 0, over_1_hour: 0 },
        crisisHandlingConfidence: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      ownerInvolvement: {
        allowedDuringExams: { true: 0, false: 0 },
        allowedDuringProcedures: { true: 0, false: 0 },
        communicationDuringAnesthesia: { excellent: 0, good: 0, fair: 0, poor: 0 },
        explainsProceduresWell: { true: 0, false: 0 },
        involvesOwnerInDecisions: { true: 0, false: 0 },
      },
      reputationAndCommunity: {
        onlineReputationConsistency: { excellent: 0, good: 0, fair: 0, poor: 0 },
        wordOfMouthReputation: { excellent: 0, good: 0, fair: 0, poor: 0 },
        communityInvolvement: { high: 0, moderate: 0, low: 0, none: 0 },
        hostsVaccineClinic: { true: 0, false: 0 },
        shelterPartnerships: { true: 0, false: 0 },
        communityEvents: { true: 0, false: 0 },
      },
    };

    // Count occurrences from all reviews
    reviews.forEach((review) => {
      if (review.vetClinicReview) {
        const vcReview = review.vetClinicReview;

        // Clinic Environment & Facilities
        if (vcReview.clinicEnvironmentAndFacilities) {
          const cef = vcReview.clinicEnvironmentAndFacilities;
          if (cef.cleanliness) tagCounts.clinicEnvironmentAndFacilities.cleanliness[cef.cleanliness]++;
          if (cef.comfortLevel) tagCounts.clinicEnvironmentAndFacilities.comfortLevel[cef.comfortLevel]++;
          if (cef.facilitySize) tagCounts.clinicEnvironmentAndFacilities.facilitySize[cef.facilitySize]++;
        }

        // Cost & Transparency
        if (vcReview.costAndTransparency) {
          const ct = vcReview.costAndTransparency;
          if (ct.routineCheckupCost) tagCounts.costAndTransparency.routineCheckupCost[ct.routineCheckupCost]++;
          if (ct.vaccinationCost) tagCounts.costAndTransparency.vaccinationCost[ct.vaccinationCost]++;
          if (ct.spayNeuterCost) tagCounts.costAndTransparency.spayNeuterCost[ct.spayNeuterCost]++;
          if (ct.feesExplainedUpfront !== undefined) tagCounts.costAndTransparency.feesExplainedUpfront[ct.feesExplainedUpfront]++;
          if (ct.printedEstimatesAvailable !== undefined) tagCounts.costAndTransparency.printedEstimatesAvailable[ct.printedEstimatesAvailable]++;
          if (ct.insuranceAccepted !== undefined) tagCounts.costAndTransparency.insuranceAccepted[ct.insuranceAccepted]++;
        }

        // Medical Staff & Services
        if (vcReview.medicalStaffAndServices) {
          const mss = vcReview.medicalStaffAndServices;
          if (mss.veterinarianAttitude) tagCounts.medicalStaffAndServices.veterinarianAttitude[mss.veterinarianAttitude]++;
          if (mss.veterinarianCompetence) tagCounts.medicalStaffAndServices.veterinarianCompetence[mss.veterinarianCompetence]++;
          if (mss.technicianNursePerformance) tagCounts.medicalStaffAndServices.technicianNursePerformance[mss.technicianNursePerformance]++;
          if (mss.surgeryOrthopedics !== undefined) tagCounts.medicalStaffAndServices.surgeryOrthopedics[mss.surgeryOrthopedics]++;
          if (mss.behavioralCounseling !== undefined) tagCounts.medicalStaffAndServices.behavioralCounseling[mss.behavioralCounseling]++;
        }

        // Scheduling & Communication
        if (vcReview.schedulingAndCommunication) {
          const sc = vcReview.schedulingAndCommunication;
          if (sc.responseTime) tagCounts.schedulingAndCommunication.responseTime[sc.responseTime]++;
          if (sc.appointmentWaitTime) tagCounts.schedulingAndCommunication.appointmentWaitTime[sc.appointmentWaitTime]++;
          if (sc.inClinicWaitingTime) tagCounts.schedulingAndCommunication.inClinicWaitingTime[sc.inClinicWaitingTime]++;
          if (sc.followUpCommunication) tagCounts.schedulingAndCommunication.followUpCommunication[sc.followUpCommunication]++;
        }

        // Emergency & After-Hours
        if (vcReview.emergencyAndAfterHours) {
          const eah = vcReview.emergencyAndAfterHours;
          if (eah.openWeekends !== undefined) tagCounts.emergencyAndAfterHours.openWeekends[eah.openWeekends]++;
          if (eah.openEvenings !== undefined) tagCounts.emergencyAndAfterHours.openEvenings[eah.openEvenings]++;
          if (eah.onCallEmergencyNumber !== undefined) tagCounts.emergencyAndAfterHours.onCallEmergencyNumber[eah.onCallEmergencyNumber]++;
          if (eah.emergencyTriageSpeed) tagCounts.emergencyAndAfterHours.emergencyTriageSpeed[eah.emergencyTriageSpeed]++;
          if (eah.crisisHandlingConfidence) tagCounts.emergencyAndAfterHours.crisisHandlingConfidence[eah.crisisHandlingConfidence]++;
        }

        // Owner Involvement
        if (vcReview.ownerInvolvement) {
          const oi = vcReview.ownerInvolvement;
          if (oi.allowedDuringExams !== undefined) tagCounts.ownerInvolvement.allowedDuringExams[oi.allowedDuringExams]++;
          if (oi.allowedDuringProcedures !== undefined) tagCounts.ownerInvolvement.allowedDuringProcedures[oi.allowedDuringProcedures]++;
          if (oi.communicationDuringAnesthesia) tagCounts.ownerInvolvement.communicationDuringAnesthesia[oi.communicationDuringAnesthesia]++;
          if (oi.explainsProceduresWell !== undefined) tagCounts.ownerInvolvement.explainsProceduresWell[oi.explainsProceduresWell]++;
          if (oi.involvesOwnerInDecisions !== undefined) tagCounts.ownerInvolvement.involvesOwnerInDecisions[oi.involvesOwnerInDecisions]++;
        }

        // Reputation & Community
        if (vcReview.reputationAndCommunity) {
          const rc = vcReview.reputationAndCommunity;
          if (rc.onlineReputationConsistency) tagCounts.reputationAndCommunity.onlineReputationConsistency[rc.onlineReputationConsistency]++;
          if (rc.wordOfMouthReputation) tagCounts.reputationAndCommunity.wordOfMouthReputation[rc.wordOfMouthReputation]++;
          if (rc.communityInvolvement) tagCounts.reputationAndCommunity.communityInvolvement[rc.communityInvolvement]++;
          if (rc.hostsVaccineClinic !== undefined) tagCounts.reputationAndCommunity.hostsVaccineClinic[rc.hostsVaccineClinic]++;
          if (rc.shelterPartnerships !== undefined) tagCounts.reputationAndCommunity.shelterPartnerships[rc.shelterPartnerships]++;
          if (rc.communityEvents !== undefined) tagCounts.reputationAndCommunity.communityEvents[rc.communityEvents]++;
        }
      }
    });

    return tagCounts;
  };

  // Render smart vet clinic category tags
  const renderSmartVetCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      clinicEnvironmentAndFacilities: [
        { category: "clinicEnvironmentAndFacilities", field: "cleanliness", value: "excellent", label: "🌟 Excellent Cleanliness" },
        { category: "clinicEnvironmentAndFacilities", field: "cleanliness", value: "good", label: "✨ Good Cleanliness" },
        { category: "clinicEnvironmentAndFacilities", field: "comfortLevel", value: "very_comfortable", label: "😌 Very Comfortable" },
        { category: "clinicEnvironmentAndFacilities", field: "comfortLevel", value: "comfortable", label: "😊 Comfortable" },
      ],
      costAndTransparency: [
        { category: "costAndTransparency", field: "routineCheckupCost", value: "low", label: "💰 Low Cost Checkups" },
        { category: "costAndTransparency", field: "routineCheckupCost", value: "moderate", label: "💰 Moderate Cost" },
        { category: "costAndTransparency", field: "feesExplainedUpfront", value: true, label: "📋 Transparent Fees" },
        { category: "costAndTransparency", field: "insuranceAccepted", value: true, label: "🏥 Insurance Accepted" },
      ],
      medicalStaffAndServices: [
        { category: "medicalStaffAndServices", field: "veterinarianAttitude", value: "excellent", label: "👨‍⚕️ Excellent Vet" },
        { category: "medicalStaffAndServices", field: "veterinarianCompetence", value: "excellent", label: "🎯 Expert Care" },
        { category: "medicalStaffAndServices", field: "surgeryOrthopedics", value: true, label: "🔬 Surgery Available" },
        { category: "medicalStaffAndServices", field: "behavioralCounseling", value: true, label: "🧠 Behavioral Help" },
      ],
      schedulingAndCommunication: [
        { category: "schedulingAndCommunication", field: "responseTime", value: "immediate", label: "⚡ Immediate Response" },
        { category: "schedulingAndCommunication", field: "responseTime", value: "same_day", label: "📞 Same Day Response" },
        { category: "schedulingAndCommunication", field: "appointmentWaitTime", value: "same_day", label: "📅 Same Day Appointments" },
        { category: "schedulingAndCommunication", field: "followUpCommunication", value: "excellent", label: "📱 Excellent Follow-up" },
      ],
      emergencyAndAfterHours: [
        { category: "emergencyAndAfterHours", field: "openWeekends", value: true, label: "🗓️ Weekend Hours" },
        { category: "emergencyAndAfterHours", field: "openEvenings", value: true, label: "🌙 Evening Hours" },
        { category: "emergencyAndAfterHours", field: "onCallEmergencyNumber", value: true, label: "🚨 Emergency On-Call" },
        { category: "emergencyAndAfterHours", field: "emergencyTriageSpeed", value: "immediate", label: "⚡ Fast Emergency Care" },
      ],
      ownerInvolvement: [
        { category: "ownerInvolvement", field: "allowedDuringExams", value: true, label: "👥 Owner During Exams" },
        { category: "ownerInvolvement", field: "explainsProceduresWell", value: true, label: "📚 Clear Explanations" },
        { category: "ownerInvolvement", field: "involvesOwnerInDecisions", value: true, label: "🤝 Collaborative Decisions" },
        { category: "ownerInvolvement", field: "communicationDuringAnesthesia", value: "excellent", label: "💬 Great Communication" },
      ],
      reputationAndCommunity: [
        { category: "reputationAndCommunity", field: "onlineReputationConsistency", value: "excellent", label: "⭐ Excellent Reputation" },
        { category: "reputationAndCommunity", field: "wordOfMouthReputation", value: "excellent", label: "🗣️ Great Word of Mouth" },
        { category: "reputationAndCommunity", field: "hostsVaccineClinic", value: true, label: "💉 Vaccine Clinics" },
        { category: "reputationAndCommunity", field: "communityEvents", value: true, label: "🎉 Community Events" },
      ],
    };

    const mapping = tagMappings[category];
    if (!mapping) return [];

    // Calculate popularity scores and sort
    const tagsWithScores = mapping.map((tag) => {
      const count = tagCounts[tag.category]?.[tag.field]?.[tag.value] || 0;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return {
        ...tag,
        count,
        percentage,
        styleClass: getTagStyle(tag.category, tag.field, tag.value, tagCounts),
      };
    });

    // Sort by count (popular first) and limit to 4 tags
    const sortedTags = tagsWithScores.sort((a, b) => b.count - a.count).slice(0, 4);

    return sortedTags.map((tag) => (
      <span
        key={`${tag.field}-${tag.value}`}
        className={tag.styleClass}
        title={
          tag.count > 0
            ? `${tag.count} review${tag.count !== 1 ? "s" : ""} mention this`
            : "No reviews mention this yet"
        }
      >
        {tag.label}
        {tag.count > 0 && <span className="tag-count"> ({tag.count})</span>}
      </span>
    ));
  };

  // Analyze pet store reviews to get tag popularity for smart coloring
  const analyzePetStoreReviewTags = () => {
    if (!reviews || reviews.length === 0) {
      return {};
    }

    const tagCounts = {
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0 },
        handicapFriendly: { true: 0, false: 0 },
        parkingToParkDistance: { close: 0, moderate: 0, far: 0 },
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
        returnPolicy: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      productSelectionAndQuality: {
        foodBrandVariety: { excellent: 0, good: 0, fair: 0, poor: 0 },
        toySelection: { excellent: 0, good: 0, fair: 0, poor: 0 },
        suppliesAvailability: { excellent: 0, good: 0, fair: 0, poor: 0 },
        productFreshness: { excellent: 0, good: 0, fair: 0, poor: 0 },
        organicNaturalOptions: { true: 0, false: 0 },
        prescriptionDietAvailable: { true: 0, false: 0 },
      },
      pricingAndValue: {
        overallPricing: { low: 0, moderate: 0, high: 0, very_high: 0 },
        loyaltyProgram: { true: 0, false: 0 },
        frequentSales: { true: 0, false: 0 },
        priceMatching: { true: 0, false: 0 },
        bulkDiscounts: { true: 0, false: 0 },
        seniorDiscounts: { true: 0, false: 0 },
      },
      staffKnowledgeAndService: {
        petKnowledge: { excellent: 0, good: 0, fair: 0, poor: 0 },
        productRecommendations: { excellent: 0, good: 0, fair: 0, poor: 0 },
        customerService: { excellent: 0, good: 0, fair: 0, poor: 0 },
        helpfulness: { excellent: 0, good: 0, fair: 0, poor: 0 },
        multilingual: { true: 0, false: 0 },
        trainingCertified: { true: 0, false: 0 },
      },
    };

    // Count occurrences from all reviews
    reviews.forEach((review) => {
      if (review.petStoreReview) {
        const psReview = review.petStoreReview;

        // Access & Location
        if (psReview.accessAndLocation) {
          const al = psReview.accessAndLocation;
          if (al.parkingDifficulty) tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
          if (al.handicapFriendly !== undefined) tagCounts.accessAndLocation.handicapFriendly[al.handicapFriendly]++;
          if (al.parkingToParkDistance) tagCounts.accessAndLocation.parkingToParkDistance[al.parkingToParkDistance]++;
        }

        // Hours of Operation
        if (psReview.hoursOfOperation) {
          const ho = psReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.dawnToDusk !== undefined) tagCounts.hoursOfOperation.dawnToDusk[ho.dawnToDusk]++;
          if (ho.specificHours) {
            tagCounts.hoursOfOperation.specificHours[ho.specificHours] = 
              (tagCounts.hoursOfOperation.specificHours[ho.specificHours] || 0) + 1;
          }
        }

        // Services & Conveniences
        if (psReview.servicesAndConveniences) {
          const sc = psReview.servicesAndConveniences;
          if (sc.grooming !== undefined) tagCounts.servicesAndConveniences.grooming[sc.grooming]++;
          if (sc.veterinaryServices !== undefined) tagCounts.servicesAndConveniences.veterinaryServices[sc.veterinaryServices]++;
          if (sc.petTraining !== undefined) tagCounts.servicesAndConveniences.petTraining[sc.petTraining]++;
          if (sc.deliveryService !== undefined) tagCounts.servicesAndConveniences.deliveryService[sc.deliveryService]++;
          if (sc.onlineOrdering !== undefined) tagCounts.servicesAndConveniences.onlineOrdering[sc.onlineOrdering]++;
          if (sc.curbsidePickup !== undefined) tagCounts.servicesAndConveniences.curbsidePickup[sc.curbsidePickup]++;
          if (sc.returnPolicy) tagCounts.servicesAndConveniences.returnPolicy[sc.returnPolicy]++;
        }

        // Product Selection & Quality
        if (psReview.productSelectionAndQuality) {
          const psq = psReview.productSelectionAndQuality;
          if (psq.foodBrandVariety) tagCounts.productSelectionAndQuality.foodBrandVariety[psq.foodBrandVariety]++;
          if (psq.toySelection) tagCounts.productSelectionAndQuality.toySelection[psq.toySelection]++;
          if (psq.suppliesAvailability) tagCounts.productSelectionAndQuality.suppliesAvailability[psq.suppliesAvailability]++;
          if (psq.productFreshness) tagCounts.productSelectionAndQuality.productFreshness[psq.productFreshness]++;
          if (psq.organicNaturalOptions !== undefined) tagCounts.productSelectionAndQuality.organicNaturalOptions[psq.organicNaturalOptions]++;
          if (psq.prescriptionDietAvailable !== undefined) tagCounts.productSelectionAndQuality.prescriptionDietAvailable[psq.prescriptionDietAvailable]++;
        }

        // Pricing & Value
        if (psReview.pricingAndValue) {
          const pv = psReview.pricingAndValue;
          if (pv.overallPricing) tagCounts.pricingAndValue.overallPricing[pv.overallPricing]++;
          if (pv.loyaltyProgram !== undefined) tagCounts.pricingAndValue.loyaltyProgram[pv.loyaltyProgram]++;
          if (pv.frequentSales !== undefined) tagCounts.pricingAndValue.frequentSales[pv.frequentSales]++;
          if (pv.priceMatching !== undefined) tagCounts.pricingAndValue.priceMatching[pv.priceMatching]++;
          if (pv.bulkDiscounts !== undefined) tagCounts.pricingAndValue.bulkDiscounts[pv.bulkDiscounts]++;
          if (pv.seniorDiscounts !== undefined) tagCounts.pricingAndValue.seniorDiscounts[pv.seniorDiscounts]++;
        }

        // Staff Knowledge & Service
        if (psReview.staffKnowledgeAndService) {
          const sks = psReview.staffKnowledgeAndService;
          if (sks.petKnowledge) tagCounts.staffKnowledgeAndService.petKnowledge[sks.petKnowledge]++;
          if (sks.productRecommendations) tagCounts.staffKnowledgeAndService.productRecommendations[sks.productRecommendations]++;
          if (sks.customerService) tagCounts.staffKnowledgeAndService.customerService[sks.customerService]++;
          if (sks.helpfulness) tagCounts.staffKnowledgeAndService.helpfulness[sks.helpfulness]++;
          if (sks.multilingual !== undefined) tagCounts.staffKnowledgeAndService.multilingual[sks.multilingual]++;
          if (sks.trainingCertified !== undefined) tagCounts.staffKnowledgeAndService.trainingCertified[sks.trainingCertified]++;
        }
      }
    });

    return tagCounts;
  };

  // Render smart category tags for pet stores
  const renderSmartPetStoreCategoryTags = (category, tagCounts) => {

    const tagMappings = {
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "difficult", label: "🚗 Difficult Parking" },
        { category: "accessAndLocation", field: "handicapFriendly", value: true, label: "♿ Handicap Friendly" },
      ],
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
        { category: "hoursOfOperation", field: "dawnToDusk", value: true, label: "🌅 Dawn to Dusk" },
      ],
      servicesAndConveniences: [
        { category: "servicesAndConveniences", field: "veterinaryServices", value: true, label: "🏥 Vet Services" },
        { category: "servicesAndConveniences", field: "grooming", value: true, label: "✂️ Grooming" },
        { category: "servicesAndConveniences", field: "petTraining", value: true, label: "🎓 Pet Training" },
        { category: "servicesAndConveniences", field: "deliveryService", value: true, label: "🚚 Delivery" },
      ],
      productSelectionAndQuality: [
        { category: "productSelectionAndQuality", field: "foodBrandVariety", value: "excellent", label: "🥘 Excellent Food Variety" },
        { category: "productSelectionAndQuality", field: "toySelection", value: "excellent", label: "🧸 Great Toy Selection" },
        { category: "productSelectionAndQuality", field: "organicNaturalOptions", value: true, label: "🌱 Organic Options" },
        { category: "productSelectionAndQuality", field: "prescriptionDietAvailable", value: true, label: "💊 Prescription Diets" },
      ],
      pricingAndValue: [
        { category: "pricingAndValue", field: "loyaltyProgram", value: true, label: "🎁 Loyalty Program" },
        { category: "pricingAndValue", field: "frequentSales", value: true, label: "💰 Frequent Sales" },
        { category: "pricingAndValue", field: "priceMatching", value: true, label: "🏷️ Price Matching" },
        { category: "pricingAndValue", field: "bulkDiscounts", value: true, label: "📦 Bulk Discounts" },
      ],
      staffKnowledgeAndService: [
        { category: "staffKnowledgeAndService", field: "petKnowledge", value: "excellent", label: "🧠 Expert Staff" },
        { category: "staffKnowledgeAndService", field: "customerService", value: "excellent", label: "😊 Excellent Service" },
        { category: "staffKnowledgeAndService", field: "helpfulness", value: "excellent", label: "🤝 Very Helpful" },
        { category: "staffKnowledgeAndService", field: "multilingual", value: true, label: "🗣️ Multilingual Staff" },
      ],
    };

    const mapping = tagMappings[category];
    if (!mapping) return [];

    // Calculate popularity scores and sort
    const tagsWithScores = mapping.map((tag) => {
      const count = tagCounts[tag.category]?.[tag.field]?.[tag.value] || 0;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return {
        ...tag,
        count,
        percentage,
        styleClass: getTagStyle(tag.category, tag.field, tag.value, tagCounts),
      };
    });

    // Sort by count (popular first) and limit to 4 tags
    const sortedTags = tagsWithScores.sort((a, b) => b.count - a.count).slice(0, 4);

    return sortedTags.map((tag) => (
      <span
        key={`${tag.field}-${tag.value}`}
        className={tag.styleClass}
        title={
          tag.count > 0
            ? `${tag.count} review${tag.count !== 1 ? "s" : ""} mention this`
            : "No reviews mention this yet"
        }
      >
        {tag.label}
        {tag.count > 0 && <span className="tag-count"> ({tag.count})</span>}
      </span>
    ));



  };

  // Analyze animal shelter reviews to get tag popularity for smart coloring
  const analyzeAnimalShelterReviewTags = () => {
    if (!reviews || reviews.length === 0) {
      return {};
    }

    const tagCounts = {
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0 },
        handicapFriendly: { true: 0, false: 0 },
        parkingToParkDistance: { close: 0, moderate: 0, far: 0 },
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        dawnToDusk: { true: 0, false: 0 },
        specificHours: {},
      },
      animalTypeSelection: {
        availableAnimalTypes: { dogs: 0, cats: 0, rabbits: 0, birds: 0, reptiles: 0, small_mammals: 0 },
        breedVariety: { excellent: 0, good: 0, fair: 0, poor: 0 },
        ageRange: { puppies_kittens: 0, young_adults: 0, adults: 0, seniors: 0 },
      },
      animalCareAndWelfare: {
        animalHealth: { excellent: 0, good: 0, fair: 0, poor: 0 },
        livingConditions: { excellent: 0, good: 0, fair: 0, poor: 0 },
        exercisePrograms: { true: 0, false: 0 },
        medicalCare: { excellent: 0, good: 0, fair: 0, poor: 0 },
        behavioralAssessment: { true: 0, false: 0 },
        specialNeedsCare: { true: 0, false: 0 },
      },
      adoptionProcessAndSupport: {
        applicationProcess: { easy: 0, moderate: 0, difficult: 0 },
        processingTime: { same_day: 0, within_week: 0, "1_2_weeks": 0, over_2_weeks: 0 },
        homeVisitRequired: { true: 0, false: 0 },
        adoptionFees: { low: 0, moderate: 0, high: 0, very_high: 0 },
        postAdoptionSupport: { true: 0, false: 0 },
        returnPolicy: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      staffAndVolunteerQuality: {
        staffKnowledge: { excellent: 0, good: 0, fair: 0, poor: 0 },
        animalHandling: { excellent: 0, good: 0, fair: 0, poor: 0 },
        customerService: { excellent: 0, good: 0, fair: 0, poor: 0 },
        volunteerProgram: { true: 0, false: 0 },
        staffTraining: { true: 0, false: 0 },
        compassionLevel: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
    };

    // Count occurrences from all reviews
    reviews.forEach((review) => {
      if (review.animalShelterReview) {
        const asReview = review.animalShelterReview;

        // Access & Location
        if (asReview.accessAndLocation) {
          const al = asReview.accessAndLocation;
          if (al.parkingDifficulty) tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
          if (al.handicapFriendly !== undefined) tagCounts.accessAndLocation.handicapFriendly[al.handicapFriendly]++;
          if (al.parkingToParkDistance) tagCounts.accessAndLocation.parkingToParkDistance[al.parkingToParkDistance]++;
        }

        // Hours of Operation
        if (asReview.hoursOfOperation) {
          const ho = asReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.dawnToDusk !== undefined) tagCounts.hoursOfOperation.dawnToDusk[ho.dawnToDusk]++;
          if (ho.specificHours) {
            tagCounts.hoursOfOperation.specificHours[ho.specificHours] = 
              (tagCounts.hoursOfOperation.specificHours[ho.specificHours] || 0) + 1;
          }
        }

        // Animal Type Selection
        if (asReview.animalTypeSelection) {
          const ats = asReview.animalTypeSelection;
          if (ats.availableAnimalTypes && Array.isArray(ats.availableAnimalTypes)) {
            ats.availableAnimalTypes.forEach(type => {
              if (tagCounts.animalTypeSelection.availableAnimalTypes[type] !== undefined) {
                tagCounts.animalTypeSelection.availableAnimalTypes[type]++;
              }
            });
          }
          if (ats.breedVariety) tagCounts.animalTypeSelection.breedVariety[ats.breedVariety]++;
          if (ats.ageRange && Array.isArray(ats.ageRange)) {
            ats.ageRange.forEach(age => {
              if (tagCounts.animalTypeSelection.ageRange[age] !== undefined) {
                tagCounts.animalTypeSelection.ageRange[age]++;
              }
            });
          }
        }

        // Animal Care & Welfare
        if (asReview.animalCareAndWelfare) {
          const acw = asReview.animalCareAndWelfare;
          if (acw.animalHealth) tagCounts.animalCareAndWelfare.animalHealth[acw.animalHealth]++;
          if (acw.livingConditions) tagCounts.animalCareAndWelfare.livingConditions[acw.livingConditions]++;
          if (acw.exercisePrograms !== undefined) tagCounts.animalCareAndWelfare.exercisePrograms[acw.exercisePrograms]++;
          if (acw.medicalCare) tagCounts.animalCareAndWelfare.medicalCare[acw.medicalCare]++;
          if (acw.behavioralAssessment !== undefined) tagCounts.animalCareAndWelfare.behavioralAssessment[acw.behavioralAssessment]++;
          if (acw.specialNeedsCare !== undefined) tagCounts.animalCareAndWelfare.specialNeedsCare[acw.specialNeedsCare]++;
        }

        // Adoption Process & Support
        if (asReview.adoptionProcessAndSupport) {
          const aps = asReview.adoptionProcessAndSupport;
          if (aps.applicationProcess) tagCounts.adoptionProcessAndSupport.applicationProcess[aps.applicationProcess]++;
          if (aps.processingTime) tagCounts.adoptionProcessAndSupport.processingTime[aps.processingTime]++;
          if (aps.homeVisitRequired !== undefined) tagCounts.adoptionProcessAndSupport.homeVisitRequired[aps.homeVisitRequired]++;
          if (aps.adoptionFees) tagCounts.adoptionProcessAndSupport.adoptionFees[aps.adoptionFees]++;
          if (aps.postAdoptionSupport !== undefined) tagCounts.adoptionProcessAndSupport.postAdoptionSupport[aps.postAdoptionSupport]++;
          if (aps.returnPolicy) tagCounts.adoptionProcessAndSupport.returnPolicy[aps.returnPolicy]++;
        }

        // Staff & Volunteer Quality
        if (asReview.staffAndVolunteerQuality) {
          const svq = asReview.staffAndVolunteerQuality;
          if (svq.staffKnowledge) tagCounts.staffAndVolunteerQuality.staffKnowledge[svq.staffKnowledge]++;
          if (svq.animalHandling) tagCounts.staffAndVolunteerQuality.animalHandling[svq.animalHandling]++;
          if (svq.customerService) tagCounts.staffAndVolunteerQuality.customerService[svq.customerService]++;
          if (svq.volunteerProgram !== undefined) tagCounts.staffAndVolunteerQuality.volunteerProgram[svq.volunteerProgram]++;
          if (svq.staffTraining !== undefined) tagCounts.staffAndVolunteerQuality.staffTraining[svq.staffTraining]++;
          if (svq.compassionLevel) tagCounts.staffAndVolunteerQuality.compassionLevel[svq.compassionLevel]++;
        }
      }
    });

    return tagCounts;
  };

  // Render smart category tags for animal shelters
  const renderSmartAnimalShelterCategoryTags = (category, tagCounts) => {

    const tagMappings = {
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "difficult", label: "🚗 Difficult Parking" },
        { category: "accessAndLocation", field: "handicapFriendly", value: true, label: "♿ Handicap Friendly" },
      ],
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
        { category: "hoursOfOperation", field: "dawnToDusk", value: true, label: "🌅 Dawn to Dusk" },
      ],
      animalTypeSelection: [
        { category: "animalTypeSelection", field: "availableAnimalTypes", value: "dogs", label: "🐕 Dogs Available" },
        { category: "animalTypeSelection", field: "availableAnimalTypes", value: "cats", label: "🐱 Cats Available" },
        { category: "animalTypeSelection", field: "availableAnimalTypes", value: "rabbits", label: "🐰 Rabbits Available" },
        { category: "animalTypeSelection", field: "breedVariety", value: "excellent", label: "🎯 Great Breed Variety" },
      ],
      animalCareAndWelfare: [
        { category: "animalCareAndWelfare", field: "animalHealth", value: "excellent", label: "❤️ Excellent Health" },
        { category: "animalCareAndWelfare", field: "livingConditions", value: "excellent", label: "🏠 Great Conditions" },
        { category: "animalCareAndWelfare", field: "exercisePrograms", value: true, label: "🏃 Exercise Programs" },
        { category: "animalCareAndWelfare", field: "medicalCare", value: "excellent", label: "🏥 Excellent Medical Care" },
      ],
      adoptionProcessAndSupport: [
        { category: "adoptionProcessAndSupport", field: "applicationProcess", value: "easy", label: "📝 Easy Application" },
        { category: "adoptionProcessAndSupport", field: "processingTime", value: "same_day", label: "⚡ Same Day Processing" },
        { category: "adoptionProcessAndSupport", field: "adoptionFees", value: "low", label: "💰 Low Fees" },
        { category: "adoptionProcessAndSupport", field: "postAdoptionSupport", value: true, label: "🤝 Post-Adoption Support" },
      ],
      staffAndVolunteerQuality: [
        { category: "staffAndVolunteerQuality", field: "staffKnowledge", value: "excellent", label: "🧠 Expert Staff" },
        { category: "staffAndVolunteerQuality", field: "animalHandling", value: "excellent", label: "🐾 Great Animal Handling" },
        { category: "staffAndVolunteerQuality", field: "volunteerProgram", value: true, label: "👥 Volunteer Program" },
        { category: "staffAndVolunteerQuality", field: "compassionLevel", value: "excellent", label: "💖 Very Compassionate" },
      ],
    };

    const mapping = tagMappings[category];
    if (!mapping) return [];

    // Calculate popularity scores and sort
    const tagsWithScores = mapping.map((tag) => {
      const count = tagCounts[tag.category]?.[tag.field]?.[tag.value] || 0;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return {
        ...tag,
        count,
        percentage,
        styleClass: getTagStyle(tag.category, tag.field, tag.value, tagCounts),
      };
    });

    // Sort by count (popular first) and limit to 4 tags
    const sortedTags = tagsWithScores.sort((a, b) => b.count - a.count).slice(0, 4);

    return sortedTags.map((tag) => (
      <span
        key={`${tag.field}-${tag.value}`}
        className={tag.styleClass}
        title={
          tag.count > 0
            ? `${tag.count} review${tag.count !== 1 ? "s" : ""} mention this`
            : "No reviews mention this yet"
        }
      >
        {tag.label}
        {tag.count > 0 && <span className="tag-count"> ({tag.count})</span>}
      </span>
    ));



  };

  // Loading state
  if (loading) {
    return (
      <div className="place-details-container">
        <div className="loading-card">
          <h2>🔄 LOADING PLACE...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !place) {
    return (
      <div className="place-details-container">
        <div className="error-card">
          <h2>❌ ERROR</h2>
          <p>{error || "Place not found"}</p>
          <button className="brutal-button" onClick={() => navigate(-1)}>
            ← GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-details-container">
      {/* Header Section */}
      <div className="place-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← BACK
        </button>
        <div className="place-title-inline">
          <h1>{place.name}</h1>
          <div className="place-type">

            <span className="type-label">{locationTypes[place.type]?.label || place.type}</span>
          </div>
          <div className="place-address">
            {place.address && <span className="address-line">📍 {place.address}</span>}
            {!place.address && place.coordinates && (
              <span className="address-line">
                📍 {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
              </span>
            )}
            {!place.address && !place.coordinates && <span className="address-line">📍 Address not available</span>}
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="hero-image-section">
        <div className="hero-placeholder">
          <span className="hero-icon">{locationTypes[place.type]?.icon || "📍"}</span>
          <h2>PLACE IMAGE</h2>
        </div>
      </div>

      {/* Dog Park Categories Overview - Show all 8 categories with available options */}

      {(place.type === "dog park" || place.type === "dog_park") && (
        <div className="categories-overview">


          {/* Show review statistics if available */}
          {dogParkStats && dogParkStats.totalReviews > 0 && (
            <div className="review-stats-summary">
              <h3>📊 REVIEW SUMMARY ({dogParkStats.totalReviews} reviews)</h3>
              <p>
                Average Rating: <strong>{dogParkStats.averageRating}/5 ⭐</strong>
              </p>
            </div>
          )}

          <div className="category-tags-grid">
            {/* 1. Access & Location */}
            <div className="category-section">
              <h3>📍 Access & Location</h3>

              <div className="feature-tags">{renderSmartCategoryTags("accessAndLocation", analyzeReviewTags())}</div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>⏰ Hours of Operation</h3>

              <div className="feature-tags">{renderSmartCategoryTags("hoursOfOperation", analyzeReviewTags())}</div>
            </div>

            {/* 3. Safety Level */}
            <div className="category-section">
              <h3>🛡️ Safety Level</h3>

              <div className="feature-tags">{renderSmartCategoryTags("safetyLevel", analyzeReviewTags())}</div>
            </div>

            {/* 4. Size & Layout */}
            <div className="category-section">
              <h3>📏 Size & Layout</h3>

              <div className="feature-tags">{renderSmartCategoryTags("sizeAndLayout", analyzeReviewTags())}</div>
            </div>

            {/* 5. Amenities & Facilities */}
            <div className="category-section">
              <h3>🎾 Amenities & Facilities</h3>

              <div className="feature-tags">
                {renderSmartCategoryTags("amenitiesAndFacilities", analyzeReviewTags())}
              </div>
            </div>

            {/* 6. Maintenance & Cleanliness */}
            <div className="category-section">
              <h3>🧹 Maintenance & Cleanliness</h3>

              <div className="feature-tags">
                {renderSmartCategoryTags("maintenanceAndCleanliness", analyzeReviewTags())}
              </div>
            </div>

            {/* 7. Crowd & Social Dynamics */}
            <div className="category-section">
              <h3>👥 Crowd & Social Dynamics</h3>

              <div className="feature-tags">
                {renderSmartCategoryTags("crowdAndSocialDynamics", analyzeReviewTags())}
              </div>
            </div>

            {/* 8. Rules, Policies & Community */}
            <div className="category-section">
              <h3>📋 Rules, Policy & Community</h3>

              <div className="feature-tags">
                {renderSmartCategoryTags("rulesPoliciesAndCommunity", analyzeReviewTags())}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vet Clinic Categories Overview - Show all 7 categories with available options */}
      {(place.type === "vet" || place.type === "veterinary") && (

        <div className="categories-overview">


          {/* Show review statistics if available */}
          {vetClinicStats && vetClinicStats.totalReviews > 0 && (
            <div className="review-stats-summary">
              <h3>📊 REVIEW SUMMARY ({vetClinicStats.totalReviews} reviews)</h3>
              <p>
                Average Rating: <strong>{vetClinicStats.averageRating}/5 ⭐</strong>
              </p>
            </div>
          )}

          <div className="category-tags-grid">
            {/* 1. Clinic Environment & Facilities */}
            <div className="category-section">
              <h3>🏢 Environment & Facilities</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("clinicEnvironmentAndFacilities", analyzeVetReviewTags())}</div>
            </div>

            {/* 2. Cost & Transparency */}
            <div className="category-section">
              <h3>💰 Cost & Transparency</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("costAndTransparency", analyzeVetReviewTags())}</div>
            </div>

            {/* 3. Medical Staff & Services */}
            <div className="category-section">
              <h3>👨‍⚕️ Medical Staff & Services</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("medicalStaffAndServices", analyzeVetReviewTags())}</div>
            </div>

            {/* 4. Scheduling & Communication */}
            <div className="category-section">
              <h3>📅 Scheduling & Communication</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("schedulingAndCommunication", analyzeVetReviewTags())}</div>
            </div>

            {/* 5. Emergency & After-Hours Care */}
            <div className="category-section">
              <h3>🚨 Emergency & After-Hours</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("emergencyAndAfterHours", analyzeVetReviewTags())}</div>
            </div>

            {/* 6. Owner Involvement */}
            <div className="category-section">
              <h3>👨‍👩‍👧‍👦 Owner Involvement</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("ownerInvolvement", analyzeVetReviewTags())}</div>
            </div>

            {/* 7. Reputation & Community */}
            <div className="category-section">
              <h3>🌟 Reputation & Community</h3>

              <div className="feature-tags">{renderSmartVetCategoryTags("reputationAndCommunity", analyzeVetReviewTags())}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Store Categories Overview - Show all 6 categories with available options */}
      {(place.type === "pet store" || place.type === "pet_store") && (

        <div className="categories-overview">


          {/* Show review statistics if available */}
          {petStoreStats && petStoreStats.totalReviews > 0 && (
            <div className="review-stats-summary">
              <h3>📊 REVIEW SUMMARY ({petStoreStats.totalReviews} reviews)</h3>
              <p>
                Average Rating: <strong>{petStoreStats.averageRating}/5 ⭐</strong>
              </p>
            </div>
          )}

          <div className="category-tags-grid">
            {/* 1. Access & Location */}
            <div className="category-section">
              <h3>📍 Access & Location</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("accessAndLocation", analyzePetStoreReviewTags())}</div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>⏰ Hours of Operation</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("hoursOfOperation", analyzePetStoreReviewTags())}</div>
            </div>

            {/* 3. Services & Conveniences */}
            <div className="category-section">
              <h3>🛎️ Services & Conveniences</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("servicesAndConveniences", analyzePetStoreReviewTags())}</div>
            </div>

            {/* 4. Product Selection & Quality */}
            <div className="category-section">
              <h3>🛍️ Product Selection & Quality</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("productSelectionAndQuality", analyzePetStoreReviewTags())}</div>
            </div>

            {/* 5. Pricing & Value */}
            <div className="category-section">
              <h3>💰 Pricing & Value</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("pricingAndValue", analyzePetStoreReviewTags())}</div>
            </div>

            {/* 6. Staff Knowledge & Service */}
            <div className="category-section">
              <h3>👥 Staff Knowledge & Service</h3>

              <div className="feature-tags">{renderSmartPetStoreCategoryTags("staffKnowledgeAndService", analyzePetStoreReviewTags())}</div>
            </div>
          </div>
        </div>
      )}

      {/* Animal Shelter Categories Overview - Show all 6 categories with available options */}
      {(place.type === "shelter" || place.type === "animal_shelter") && (

        <div className="categories-overview">


          {/* Show review statistics if available */}
          {animalShelterStats && animalShelterStats.totalReviews > 0 && (
            <div className="review-stats-summary">
              <h3>📊 REVIEW SUMMARY ({animalShelterStats.totalReviews} reviews)</h3>
              <p>
                Average Rating: <strong>{animalShelterStats.averageRating}/5 ⭐</strong>
              </p>
            </div>
          )}

          <div className="category-tags-grid">
            {/* 1. Access & Location */}
            <div className="category-section">
              <h3>📍 Access & Location</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("accessAndLocation", analyzeAnimalShelterReviewTags())}</div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>⏰ Hours of Operation</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("hoursOfOperation", analyzeAnimalShelterReviewTags())}</div>
            </div>

            {/* 3. Animal Type Selection */}
            <div className="category-section">
              <h3>🐾 Animal Type Selection</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("animalTypeSelection", analyzeAnimalShelterReviewTags())}</div>
            </div>

            {/* 4. Animal Care & Welfare */}
            <div className="category-section">
              <h3>❤️ Animal Care & Welfare</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("animalCareAndWelfare", analyzeAnimalShelterReviewTags())}</div>
            </div>

            {/* 5. Adoption Process & Support */}
            <div className="category-section">
              <h3>📋 Adoption Process & Support</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("adoptionProcessAndSupport", analyzeAnimalShelterReviewTags())}</div>
            </div>

            {/* 6. Staff & Volunteer Quality */}
            <div className="category-section">
              <h3>👥 Staff & Volunteer Quality</h3>

              <div className="feature-tags">{renderSmartAnimalShelterCategoryTags("staffAndVolunteerQuality", analyzeAnimalShelterReviewTags())}</div>
            </div>
          </div>
        </div>
      )}

      {/* Place Information Cards */}
      <div className="info-cards-grid">
        {/* Contact Info Card */}
        {(place.phone || place.website || place.opening_hours) && (
          <div className="info-card">
            <h3>📞 CONTACT</h3>
            {place.phone && <p>📞 {place.phone}</p>}
            {place.website && (
              <p>
                <a href={place.website} target="_blank" rel="noopener noreferrer" className="website-link">
                  🌐 Website
                </a>
              </p>
            )}
            {place.opening_hours && <p>🕐 {place.opening_hours}</p>}
          </div>
        )}

        {/* Tags Card */}
        {place.tags && place.tags.length > 0 && (
          <div className="info-card">
            <h3>🏷️ FEATURES</h3>
            <div className="tags-list">
              {place.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Review Call-to-Action for OSM locations */}
      {place.isOSMLocation && (
        <div className="osm-review-cta">

          <h2>🎯 SHARE YOUR EXPERIENCE!</h2>
          <p>
            Help other pet owners discover this place.
          </p>

        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>📝 REVIEWS ({reviews.length})</h2>
          {mongoUser ? (
            <button
              className="add-review-button"
              onClick={() => {
                console.log(`🔴 Toggling review form: ${showReviewForm} -> ${!showReviewForm}`);
                setShowReviewForm(!showReviewForm);
              }}
            >
              {showReviewForm ? "✖ CANCEL" : "+ ADD REVIEW"}
            </button>
          ) : (
            <button
              className="add-review-button login-required"
              onClick={() => {
                alert("Please log in to add a review. You will be redirected to the login page.");
                navigate("/login");
              }}
            >
              🔐 LOG IN TO REVIEW
            </button>
          )}
        </div>

        {/* Add Review Form */}
        {showReviewForm && (
          <div className="review-form-card">
            <h3>ADD YOUR REVIEW</h3>
            <form onSubmit={handleReviewSubmit}>
              {/* Overall Rating */}
              <div className="form-group">
                <label>⭐ Overall Rating</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${reviewForm.rating >= star ? "active" : ""}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="form-group">
                <label>💬 Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>

              {/* Image Upload Section */}
              <div className="form-group">
                <label>📷 Add Photos (Optional)</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    id="image-upload"
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="image-upload" className="upload-button">
                    {uploading ? "Uploading..." : "Choose Images"}
                  </label>
                  <p className="upload-info">Maximum 5 images, 5MB each. Supported: JPEG, PNG, GIF, WebP</p>

                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <h5>Selected Images ({selectedFiles.length}/5):</h5>
                      <div className="file-previews">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="file-preview">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="preview-image"
                            />
                            <span className="file-name">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="remove-file"
                              disabled={uploading}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dog Park Specific Form - All 8 Categories */}

              {(place.type === "dog park" || place.type === "dog_park") && (

                <div className="dog-park-form">
                  <h4>🐕 DOG PARK DETAILS</h4>

                  {/* 1. Access & Location */}
                  <div className="form-section">
                    <h5>📍 Access & Location</h5>
                    <div className="form-group">
                      <label>Parking Difficulty</label>
                      <select
                        value={reviewForm.dogParkReview.accessAndLocation.parkingDifficulty}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              accessAndLocation: {
                                ...reviewForm.dogParkReview.accessAndLocation,
                                parkingDifficulty: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="difficult">Difficult</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.accessAndLocation.handicapFriendly}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                accessAndLocation: {
                                  ...reviewForm.dogParkReview.accessAndLocation,
                                  handicapFriendly: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Handicap Friendly
                      </label>
                    </div>
                  </div>

                  {/* 2. Hours of Operation */}
                  <div className="form-section">
                    <h5>⏰ Hours of Operation</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.hoursOfOperation.is24Hours}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                hoursOfOperation: {
                                  ...reviewForm.dogParkReview.hoursOfOperation,
                                  is24Hours: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open 24/7
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.hoursOfOperation.dawnToDusk}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                hoursOfOperation: {
                                  ...reviewForm.dogParkReview.hoursOfOperation,
                                  dawnToDusk: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Dawn to Dusk
                      </label>
                    </div>
                  </div>

                  {/* 3. Safety Level */}
                  <div className="form-section">
                    <h5>🛡️ Safety Level</h5>
                    <div className="form-group">
                      <label>Fencing Condition</label>
                      <select
                        value={reviewForm.dogParkReview.safetyLevel.fencingCondition}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              safetyLevel: {
                                ...reviewForm.dogParkReview.safetyLevel,
                                fencingCondition: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="fully_enclosed">Fully Enclosed</option>
                        <option value="partially_enclosed">Partially Enclosed</option>
                        <option value="not_enclosed">Not Enclosed</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.safetyLevel.doubleGated}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                safetyLevel: {
                                  ...reviewForm.dogParkReview.safetyLevel,
                                  doubleGated: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Double Gated Entry
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.safetyLevel.nightIllumination}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                safetyLevel: {
                                  ...reviewForm.dogParkReview.safetyLevel,
                                  nightIllumination: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Night Lighting
                      </label>
                    </div>
                  </div>

                  {/* 4. Size & Layout */}
                  <div className="form-section">
                    <h5>📏 Size & Layout</h5>
                    <div className="form-group">
                      <label>Separate Areas</label>
                      <select
                        value={reviewForm.dogParkReview.sizeAndLayout.separateAreas}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              sizeAndLayout: {
                                ...reviewForm.dogParkReview.sizeAndLayout,
                                separateAreas: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="yes_small_large">Yes (Small/Large)</option>
                        <option value="yes_other">Yes (Other)</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Running Space</label>
                      <select
                        value={reviewForm.dogParkReview.sizeAndLayout.runningSpace}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              sizeAndLayout: {
                                ...reviewForm.dogParkReview.sizeAndLayout,
                                runningSpace: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="enough">Enough</option>
                        <option value="limited">Limited</option>
                        <option value="tight">Tight</option>
                      </select>
                    </div>
                  </div>

                  {/* 5. Amenities & Facilities */}
                  <div className="form-section">
                    <h5>🎾 Amenities & Facilities</h5>
                    <div className="form-group">
                      <label>Seating Level</label>
                      <select
                        value={reviewForm.dogParkReview.amenitiesAndFacilities.seatingLevel}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              amenitiesAndFacilities: {
                                ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                seatingLevel: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="bench">Bench</option>
                        <option value="gazebo">Gazebo</option>
                        <option value="no_seat">No Seat</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.amenitiesAndFacilities.wasteStation}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                amenitiesAndFacilities: {
                                  ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                  wasteStation: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Waste Station
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.amenitiesAndFacilities.restroom}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                amenitiesAndFacilities: {
                                  ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                  restroom: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Restroom Available
                      </label>
                    </div>
                  </div>

                  {/* 6. Maintenance & Cleanliness */}
                  <div className="form-section">
                    <h5>🧹 Maintenance & Cleanliness</h5>
                    <div className="form-group">
                      <label>Overall Cleanliness</label>
                      <select
                        value={reviewForm.dogParkReview.maintenanceAndCleanliness.overallCleanliness}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              maintenanceAndCleanliness: {
                                ...reviewForm.dogParkReview.maintenanceAndCleanliness,
                                overallCleanliness: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="good">Good</option>
                        <option value="neutral">Neutral</option>
                        <option value="bad">Bad</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trash Level</label>
                      <select
                        value={reviewForm.dogParkReview.maintenanceAndCleanliness.trashLevel}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              maintenanceAndCleanliness: {
                                ...reviewForm.dogParkReview.maintenanceAndCleanliness,
                                trashLevel: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="clean">Clean</option>
                        <option value="moderate">Moderate</option>
                        <option value="dirty">Dirty</option>
                      </select>
                    </div>
                  </div>

                  {/* 7. Crowd & Social Dynamics */}
                  <div className="form-section">
                    <h5>👥 Crowd & Social Dynamics</h5>
                    <div className="form-group">
                      <label>Owner Friendliness</label>
                      <select
                        value={reviewForm.dogParkReview.crowdAndSocialDynamics.ownerFriendliness}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              crowdAndSocialDynamics: {
                                ...reviewForm.dogParkReview.crowdAndSocialDynamics,
                                ownerFriendliness: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="very_friendly">Very Friendly</option>
                        <option value="friendly">Friendly</option>
                        <option value="neutral">Neutral</option>
                        <option value="unfriendly">Unfriendly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Peak Hours</label>
                      <input
                        type="text"
                        value={reviewForm.dogParkReview.crowdAndSocialDynamics.peakHours}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              crowdAndSocialDynamics: {
                                ...reviewForm.dogParkReview.crowdAndSocialDynamics,
                                peakHours: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., 5-7 PM"
                      />
                    </div>
                  </div>

                  {/* 8. Rules, Policies & Community */}
                  <div className="form-section">
                    <h5>📋 Rules, Policy & Community</h5>
                    <div className="form-group">
                      <label>Leash Policy</label>
                      <select
                        value={reviewForm.dogParkReview.rulesPoliciesAndCommunity.leashPolicy}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              rulesPoliciesAndCommunity: {
                                ...reviewForm.dogParkReview.rulesPoliciesAndCommunity,
                                leashPolicy: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="off_leash_allowed">Off-leash Allowed</option>
                        <option value="leash_required">Leash Required</option>
                        <option value="mixed_areas">Mixed Areas</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.rulesPoliciesAndCommunity.vaccinationRequired}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                rulesPoliciesAndCommunity: {
                                  ...reviewForm.dogParkReview.rulesPoliciesAndCommunity,
                                  vaccinationRequired: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Vaccination Required
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Vet Clinic Specific Form - All 7 Categories */}
              {(place.type === "vet" || place.type === "veterinary") && (
                <div className="vet-clinic-form">
                  <h4>🏥 VET CLINIC DETAILS</h4>

                  {/* 1. Clinic Environment & Facilities */}
                  <div className="form-section">
                    <h5>🏢 Environment & Facilities</h5>
                    <div className="form-group">
                      <label>Cleanliness</label>
                      <select
                        value={reviewForm.vetClinicReview.clinicEnvironmentAndFacilities.cleanliness}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              clinicEnvironmentAndFacilities: {
                                ...reviewForm.vetClinicReview.clinicEnvironmentAndFacilities,
                                cleanliness: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Comfort Level</label>
                      <select
                        value={reviewForm.vetClinicReview.clinicEnvironmentAndFacilities.comfortLevel}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              clinicEnvironmentAndFacilities: {
                                ...reviewForm.vetClinicReview.clinicEnvironmentAndFacilities,
                                comfortLevel: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="very_comfortable">Very Comfortable</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="neutral">Neutral</option>
                        <option value="uncomfortable">Uncomfortable</option>
                      </select>
                    </div>
                  </div>

                  {/* 2. Cost & Transparency */}
                  <div className="form-section">
                    <h5>💰 Cost & Transparency</h5>
                    <div className="form-group">
                      <label>Routine Checkup Cost</label>
                      <select
                        value={reviewForm.vetClinicReview.costAndTransparency.routineCheckupCost}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              costAndTransparency: {
                                ...reviewForm.vetClinicReview.costAndTransparency,
                                routineCheckupCost: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="very_high">Very High</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.costAndTransparency.feesExplainedUpfront}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                costAndTransparency: {
                                  ...reviewForm.vetClinicReview.costAndTransparency,
                                  feesExplainedUpfront: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Fees Explained Upfront
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.costAndTransparency.insuranceAccepted}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                costAndTransparency: {
                                  ...reviewForm.vetClinicReview.costAndTransparency,
                                  insuranceAccepted: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Insurance Accepted
                      </label>
                    </div>
                  </div>

                  {/* 3. Medical Staff & Services */}
                  <div className="form-section">
                    <h5>👨‍⚕️ Medical Staff & Services</h5>
                    <div className="form-group">
                      <label>Veterinarian Attitude</label>
                      <select
                        value={reviewForm.vetClinicReview.medicalStaffAndServices.veterinarianAttitude}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              medicalStaffAndServices: {
                                ...reviewForm.vetClinicReview.medicalStaffAndServices,
                                veterinarianAttitude: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.medicalStaffAndServices.surgeryOrthopedics}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                medicalStaffAndServices: {
                                  ...reviewForm.vetClinicReview.medicalStaffAndServices,
                                  surgeryOrthopedics: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Surgery/Orthopedics Available
                      </label>
                    </div>
                  </div>

                  {/* 4. Scheduling & Communication */}
                  <div className="form-section">
                    <h5>📅 Scheduling & Communication</h5>
                    <div className="form-group">
                      <label>Response Time</label>
                      <select
                        value={reviewForm.vetClinicReview.schedulingAndCommunication.responseTime}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              schedulingAndCommunication: {
                                ...reviewForm.vetClinicReview.schedulingAndCommunication,
                                responseTime: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="immediate">Immediate</option>
                        <option value="same_day">Same Day</option>
                        <option value="next_day">Next Day</option>
                        <option value="several_days">Several Days</option>
                      </select>
                    </div>
                  </div>

                  {/* 5. Emergency & After-Hours */}
                  <div className="form-section">
                    <h5>🚨 Emergency & After-Hours</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.emergencyAndAfterHours.openWeekends}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                emergencyAndAfterHours: {
                                  ...reviewForm.vetClinicReview.emergencyAndAfterHours,
                                  openWeekends: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open Weekends
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.emergencyAndAfterHours.onCallEmergencyNumber}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                emergencyAndAfterHours: {
                                  ...reviewForm.vetClinicReview.emergencyAndAfterHours,
                                  onCallEmergencyNumber: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Emergency On-Call Number
                      </label>
                    </div>
                  </div>

                  {/* 6. Owner Involvement */}
                  <div className="form-section">
                    <h5>👨‍👩‍👧‍👦 Owner Involvement</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.ownerInvolvement.allowedDuringExams}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                ownerInvolvement: {
                                  ...reviewForm.vetClinicReview.ownerInvolvement,
                                  allowedDuringExams: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Allowed During Exams
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.ownerInvolvement.explainsProceduresWell}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                ownerInvolvement: {
                                  ...reviewForm.vetClinicReview.ownerInvolvement,
                                  explainsProceduresWell: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Explains Procedures Well
                      </label>
                    </div>
                  </div>

                  {/* 7. Reputation & Community */}
                  <div className="form-section">
                    <h5>🌟 Reputation & Community</h5>
                    <div className="form-group">
                      <label>Community Involvement</label>
                      <select
                        value={reviewForm.vetClinicReview.reputationAndCommunity.communityInvolvement}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              reputationAndCommunity: {
                                ...reviewForm.vetClinicReview.reputationAndCommunity,
                                communityInvolvement: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                        <option value="low">Low</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.reputationAndCommunity.hostsVaccineClinic}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                reputationAndCommunity: {
                                  ...reviewForm.vetClinicReview.reputationAndCommunity,
                                  hostsVaccineClinic: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Hosts Vaccine Clinics
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pet Store Specific Form - All 6 Categories */}
              {place.type === "pet_store" && (
                <div className="pet-store-form">
                  <h4>🛍️ PET STORE DETAILS</h4>

                  {/* 1. Access & Location */}
                  <div className="form-section">
                    <h5>🅿️ Access & Location</h5>
                    <div className="form-group">
                      <label>Parking Availability</label>
                      <select
                        value={reviewForm.petStoreReview.accessAndLocation.parkingAvailability}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              accessAndLocation: {
                                ...reviewForm.petStoreReview.accessAndLocation,
                                parkingAvailability: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="limited">Limited</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.accessAndLocation.publicTransportAccess}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                accessAndLocation: {
                                  ...reviewForm.petStoreReview.accessAndLocation,
                                  publicTransportAccess: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Public Transport Access
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.accessAndLocation.wheelchairAccessible}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                accessAndLocation: {
                                  ...reviewForm.petStoreReview.accessAndLocation,
                                  wheelchairAccessible: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Wheelchair Accessible
                      </label>
                    </div>
                  </div>

                  {/* 2. Hours of Operation */}
                  <div className="form-section">
                    <h5>🕐 Hours of Operation</h5>
                    <div className="form-group">
                      <label>Convenient Hours</label>
                      <select
                        value={reviewForm.petStoreReview.hoursOfOperation.convenientHours}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              hoursOfOperation: {
                                ...reviewForm.petStoreReview.hoursOfOperation,
                                convenientHours: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="very_convenient">Very Convenient</option>
                        <option value="convenient">Convenient</option>
                        <option value="somewhat_convenient">Somewhat Convenient</option>
                        <option value="inconvenient">Inconvenient</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.hoursOfOperation.openLateEvenings}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                hoursOfOperation: {
                                  ...reviewForm.petStoreReview.hoursOfOperation,
                                  openLateEvenings: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open Late Evenings
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.hoursOfOperation.openWeekends}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                hoursOfOperation: {
                                  ...reviewForm.petStoreReview.hoursOfOperation,
                                  openWeekends: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open Weekends
                      </label>
                    </div>
                  </div>

                  {/* 3. Services & Conveniences */}
                  <div className="form-section">
                    <h5>🔧 Services & Conveniences</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.servicesAndConveniences.groomingServices}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                servicesAndConveniences: {
                                  ...reviewForm.petStoreReview.servicesAndConveniences,
                                  groomingServices: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Grooming Services
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.servicesAndConveniences.veterinaryServices}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                servicesAndConveniences: {
                                  ...reviewForm.petStoreReview.servicesAndConveniences,
                                  veterinaryServices: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Veterinary Services
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.servicesAndConveniences.deliveryService}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                servicesAndConveniences: {
                                  ...reviewForm.petStoreReview.servicesAndConveniences,
                                  deliveryService: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Delivery Service
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.servicesAndConveniences.onlineOrdering}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                servicesAndConveniences: {
                                  ...reviewForm.petStoreReview.servicesAndConveniences,
                                  onlineOrdering: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Online Ordering
                      </label>
                    </div>
                  </div>

                  {/* 4. Product Selection & Quality */}
                  <div className="form-section">
                    <h5>📦 Product Selection & Quality</h5>
                    <div className="form-group">
                      <label>Food Quality</label>
                      <select
                        value={reviewForm.petStoreReview.productSelectionAndQuality.foodQuality}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              productSelectionAndQuality: {
                                ...reviewForm.petStoreReview.productSelectionAndQuality,
                                foodQuality: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="premium">Premium</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Product Variety</label>
                      <select
                        value={reviewForm.petStoreReview.productSelectionAndQuality.productVariety}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              productSelectionAndQuality: {
                                ...reviewForm.petStoreReview.productSelectionAndQuality,
                                productVariety: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="limited">Limited</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.productSelectionAndQuality.organicOptions}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                productSelectionAndQuality: {
                                  ...reviewForm.petStoreReview.productSelectionAndQuality,
                                  organicOptions: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Organic Options
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.productSelectionAndQuality.localProducts}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                productSelectionAndQuality: {
                                  ...reviewForm.petStoreReview.productSelectionAndQuality,
                                  localProducts: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Local Products
                      </label>
                    </div>
                  </div>

                  {/* 5. Pricing & Value */}
                  <div className="form-section">
                    <h5>💰 Pricing & Value</h5>
                    <div className="form-group">
                      <label>Overall Pricing</label>
                      <select
                        value={reviewForm.petStoreReview.pricingAndValue.overallPricing}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              pricingAndValue: {
                                ...reviewForm.petStoreReview.pricingAndValue,
                                overallPricing: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="very_affordable">Very Affordable</option>
                        <option value="affordable">Affordable</option>
                        <option value="expensive">Expensive</option>
                        <option value="very_expensive">Very Expensive</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.pricingAndValue.loyaltyProgram}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                pricingAndValue: {
                                  ...reviewForm.petStoreReview.pricingAndValue,
                                  loyaltyProgram: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Loyalty Program
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.pricingAndValue.frequentPromotions}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                pricingAndValue: {
                                  ...reviewForm.petStoreReview.pricingAndValue,
                                  frequentPromotions: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Frequent Promotions
                      </label>
                    </div>
                  </div>

                  {/* 6. Staff Knowledge & Service */}
                  <div className="form-section">
                    <h5>👥 Staff Knowledge & Service</h5>
                    <div className="form-group">
                      <label>Staff Helpfulness</label>
                      <select
                        value={reviewForm.petStoreReview.staffKnowledgeAndService.staffHelpfulness}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              staffKnowledgeAndService: {
                                ...reviewForm.petStoreReview.staffKnowledgeAndService,
                                staffHelpfulness: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Pet Knowledge</label>
                      <select
                        value={reviewForm.petStoreReview.staffKnowledgeAndService.petKnowledge}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              staffKnowledgeAndService: {
                                ...reviewForm.petStoreReview.staffKnowledgeAndService,
                                petKnowledge: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="expert">Expert</option>
                        <option value="knowledgeable">Knowledgeable</option>
                        <option value="basic">Basic</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.petStoreReview.staffKnowledgeAndService.personalizedRecommendations}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              petStoreReview: {
                                ...reviewForm.petStoreReview,
                                staffKnowledgeAndService: {
                                  ...reviewForm.petStoreReview.staffKnowledgeAndService,
                                  personalizedRecommendations: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Personalized Recommendations
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Animal Shelter Specific Form - All 6 Categories */}
              {(place.type === "animal_shelter" || place.type === "shelter") && (
                <div className="animal-shelter-form">
                  <h4>🏠 ANIMAL SHELTER DETAILS</h4>

                  {/* 1. Access & Location */}
                  <div className="form-section">
                    <h5>🅿️ Access & Location</h5>
                    <div className="form-group">
                      <label>Parking & Accessibility</label>
                      <select
                        value={reviewForm.animalShelterReview.accessAndLocation.parkingAndAccessibility}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              accessAndLocation: {
                                ...reviewForm.animalShelterReview.accessAndLocation,
                                parkingAndAccessibility: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="limited">Limited</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.accessAndLocation.publicTransportNearby}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                accessAndLocation: {
                                  ...reviewForm.animalShelterReview.accessAndLocation,
                                  publicTransportNearby: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Public Transport Nearby
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.accessAndLocation.easyToFind}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                accessAndLocation: {
                                  ...reviewForm.animalShelterReview.accessAndLocation,
                                  easyToFind: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Easy to Find
                      </label>
                    </div>
                  </div>

                  {/* 2. Hours of Operation */}
                  <div className="form-section">
                    <h5>🕐 Hours of Operation</h5>
                    <div className="form-group">
                      <label>Shelter Hours and Availability</label>
                      <select
                        value={reviewForm.animalShelterReview.hoursOfOperation.shelterHoursAndAvailability}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              hoursOfOperation: {
                                ...reviewForm.animalShelterReview.hoursOfOperation,
                                shelterHoursAndAvailability: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="very_convenient">Very Convenient</option>
                        <option value="convenient">Convenient</option>
                        <option value="limited">Limited</option>
                        <option value="inconvenient">Inconvenient</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.hoursOfOperation.weekendHours}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                hoursOfOperation: {
                                  ...reviewForm.animalShelterReview.hoursOfOperation,
                                  weekendHours: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Weekend Hours
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.hoursOfOperation.appointmentRequired}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                hoursOfOperation: {
                                  ...reviewForm.animalShelterReview.hoursOfOperation,
                                  appointmentRequired: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Appointment Required
                      </label>
                    </div>
                  </div>

                  {/* 3. Animal Type Selection */}
                  <div className="form-section">
                    <h5>🐾 Animal Type Selection</h5>
                    <div className="form-group">
                      <label>Available Animals and Breed Variety</label>
                      <select
                        value={reviewForm.animalShelterReview.animalTypeSelection.availableAnimalsAndBreedVariety}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              animalTypeSelection: {
                                ...reviewForm.animalShelterReview.animalTypeSelection,
                                availableAnimalsAndBreedVariety: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="limited">Limited</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.animalTypeSelection.dogsAvailable}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                animalTypeSelection: {
                                  ...reviewForm.animalShelterReview.animalTypeSelection,
                                  dogsAvailable: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Dogs Available
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.animalTypeSelection.catsAvailable}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                animalTypeSelection: {
                                  ...reviewForm.animalShelterReview.animalTypeSelection,
                                  catsAvailable: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Cats Available
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.animalTypeSelection.otherAnimals}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                animalTypeSelection: {
                                  ...reviewForm.animalShelterReview.animalTypeSelection,
                                  otherAnimals: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Other Animals Available
                      </label>
                    </div>
                  </div>

                  {/* 4. Animal Care & Welfare */}
                  <div className="form-section">
                    <h5>❤️ Animal Care & Welfare</h5>
                    <div className="form-group">
                      <label>Animal Health and Living Conditions</label>
                      <select
                        value={reviewForm.animalShelterReview.animalCareAndWelfare.animalHealthAndLivingConditions}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              animalCareAndWelfare: {
                                ...reviewForm.animalShelterReview.animalCareAndWelfare,
                                animalHealthAndLivingConditions: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="concerning">Concerning</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.animalCareAndWelfare.medicalCareProvided}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                animalCareAndWelfare: {
                                  ...reviewForm.animalShelterReview.animalCareAndWelfare,
                                  medicalCareProvided: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Medical Care Provided
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.animalCareAndWelfare.spayNeuterProgram}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                animalCareAndWelfare: {
                                  ...reviewForm.animalShelterReview.animalCareAndWelfare,
                                  spayNeuterProgram: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Spay/Neuter Program
                      </label>
                    </div>
                  </div>

                  {/* 5. Adoption Process & Support */}
                  <div className="form-section">
                    <h5>📋 Adoption Process & Support</h5>
                    <div className="form-group">
                      <label>Adoption Procedures and Support</label>
                      <select
                        value={reviewForm.animalShelterReview.adoptionProcessAndSupport.adoptionProceduresAndSupport}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              adoptionProcessAndSupport: {
                                ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                adoptionProceduresAndSupport: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="adequate">Adequate</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.adoptionProcessAndSupport.followUpSupport}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                adoptionProcessAndSupport: {
                                  ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                  followUpSupport: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Follow-up Support
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.adoptionProcessAndSupport.educationalResources}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                adoptionProcessAndSupport: {
                                  ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                  educationalResources: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Educational Resources
                      </label>
                    </div>
                  </div>

                  {/* 6. Staff & Volunteer Quality */}
                  <div className="form-section">
                    <h5>👨‍👩‍👧‍👦 Staff & Volunteer Quality</h5>
                    <div className="form-group">
                      <label>Staff Expertise and Volunteer Programs</label>
                      <select
                        value={reviewForm.animalShelterReview.staffAndVolunteerQuality.staffExpertiseAndVolunteerPrograms}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              staffAndVolunteerQuality: {
                                ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                staffExpertiseAndVolunteerPrograms: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="adequate">Adequate</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.staffAndVolunteerQuality.knowledgeableStaff}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                staffAndVolunteerQuality: {
                                  ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                  knowledgeableStaff: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Knowledgeable Staff
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.staffAndVolunteerQuality.activeVolunteers}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                staffAndVolunteerQuality: {
                                  ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                  activeVolunteers: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Active Volunteers
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="submit-review-button">
                SUBMIT REVIEW
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="empty-reviews">
              <h3>NO REVIEWS YET</h3>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review-card-simple">
                <div className="review-simple-content">
                  <span className="reviewer-name">{review.userId?.name || "Anonymous"}</span>
                  <span className="review-rating">{"⭐".repeat(review.rating)}</span>
                  <span className="review-comment-text">{review.comment || "No comment"}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {/* Display review images if any */}
                {review.photos && review.photos.length > 0 && (
                  <div className="review-images">
                    <div className="review-images-grid">
                      {review.photos.map((photoUrl, index) => (
                        <img
                          key={index}
                          src={photoUrl}
                          alt={`Review photo ${index + 1}`}
                          className="review-image"
                          onClick={() => window.open(photoUrl, "_blank")}
                        />
                      ))}
                    </div>
                    {review.photos.length > 0 && (
                      <span className="photo-count">
                        📷 {review.photos.length} photo{review.photos.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
