import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import api, { placeAPI, reviewAPI } from "../services/api";
import CardNotificationPopup from "../components/CardNotificationPopup";
import "../styles/PlaceDetails.css";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Track the actual current place ID (may differ from URL param after OSM->DB conversion)
  const [currentPlaceId, setCurrentPlaceId] = useState(id);

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Review likes state
  const [reviewLikes, setReviewLikes] = useState({});

  // Barrage 
  const [barrageQueue, setBarrageQueue] = useState([]);
  
  // Card notification popup state
  const [showCardNotification, setShowCardNotification] = useState(false);
  const [cardType, setCardType] = useState('');

  // Helper function to get barrage top position based on screen width
  const getBarrageTop = () => {
    let topRange, topOffset;
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {  // mid screen size, hero-placeholder height is 240px;
      topRange = 180; topOffset = 15;
    } else { // large screen size, hero-placeholder height is 300px;
      topRange = 220; topOffset = 20;
    }
    return Math.random() * topRange + topOffset;
  };


  useEffect(() => {
    if (!reviews || reviews.length === 0) return;

    const addReview = () => {
      setBarrageQueue(prev => {
        const available = reviews.filter(r => !prev.some(q => q._id === r._id));
        if (available.length === 0) return prev;
        const review = available[Math.floor(Math.random() * available.length)];

        const screenWidth = window.innerWidth;

        let top, animationClass, duration;

        if (screenWidth <= 480) {
          duration = 8;
          const containerHeight = 200;
          top = containerHeight - 50;
          animationClass = 'barrage-mobile-vertical';
        } else {
          duration = Math.random() * 6 + 8; // 8-14 seconds
          const minBuffer = 22; // Minimum buffer px between barrages, barrage font size is 18px;
          let attempts = 0;
          do {
            // This need to be adjusted based on the height of the barrage container
            top = Math.round(getBarrageTop()); // Random number between 20 - 240 pixels. Container is set to fixed 300px height.
            attempts += 1;
          } while (attempts < 10 && prev.some(existing => Math.abs(existing.top - top) < minBuffer));
          animationClass = 'barrage-desktop-horizontal';
        }

        return [
          ...prev,
          { ...review, top, duration, animationClass, key: Date.now() + Math.random() }
        ]
      })
    }

    const interval = setInterval(() => {
      if (barrageQueue.length < 4) addReview(); // Current barrage limit is 4
    }, 2000);

    return () => clearInterval(interval);

  }, [reviews, barrageQueue]);


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

      const response = await api.post("/reviews/upload-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
        dogSize: "",
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
        overallCrowd: "",
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
      accessAndLocation: {
        parkingDifficulty: "",
        publicTransportAccess: false,
      },
      hoursOfOperation: {
        is24Hours: false,
        specificHours: "",
      },
      clinicEnvironmentAndFacilities: {
        cleanliness: "",
        facilitySize: "",
      },
      costAndTransparency: {
        cost: "",
        feesExplainedUpfront: false,
        insuranceAccepted: false,
      },
      servicesAndSpecializations: {
        onSiteDiagnostics: [],
        surgeryCapabilities: [],
        specializations: [],
      },
      emergencyAndAfterHours: {
        openWeekends: false,
        openEvenings: false,
        onCallEmergencyNumber: false,
        emergencyTriageSpeed: "",
      },
      staffAndServiceQuality: {
        staffFriendliness: "",
        veterinarianExperience: "",
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
      },
      hoursOfOperation: {
        is24Hours: false,
        specificHours: "",
      },
      animalTypeSelection: {
        availableAnimalTypes: [],
        breedVariety: "",
      },
      animalCareAndWelfare: {
        animalHealth: "",
        livingConditions: "",
      },
      adoptionProcessAndSupport: {
        applicationProcess: "",
        processingTime: "",
        homeVisitRequired: false,
      },
      staffAndVolunteerQuality: {
        staffKnowledge: "",
        customerService: "",
        volunteerProgram: false,
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
    // Update current place ID when URL parameter changes
    setCurrentPlaceId(id);
    
    const loadPlaceData = async () => {
      try {
        setLoading(true);
        

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
              

              // Try to find place by coordinates (within ~100 meters)
              const places = await placeAPI.getAllPlaces();
              const tolerance = 0.001; // roughly 100 meters



              existingPlace = places.find((p) => {
                if (!p.coordinates) return false;
                const latDiff = Math.abs(p.coordinates.lat - osmLocation.latitude);
                const lngDiff = Math.abs(p.coordinates.lng - osmLocation.longitude);
                const matches = latDiff < tolerance && lngDiff < tolerance;



                return matches;
              });

              if (existingPlace) {
                // Update current place ID and redirect to the existing place instead of treating as OSM
                setCurrentPlaceId(existingPlace._id);
                navigate(`/place/${existingPlace._id}`, { replace: true });
                return;
              }
            } catch (coordError) {

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
              if (
                (osmLocation.type === "dog park" ||
                  osmLocation.type === "dog_park" ||
                  osmLocation.type === "leisure") &&
                reviewsData.length > 0
              ) {
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

  // Load review likes when reviews or mongoUser changes
  useEffect(() => {
    loadReviewLikes();
  }, [reviews, mongoUser]);

  // Handle review form submission
  // Handle place deletion
  const handleDeletePlace = async () => {
    if (!mongoUser || !place) return;

    setDeleteLoading(true);
    try {
      await placeAPI.deletePlace(place._id, mongoUser._id);
      console.log("Place deleted successfully");

      // Navigate back to home with deletion info to update map state
      navigate("/", { 
        state: { 
          deletedPlaceId: place._id,
          deletedPlaceName: place.name 
        } 
      });
    } catch (error) {
      console.error("Error deleting place:", error);
      alert(error.response?.data?.error || "Failed to delete place. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!mongoUser) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this review? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await reviewAPI.deleteReview(reviewId, mongoUser._id);
      console.log("Review deleted successfully");

      // Reload reviews to reflect the deletion (use currentPlaceId for converted places)
      const updatedReviews = await reviewAPI.getReviewsByPlace(currentPlaceId);
      setReviews(updatedReviews);

      // Also reload stats if needed
      if (place.type === "dog park" || place.type === "dog_park" || place.type === "leisure") {
        const updatedStats = await reviewAPI.getDogParkStats(currentPlaceId);
        setDogParkStats(updatedStats);
      }
      if (place.type === "vet" || place.type === "veterinary") {
        const updatedStats = await reviewAPI.getVetClinicStats(currentPlaceId);
        setVetClinicStats(updatedStats);
      }
      if (place.type === "pet store" || place.type === "pet_store") {
        const updatedStats = await reviewAPI.getPetStoreStats(currentPlaceId);
        setPetStoreStats(updatedStats);
      }
      if (place.type === "shelter" || place.type === "animal_shelter") {
        const updatedStats = await reviewAPI.getAnimalShelterStats(currentPlaceId);
        setAnimalShelterStats(updatedStats);
      }

      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.error || "Failed to delete review. Please try again.");
    }
  };

  // Load review likes for current user
  const loadReviewLikes = async () => {
    if (!mongoUser || reviews.length === 0) return;

    try {
      const likesData = {};
      for (const review of reviews) {
        try {
          const likeStatus = await reviewAPI.getReviewLikeStatus(review._id, mongoUser._id);
          likesData[review._id] = likeStatus;
        } catch (error) {
          console.error(`Error loading like status for review ${review._id}:`, error);
          // Set default values if API call fails
          likesData[review._id] = { liked: false, likeCount: review.likeCount || 0 };
        }
      }
      setReviewLikes(likesData);
    } catch (error) {
      console.error("Error loading review likes:", error);
    }
  };

  // Handle review like/unlike
  const handleReviewLike = async (reviewId) => {
    if (!mongoUser) {
      alert("Please log in to like reviews.");
      return;
    }

    try {
      console.log("Attempting to like/unlike review:", reviewId);
      const response = await reviewAPI.likeReview(reviewId, mongoUser._id);
      console.log("Like response received:", response);

      // Update local state
      setReviewLikes((prev) => ({
        ...prev,
        [reviewId]: {
          liked: response.liked,
          likeCount: response.likeCount,
        },
      }));

      // Update the review in the reviews array
      setReviews((prevReviews) =>
        prevReviews.map((review) => (review._id === reviewId ? { ...review, likeCount: response.likeCount } : review))
      );
    } catch (error) {
      console.error("Error liking review:", error);
      alert("Failed to update like status. Please try again.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    

    // Check if user is logged in
    if (!mongoUser || !firebaseUser) {
      alert("Please log in to leave a review. You will be redirected to the login page.");
      navigate("/login");
      return;
    }

    // First, upload images if any
            const imageUrls = await uploadImages();

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


        const createdReview = await reviewAPI.createReview(reviewData);
        
        // Check if a card was triggered and show notification
        if (createdReview.cardTriggered) {
          setCardType(createdReview.cardType || '');
          setShowCardNotification(true);
        }

        // Extract the place ID from the review response
        const actualPlaceId = createdReview.placeId;
        console.log("Actual place ID used:", actualPlaceId);

        // If the place ID is different from current URL, update URL without reload
        if (actualPlaceId !== id) {
          console.log("Updating URL to reflect database place ID:", actualPlaceId);
          // Use replace: true to update URL without adding to history or causing reload
          window.history.replaceState(null, '', `/place/${actualPlaceId}`);
          // Update current place ID for future operations
          setCurrentPlaceId(actualPlaceId);
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

      // Check if a card was triggered and show notification
      if (createdReview.cardTriggered) {
        setCardType(createdReview.cardType || '');
        setShowCardNotification(true);
      }

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

  // Analyze reviews to get tag popularity for smart coloring - ALIGNED WITH BACKEND 8-CATEGORY SYSTEM
  const analyzeDogParkReviewTags = () => {
    if (!reviews || reviews.length === 0) {
      return {};
    }

    const tagCounts = {
      // 1. Access & Location - ALIGNED WITH BACKEND
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0 },
      },
      // 2. Hours of Operation - ALIGNED WITH BACKEND
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        specificHours: {},
      },
      // 3. Safety Level - ALIGNED WITH BACKEND
      safetyLevel: {
        fencingCondition: { fully_enclosed: 0, partially_enclosed: 0, not_enclosed: 0 },
        nightIllumination: { true: 0, false: 0 },
        firstAidStation: { true: 0, false: 0 },
        surveillanceCameras: { true: 0, false: 0 },
      },
      // 4. Size & Layout - ALIGNED WITH BACKEND
      sizeAndLayout: {
        dogSize: { large: 0, medium: 0, small: 0, all_sizes: 0 },
        runningSpace: { enough: 0, limited: 0, tight: 0 },
        drainagePerformance: { excellent: 0, good: 0, poor: 0 },
      },
      // 5. Amenities & Facilities - ALIGNED WITH BACKEND
      amenitiesAndFacilities: {
        seatingLevel: { bench: 0, gazebo: 0, no_seat: 0 },
        shadeAndCover: { trees: 0, shade_structures: 0, none: 0 },
        biodegradableBags: { true: 0, false: 0 },
        waterAccess: { drinking_fountain: 0, fire_hydrant: 0, pool: 0, none: 0 },
      },
      // 6. Maintenance & Cleanliness - ALIGNED WITH BACKEND
      maintenanceAndCleanliness: {
        overallCleanliness: { good: 0, neutral: 0, bad: 0 },
        equipmentCondition: { good: 0, fair: 0, poor: 0 },
      },
      // 7. Crowd & Social Dynamics - ALIGNED WITH BACKEND
      crowdAndSocialDynamics: {
        overallCrowd: { crowded: 0, moderate: 0, quiet: 0 },
        ownerFriendliness: { very_friendly: 0, friendly: 0, neutral: 0, unfriendly: 0 },
      },
      // 8. Rules, Policies & Community - ALIGNED WITH BACKEND
      rulesPoliciesAndCommunity: {
        leashPolicy: { off_leash_allowed: 0, leash_required: 0, mixed_areas: 0 },
        communityEnforcement: { strict: 0, moderate: 0, lenient: 0, none: 0 },
      },
    };

    // Count occurrences from all reviews - ALIGNED WITH BACKEND 8-CATEGORY SYSTEM
    reviews.forEach((review) => {
      if (review.dogParkReview) {
        const dpReview = review.dogParkReview;

        // 1. Access & Location - ALIGNED WITH BACKEND
        if (dpReview.accessAndLocation) {
          const al = dpReview.accessAndLocation;
          if (al.parkingDifficulty) tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
        }

        // 2. Hours of Operation - ALIGNED WITH BACKEND
        if (dpReview.hoursOfOperation) {
          const ho = dpReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.specificHours) {
            tagCounts.hoursOfOperation.specificHours[ho.specificHours] = 
              (tagCounts.hoursOfOperation.specificHours[ho.specificHours] || 0) + 1;
          }
        }

        // 3. Safety Level - ALIGNED WITH BACKEND
        if (dpReview.safetyLevel) {
          const sl = dpReview.safetyLevel;
          if (sl.fencingCondition) tagCounts.safetyLevel.fencingCondition[sl.fencingCondition]++;
          if (sl.nightIllumination !== undefined) tagCounts.safetyLevel.nightIllumination[sl.nightIllumination]++;
          if (sl.firstAidStation !== undefined) tagCounts.safetyLevel.firstAidStation[sl.firstAidStation]++;
          if (sl.surveillanceCameras !== undefined) tagCounts.safetyLevel.surveillanceCameras[sl.surveillanceCameras]++;
        }

        // 4. Size & Layout - ALIGNED WITH BACKEND
        if (dpReview.sizeAndLayout) {
          const szl = dpReview.sizeAndLayout;
          if (szl.dogSize) tagCounts.sizeAndLayout.dogSize[szl.dogSize]++;
          if (szl.runningSpace) tagCounts.sizeAndLayout.runningSpace[szl.runningSpace]++;
          if (szl.drainagePerformance) tagCounts.sizeAndLayout.drainagePerformance[szl.drainagePerformance]++;
        }

        // 5. Amenities & Facilities - ALIGNED WITH BACKEND
        if (dpReview.amenitiesAndFacilities) {
          const af = dpReview.amenitiesAndFacilities;
          if (af.seatingLevel) tagCounts.amenitiesAndFacilities.seatingLevel[af.seatingLevel]++;
          if (af.shadeAndCover) tagCounts.amenitiesAndFacilities.shadeAndCover[af.shadeAndCover]++;
          if (af.biodegradableBags !== undefined) tagCounts.amenitiesAndFacilities.biodegradableBags[af.biodegradableBags]++;
          if (af.waterAccess) tagCounts.amenitiesAndFacilities.waterAccess[af.waterAccess]++;
        }

        // 6. Maintenance & Cleanliness - ALIGNED WITH BACKEND
        if (dpReview.maintenanceAndCleanliness) {
          const mc = dpReview.maintenanceAndCleanliness;
          if (mc.overallCleanliness) tagCounts.maintenanceAndCleanliness.overallCleanliness[mc.overallCleanliness]++;
          if (mc.equipmentCondition) tagCounts.maintenanceAndCleanliness.equipmentCondition[mc.equipmentCondition]++;
        }

        // 7. Crowd & Social Dynamics - ALIGNED WITH BACKEND
        if (dpReview.crowdAndSocialDynamics) {
          const csd = dpReview.crowdAndSocialDynamics;
          if (csd.overallCrowd) tagCounts.crowdAndSocialDynamics.overallCrowd[csd.overallCrowd]++;
          if (csd.ownerFriendliness) tagCounts.crowdAndSocialDynamics.ownerFriendliness[csd.ownerFriendliness]++;
        }

        // 8. Rules, Policies & Community - ALIGNED WITH BACKEND
        if (dpReview.rulesPoliciesAndCommunity) {
          const rpc = dpReview.rulesPoliciesAndCommunity;
          if (rpc.leashPolicy) tagCounts.rulesPoliciesAndCommunity.leashPolicy[rpc.leashPolicy]++;
          if (rpc.communityEnforcement) tagCounts.rulesPoliciesAndCommunity.communityEnforcement[rpc.communityEnforcement]++;
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

    // Try both the value directly and string version for booleans
    let count = tagCounts[category][field][value] || 0;
    if (typeof value === 'boolean') {
      count = count || tagCounts[category][field][String(value)] || 0;
    }
    
    const totalReviews = reviews.length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    if (count === 0) return "option-tag gray";
    if (percentage >= 60) return "option-tag popular"; // Most popular (bright color)
    if (percentage >= 30) return "option-tag common"; // Common (medium color)
    if (percentage >= 10) return "option-tag mentioned"; // Mentioned (light color)
    return "option-tag rare"; // Rarely mentioned (faded color)
  };

  // Render smart category tags for dog parks - ALIGNED WITH BACKEND 8-CATEGORY SYSTEM
  const renderSmartDogParkCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      // 1. Access & Location - ALIGNED WITH BACKEND
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "difficult", label: "🚗 Difficult Parking" },
      ],
      // 2. Hours of Operation - ALIGNED WITH BACKEND
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
        { category: "hoursOfOperation", field: "is24Hours", value: false, label: "⏰ Limited Hours" },
      ],
      // 3. Safety Level - ALIGNED WITH BACKEND
      safetyLevel: [
        { category: "safetyLevel", field: "fencingCondition", value: "fully_enclosed", label: "🚧 Fully Enclosed" },
        { category: "safetyLevel", field: "fencingCondition", value: "partially_enclosed", label: "🚧 Partially Enclosed" },
        { category: "safetyLevel", field: "fencingCondition", value: "not_enclosed", label: "🚧 Not Enclosed" },
        { category: "safetyLevel", field: "nightIllumination", value: true, label: "💡 Night Lighting" },
        { category: "safetyLevel", field: "firstAidStation", value: true, label: "🏥 First Aid Station" },
        { category: "safetyLevel", field: "surveillanceCameras", value: true, label: "📹 Security Cameras" },
      ],
      // 4. Size & Layout - ALIGNED WITH BACKEND
      sizeAndLayout: [
        { category: "sizeAndLayout", field: "dogSize", value: "large", label: "🐕 Large Dogs" },
        { category: "sizeAndLayout", field: "dogSize", value: "medium", label: "🐕 Medium Dogs" },
        { category: "sizeAndLayout", field: "dogSize", value: "small", label: "🐕 Small Dogs" },
        { category: "sizeAndLayout", field: "dogSize", value: "all_sizes", label: "🐕 All Sizes" },
        { category: "sizeAndLayout", field: "runningSpace", value: "enough", label: "🏃 Enough Space" },
        { category: "sizeAndLayout", field: "runningSpace", value: "limited", label: "🏃 Limited Space" },
        { category: "sizeAndLayout", field: "runningSpace", value: "tight", label: "🏃 Tight Space" },
        { category: "sizeAndLayout", field: "drainagePerformance", value: "excellent", label: "💧 Excellent Drainage" },
        { category: "sizeAndLayout", field: "drainagePerformance", value: "good", label: "💧 Good Drainage" },
        { category: "sizeAndLayout", field: "drainagePerformance", value: "poor", label: "💧 Poor Drainage" },
      ],
      // 5. Amenities & Facilities - ALIGNED WITH BACKEND
      amenitiesAndFacilities: [
        { category: "amenitiesAndFacilities", field: "seatingLevel", value: "bench", label: "🪑 Bench Seating" },
        { category: "amenitiesAndFacilities", field: "seatingLevel", value: "gazebo", label: "🏗️ Gazebo Seating" },
        { category: "amenitiesAndFacilities", field: "seatingLevel", value: "no_seat", label: "🚫 No Seating" },
        { category: "amenitiesAndFacilities", field: "shadeAndCover", value: "trees", label: "🌳 Tree Shade" },
        { category: "amenitiesAndFacilities", field: "shadeAndCover", value: "shade_structures", label: "⛱️ Shade Structures" },
        { category: "amenitiesAndFacilities", field: "shadeAndCover", value: "none", label: "☀️ No Shade" },
        { category: "amenitiesAndFacilities", field: "biodegradableBags", value: true, label: "🗑️ Biodegradable Bags" },
        { category: "amenitiesAndFacilities", field: "waterAccess", value: "drinking_fountain", label: "⛲ Drinking Fountain" },
        { category: "amenitiesAndFacilities", field: "waterAccess", value: "fire_hydrant", label: "🚒 Fire Hydrant" },
        { category: "amenitiesAndFacilities", field: "waterAccess", value: "pool", label: "🏊 Dog Pool" },
        { category: "amenitiesAndFacilities", field: "waterAccess", value: "none", label: "🚫 No Water Access" },
      ],
      // 6. Maintenance & Cleanliness - ALIGNED WITH BACKEND
      maintenanceAndCleanliness: [
        { category: "maintenanceAndCleanliness", field: "overallCleanliness", value: "good", label: "🧽 Good Cleanliness" },
        { category: "maintenanceAndCleanliness", field: "overallCleanliness", value: "neutral", label: "🧽 Fair Cleanliness" },
        { category: "maintenanceAndCleanliness", field: "overallCleanliness", value: "bad", label: "🧽 Poor Cleanliness" },
        { category: "maintenanceAndCleanliness", field: "equipmentCondition", value: "good", label: "🔧 Good Equipment" },
        { category: "maintenanceAndCleanliness", field: "equipmentCondition", value: "fair", label: "🔧 Fair Equipment" },
        { category: "maintenanceAndCleanliness", field: "equipmentCondition", value: "poor", label: "🔧 Poor Equipment" },
      ],
      // 7. Crowd & Social Dynamics - ALIGNED WITH BACKEND
      crowdAndSocialDynamics: [
        { category: "crowdAndSocialDynamics", field: "overallCrowd", value: "crowded", label: "👥 Crowded" },
        { category: "crowdAndSocialDynamics", field: "overallCrowd", value: "moderate", label: "👥 Moderate Crowd" },
        { category: "crowdAndSocialDynamics", field: "overallCrowd", value: "quiet", label: "👥 Quiet" },
        { category: "crowdAndSocialDynamics", field: "ownerFriendliness", value: "very_friendly", label: "😊 Very Friendly" },
        { category: "crowdAndSocialDynamics", field: "ownerFriendliness", value: "friendly", label: "🙂 Friendly" },
        { category: "crowdAndSocialDynamics", field: "ownerFriendliness", value: "neutral", label: "😐 Neutral" },
        { category: "crowdAndSocialDynamics", field: "ownerFriendliness", value: "unfriendly", label: "😤 Unfriendly" },
      ],
      // 8. Rules, Policies & Community - ALIGNED WITH BACKEND
      rulesPoliciesAndCommunity: [
        { category: "rulesPoliciesAndCommunity", field: "leashPolicy", value: "off_leash_allowed", label: "🦮 Off-Leash Allowed" },
        { category: "rulesPoliciesAndCommunity", field: "leashPolicy", value: "leash_required", label: "🦮 Leash Required" },
        { category: "rulesPoliciesAndCommunity", field: "leashPolicy", value: "mixed_areas", label: "🦮 Mixed Areas" },
        { category: "rulesPoliciesAndCommunity", field: "communityEnforcement", value: "strict", label: "⚖️ Strict Enforcement" },
        { category: "rulesPoliciesAndCommunity", field: "communityEnforcement", value: "moderate", label: "⚖️ Moderate Enforcement" },
        { category: "rulesPoliciesAndCommunity", field: "communityEnforcement", value: "lenient", label: "⚖️ Lenient Enforcement" },
        { category: "rulesPoliciesAndCommunity", field: "communityEnforcement", value: "none", label: "⚖️ No Enforcement" },
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

  // Analyze vet clinic review tags - BACKEND ALIGNED
  const analyzeVetReviewTags = () => {
    const vetReviews = reviews.filter(r => r.vetClinicReview).map(r => r.vetClinicReview);
    const tagCounts = {
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0, Easy: 0, Moderate: 0, Difficult: 0 },
        publicTransportAccess: { true: 0, false: 0, "true": 0, "false": 0 },
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0, "true": 0, "false": 0 },
      },
      clinicEnvironmentAndFacilities: {
        cleanliness: { excellent: 0, good: 0, fair: 0, poor: 0 },
        facilitySize: { small: 0, medium: 0, large: 0 },
      },
      costAndTransparency: {
        cost: { low: 0, moderate: 0, high: 0, very_high: 0 },
        feesExplainedUpfront: { true: 0, false: 0, "true": 0, "false": 0 },
        insuranceAccepted: { true: 0, false: 0, "true": 0, "false": 0 },
      },
      servicesAndSpecializations: {
        onSiteDiagnostics: { xray: 0, ultrasound: 0, bloodwork: 0, ecg: 0, none: 0 },
        surgeryCapabilities: { routine_spay_neuter: 0, orthopedic: 0, emergency: 0, dental: 0, none: 0 },
        specializations: { cardiology: 0, dermatology: 0, oncology: 0, behavior: 0, exotic_animals: 0, none: 0 },
      },
      emergencyAndAfterHours: {
        openWeekends: { true: 0, false: 0, "true": 0, "false": 0 },
        openEvenings: { true: 0, false: 0, "true": 0, "false": 0 },
        onCallEmergencyNumber: { true: 0, false: 0, "true": 0, "false": 0 },
        emergencyTriageSpeed: { immediate: 0, within_30_min: 0, within_1_hour: 0, over_1_hour: 0 },
      },
      staffAndServiceQuality: {
        staffFriendliness: { excellent: 0, good: 0, fair: 0, poor: 0, Excellent: 0, Good: 0, Fair: 0, Poor: 0 },
        veterinarianExperience: { novice: 0, experienced: 0, expert: 0 },
      },
    };

    // Count occurrences from all reviews
    reviews.forEach((review, index) => {
      if (review.vetClinicReview) {
        const vcReview = review.vetClinicReview;

        // Handle BOTH old and new schema
        // NEW SCHEMA: Access & Location
        if (vcReview.accessAndLocation) {
          const al = vcReview.accessAndLocation;
          if (al.parkingDifficulty && tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty] !== undefined) {
            tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
          }
          if (al.publicTransportAccess !== undefined) {
            tagCounts.accessAndLocation.publicTransportAccess[al.publicTransportAccess]++;
          }
        }
        
        // OLD SCHEMA: Try to map from old fields
        if (vcReview.environmentAndFacilities) {
          // Map wheelchair accessible to public transport access
          if (vcReview.environmentAndFacilities.wheelchairAccessible !== undefined) {
            tagCounts.accessAndLocation.publicTransportAccess[vcReview.environmentAndFacilities.wheelchairAccessible]++;
          }
          // Map parking availability to parking difficulty
          if (vcReview.environmentAndFacilities.parkingAvailability) {
            const parkingMap = {
              'excellent': 'easy',
              'good': 'easy',
              'limited': 'moderate',
              'poor': 'difficult'
            };
            const mapped = parkingMap[vcReview.environmentAndFacilities.parkingAvailability];
            if (mapped && tagCounts.accessAndLocation.parkingDifficulty[mapped] !== undefined) {
              tagCounts.accessAndLocation.parkingDifficulty[mapped]++;
            }
          }
        }

        // NEW SCHEMA: Hours of Operation
        if (vcReview.hoursOfOperation) {
          const ho = vcReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) {
            tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          }
        }
        
        // OLD SCHEMA: Map from schedulingAndCommunication
        if (vcReview.schedulingAndCommunication) {
          // Map 24/7 availability to is24Hours
          if (vcReview.schedulingAndCommunication.availability24_7 !== undefined) {
            tagCounts.hoursOfOperation.is24Hours[vcReview.schedulingAndCommunication.availability24_7]++;
          }
        }

        // NEW SCHEMA: Services & Specializations
        if (vcReview.servicesAndSpecializations) {
          const ss = vcReview.servicesAndSpecializations;
          
          // Handle onSiteDiagnostics as an array (matching backend)
          if (ss.onSiteDiagnostics && Array.isArray(ss.onSiteDiagnostics)) {
            ss.onSiteDiagnostics.forEach(diag => {
              if (tagCounts.servicesAndSpecializations.onSiteDiagnostics[diag] !== undefined) {
                tagCounts.servicesAndSpecializations.onSiteDiagnostics[diag]++;
              }
            });
          }
          
          // Handle surgery capabilities and specializations as arrays
          if (ss.surgeryCapabilities && Array.isArray(ss.surgeryCapabilities)) {
            ss.surgeryCapabilities.forEach(surgery => {
              if (tagCounts.servicesAndSpecializations.surgeryCapabilities[surgery] !== undefined) {
                tagCounts.servicesAndSpecializations.surgeryCapabilities[surgery]++;
              }
            });
          }
          if (ss.specializations && Array.isArray(ss.specializations)) {
            ss.specializations.forEach(spec => {
              if (tagCounts.servicesAndSpecializations.specializations[spec] !== undefined) {
                tagCounts.servicesAndSpecializations.specializations[spec]++;
              }
            });
          }
        }
        
        // OLD SCHEMA: Map from medicalStaffAndServices
        if (vcReview.medicalStaffAndServices) {
          const mss = vcReview.medicalStaffAndServices;
          // Map diagnostic equipment to onSiteDiagnostics
          if (mss.diagnosticEquipment) {
            const diagnosticMap = {
              'xray_available': ['xray'],
              'ultrasound_available': ['ultrasound'],
              'full_lab': ['bloodwork', 'xray', 'ultrasound'],
              'basic_lab': ['bloodwork'],
              'limited_equipment': []
            };
            const diags = diagnosticMap[mss.diagnosticEquipment] || [];
            diags.forEach(diag => {
              if (tagCounts.servicesAndSpecializations.onSiteDiagnostics[diag] !== undefined) {
                tagCounts.servicesAndSpecializations.onSiteDiagnostics[diag]++;
              }
            });
          }
        }

        // NEW SCHEMA: Staff & Service Quality
        if (vcReview.staffAndServiceQuality) {
          const ssq = vcReview.staffAndServiceQuality;
          if (ssq.staffFriendliness && tagCounts.staffAndServiceQuality.staffFriendliness[ssq.staffFriendliness] !== undefined) {
            tagCounts.staffAndServiceQuality.staffFriendliness[ssq.staffFriendliness]++;
          }
          if (ssq.veterinarianExperience && tagCounts.staffAndServiceQuality.veterinarianExperience[ssq.veterinarianExperience] !== undefined) {
            tagCounts.staffAndServiceQuality.veterinarianExperience[ssq.veterinarianExperience]++;
          }
        }
        
        // OLD SCHEMA: Map from medicalStaffAndServices
        if (vcReview.medicalStaffAndServices) {
          const mss = vcReview.medicalStaffAndServices;
          // Map staff courtesy to staff friendliness
          if (mss.staffCourtesy) {
            if (tagCounts.staffAndServiceQuality.staffFriendliness[mss.staffCourtesy] !== undefined) {
              tagCounts.staffAndServiceQuality.staffFriendliness[mss.staffCourtesy]++;
            }
          }
          // Map veterinarian competence to experience
          if (mss.veterinarianCompetence) {
            const expMap = {
              'excellent': 'expert',
              'good': 'experienced',
              'fair': 'experienced',
              'poor': 'novice'
            };
            const mapped = expMap[mss.veterinarianCompetence];
            if (mapped && tagCounts.staffAndServiceQuality.veterinarianExperience[mapped] !== undefined) {
              tagCounts.staffAndServiceQuality.veterinarianExperience[mapped]++;
            }
          }
        }

        // NEW SCHEMA: Clinic Environment & Facilities
        if (vcReview.clinicEnvironmentAndFacilities) {
          const cef = vcReview.clinicEnvironmentAndFacilities;
          if (cef.cleanliness && tagCounts.clinicEnvironmentAndFacilities.cleanliness[cef.cleanliness] !== undefined) {
            tagCounts.clinicEnvironmentAndFacilities.cleanliness[cef.cleanliness]++;
          }
          if (cef.facilitySize && tagCounts.clinicEnvironmentAndFacilities.facilitySize[cef.facilitySize] !== undefined) {
            tagCounts.clinicEnvironmentAndFacilities.facilitySize[cef.facilitySize]++;
          }
        }
        
        // OLD SCHEMA: Map from environmentAndFacilities
        if (vcReview.environmentAndFacilities) {
          const ef = vcReview.environmentAndFacilities;
          if (ef.cleanliness && tagCounts.clinicEnvironmentAndFacilities.cleanliness[ef.cleanliness] !== undefined) {
            tagCounts.clinicEnvironmentAndFacilities.cleanliness[ef.cleanliness]++;
          }
          // Map comfort level to facility size
          if (ef.comfortLevel) {
            const sizeMap = {
              'excellent': 'large',
              'good': 'medium',
              'fair': 'medium',
              'poor': 'small'
            };
            const mapped = sizeMap[ef.comfortLevel];
            if (mapped && tagCounts.clinicEnvironmentAndFacilities.facilitySize[mapped] !== undefined) {
              tagCounts.clinicEnvironmentAndFacilities.facilitySize[mapped]++;
            }
          }
        }

        // Cost & Transparency - UPDATED FOR NEW BACKEND STRUCTURE
        if (vcReview.costAndTransparency) {
          const ct = vcReview.costAndTransparency;
          if (ct.cost) tagCounts.costAndTransparency.cost[ct.cost]++;
          if (ct.feesExplainedUpfront !== undefined)
            tagCounts.costAndTransparency.feesExplainedUpfront[ct.feesExplainedUpfront]++;
          if (ct.insuranceAccepted !== undefined)
            tagCounts.costAndTransparency.insuranceAccepted[ct.insuranceAccepted]++;
        }



        // Emergency & After-Hours - UPDATED FOR NEW BACKEND STRUCTURE
        if (vcReview.emergencyAndAfterHours) {
          const eah = vcReview.emergencyAndAfterHours;
          if (eah.openWeekends !== undefined) tagCounts.emergencyAndAfterHours.openWeekends[eah.openWeekends]++;
          if (eah.openEvenings !== undefined) tagCounts.emergencyAndAfterHours.openEvenings[eah.openEvenings]++;
          if (eah.onCallEmergencyNumber !== undefined)
            tagCounts.emergencyAndAfterHours.onCallEmergencyNumber[eah.onCallEmergencyNumber]++;
          if (eah.emergencyTriageSpeed)
            tagCounts.emergencyAndAfterHours.emergencyTriageSpeed[eah.emergencyTriageSpeed]++;
        }


      }
    });

    return tagCounts;
  };

  // Render smart vet clinic category tags
  const renderSmartVetCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "difficult", label: "🚗 Difficult Parking" },
        { category: "accessAndLocation", field: "publicTransportAccess", value: true, label: "🚌 Public Transport Access" },
      ],
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
      ],
      servicesAndSpecializations: [
        { category: "servicesAndSpecializations", field: "onSiteDiagnostics", value: "xray", label: "🩻 X-ray Available" },
        { category: "servicesAndSpecializations", field: "onSiteDiagnostics", value: "ultrasound", label: "📡 Ultrasound Available" },
        { category: "servicesAndSpecializations", field: "onSiteDiagnostics", value: "bloodwork", label: "🩸 Bloodwork Available" },
        { category: "servicesAndSpecializations", field: "onSiteDiagnostics", value: "ecg", label: "❤️ ECG Available" },
        { category: "servicesAndSpecializations", field: "surgeryCapabilities", value: "routine_spay_neuter", label: "✂️ Routine Surgery" },
        { category: "servicesAndSpecializations", field: "surgeryCapabilities", value: "orthopedic", label: "🦴 Orthopedic Surgery" },
        { category: "servicesAndSpecializations", field: "surgeryCapabilities", value: "emergency", label: "🚨 Emergency Surgery" },
        { category: "servicesAndSpecializations", field: "surgeryCapabilities", value: "dental", label: "🦷 Dental Surgery" },
        { category: "servicesAndSpecializations", field: "specializations", value: "cardiology", label: "❤️ Cardiology" },
        { category: "servicesAndSpecializations", field: "specializations", value: "dermatology", label: "🧴 Dermatology" },
        { category: "servicesAndSpecializations", field: "specializations", value: "oncology", label: "🎗️ Oncology" },
        { category: "servicesAndSpecializations", field: "specializations", value: "behavior", label: "🧠 Behavior" },
        { category: "servicesAndSpecializations", field: "specializations", value: "exotic_animals", label: "🦎 Exotic Animals" },
      ],
      staffAndServiceQuality: [
        { category: "staffAndServiceQuality", field: "staffFriendliness", value: "excellent", label: "😊 Excellent Staff" },
        { category: "staffAndServiceQuality", field: "staffFriendliness", value: "good", label: "👍 Good Staff" },
        { category: "staffAndServiceQuality", field: "staffFriendliness", value: "fair", label: "😐 Fair Staff" },
        { category: "staffAndServiceQuality", field: "staffFriendliness", value: "poor", label: "😤 Poor Staff" },
        { category: "staffAndServiceQuality", field: "veterinarianExperience", value: "expert", label: "🏆 Expert Vet" },
        { category: "staffAndServiceQuality", field: "veterinarianExperience", value: "experienced", label: "👨‍⚕️ Experienced Vet" },
        { category: "staffAndServiceQuality", field: "veterinarianExperience", value: "novice", label: "🆕 Novice Vet" },
      ],
      clinicEnvironmentAndFacilities: [
        {
          category: "clinicEnvironmentAndFacilities",
          field: "cleanliness",
          value: "excellent",
          label: "🌟 Excellent Cleanliness",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "cleanliness",
          value: "good",
          label: "✨ Good Cleanliness",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "cleanliness",
          value: "fair",
          label: "😐 Fair Cleanliness",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "cleanliness",
          value: "poor",
          label: "😰 Poor Cleanliness",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "facilitySize",
          value: "small",
          label: "🏠 Small Facility",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "facilitySize",
          value: "medium",
          label: "🏢 Medium Facility",
        },
        {
          category: "clinicEnvironmentAndFacilities",
          field: "facilitySize",
          value: "large",
          label: "🏨 Large Facility",
        },
      ],
      costAndTransparency: [
        { category: "costAndTransparency", field: "cost", value: "low", label: "💵 Low Cost" },
        { category: "costAndTransparency", field: "cost", value: "moderate", label: "💰 Moderate Cost" },
        { category: "costAndTransparency", field: "cost", value: "high", label: "💸 High Cost" },
        { category: "costAndTransparency", field: "feesExplainedUpfront", value: true, label: "📋 Transparent Fees" },
        { category: "costAndTransparency", field: "insuranceAccepted", value: true, label: "🏥 Insurance Accepted" },
      ],

      emergencyAndAfterHours: [
        { category: "emergencyAndAfterHours", field: "openWeekends", value: true, label: "📅 Weekend Hours" },
        { category: "emergencyAndAfterHours", field: "openEvenings", value: true, label: "🌙 Evening Hours" },
        { category: "emergencyAndAfterHours", field: "onCallEmergencyNumber", value: true, label: "📱 Emergency On-Call" },
        { category: "emergencyAndAfterHours", field: "emergencyTriageSpeed", value: "immediate", label: "⚡ Immediate Triage" },
        { category: "emergencyAndAfterHours", field: "emergencyTriageSpeed", value: "within_30_min", label: "🚨 Fast Emergency Care" },
        { category: "emergencyAndAfterHours", field: "emergencyTriageSpeed", value: "within_1_hour", label: "⏰ Quick Response" },
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

  // Analyze pet store reviews to get tag popularity for smart coloring - ALIGNED WITH BACKEND 6-CATEGORY SYSTEM
  const analyzePetStoreReviewTags = () => {
    if (!reviews || reviews.length === 0) {
      return {};
    }

    const tagCounts = {
      // 1. Access & Location - ALIGNED WITH BACKEND
      accessAndLocation: {
        parkingDifficulty: { easy: 0, moderate: 0, difficult: 0 },
      },
      // 2. Hours of Operation - ALIGNED WITH BACKEND
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        specificHours: {},
      },
      // 3. Services & Conveniences - ALIGNED WITH BACKEND
      servicesAndConveniences: {
        grooming: { true: 0, false: 0 },
        veterinaryServices: { true: 0, false: 0 },
        petTraining: { true: 0, false: 0 },
        onlineOrdering: { true: 0, false: 0 },
        curbsidePickup: { true: 0, false: 0 },
        returnPolicy: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      // 4. Product Selection & Quality - ALIGNED WITH BACKEND
      productSelectionAndQuality: {
        foodBrandVariety: { excellent: 0, good: 0, fair: 0, poor: 0 },
        toySelection: { excellent: 0, good: 0, fair: 0, poor: 0 },
        productFreshness: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      // 5. Pricing & Value - ALIGNED WITH BACKEND
      pricingAndValue: {
        overallPricing: { low: 0, moderate: 0, high: 0, very_high: 0 },
        priceMatching: { true: 0, false: 0 },
      },
      // 6. Staff Knowledge & Service - ALIGNED WITH BACKEND
      staffKnowledgeAndService: {
        petKnowledge: { excellent: 0, good: 0, fair: 0, poor: 0 },
        trainingCertified: { true: 0, false: 0 },
      },
    };

    // Count occurrences from all reviews - ALIGNED WITH BACKEND 6-CATEGORY SYSTEM
    reviews.forEach((review) => {
      if (review.petStoreReview) {
        const psReview = review.petStoreReview;

        // 1. Access & Location - ALIGNED WITH BACKEND
        if (psReview.accessAndLocation) {
          const al = psReview.accessAndLocation;
          if (al.parkingDifficulty) tagCounts.accessAndLocation.parkingDifficulty[al.parkingDifficulty]++;
        }

        // 2. Hours of Operation - ALIGNED WITH BACKEND
        if (psReview.hoursOfOperation) {
          const ho = psReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.specificHours) {
            tagCounts.hoursOfOperation.specificHours[ho.specificHours] =
              (tagCounts.hoursOfOperation.specificHours[ho.specificHours] || 0) + 1;
          }
        }

        // 3. Services & Conveniences - ALIGNED WITH BACKEND
        if (psReview.servicesAndConveniences) {
          const sc = psReview.servicesAndConveniences;
          if (sc.grooming !== undefined) tagCounts.servicesAndConveniences.grooming[sc.grooming]++;
          if (sc.veterinaryServices !== undefined) tagCounts.servicesAndConveniences.veterinaryServices[sc.veterinaryServices]++;
          if (sc.petTraining !== undefined) tagCounts.servicesAndConveniences.petTraining[sc.petTraining]++;
          if (sc.onlineOrdering !== undefined) tagCounts.servicesAndConveniences.onlineOrdering[sc.onlineOrdering]++;
          if (sc.curbsidePickup !== undefined) tagCounts.servicesAndConveniences.curbsidePickup[sc.curbsidePickup]++;
          if (sc.returnPolicy) tagCounts.servicesAndConveniences.returnPolicy[sc.returnPolicy]++;
        }

        // 4. Product Selection & Quality - ALIGNED WITH BACKEND
        if (psReview.productSelectionAndQuality) {
          const psq = psReview.productSelectionAndQuality;
          if (psq.foodBrandVariety) tagCounts.productSelectionAndQuality.foodBrandVariety[psq.foodBrandVariety]++;
          if (psq.toySelection) tagCounts.productSelectionAndQuality.toySelection[psq.toySelection]++;
          if (psq.productFreshness) tagCounts.productSelectionAndQuality.productFreshness[psq.productFreshness]++;
        }

        // 5. Pricing & Value - ALIGNED WITH BACKEND
        if (psReview.pricingAndValue) {
          const pv = psReview.pricingAndValue;
          if (pv.overallPricing) tagCounts.pricingAndValue.overallPricing[pv.overallPricing]++;
          if (pv.priceMatching !== undefined) tagCounts.pricingAndValue.priceMatching[pv.priceMatching]++;
        }

        // 6. Staff Knowledge & Service - ALIGNED WITH BACKEND
        if (psReview.staffKnowledgeAndService) {
          const sks = psReview.staffKnowledgeAndService;
          if (sks.petKnowledge) tagCounts.staffKnowledgeAndService.petKnowledge[sks.petKnowledge]++;
          if (sks.trainingCertified !== undefined) tagCounts.staffKnowledgeAndService.trainingCertified[sks.trainingCertified]++;
        }
      }
    });

    return tagCounts;
  };

  // Render smart category tags for pet stores - ALIGNED WITH BACKEND 6-CATEGORY SYSTEM (TOP 4 TAGS)
  const renderSmartPetStoreCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      // 1. Access & Location - ALIGNED WITH BACKEND
      accessAndLocation: [
        { category: "accessAndLocation", field: "parkingDifficulty", value: "easy", label: "🚗 Easy Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "moderate", label: "🚗 Moderate Parking" },
        { category: "accessAndLocation", field: "parkingDifficulty", value: "difficult", label: "🚗 Difficult Parking" },
      ],
      // 2. Hours of Operation - ALIGNED WITH BACKEND
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
        { category: "hoursOfOperation", field: "is24Hours", value: false, label: "⏰ Limited Hours" },
      ],
      // 3. Services & Conveniences - ALIGNED WITH BACKEND
      servicesAndConveniences: [
        { category: "servicesAndConveniences", field: "grooming", value: true, label: "✂️ Grooming Available" },
        { category: "servicesAndConveniences", field: "veterinaryServices", value: true, label: "🏥 Vet Services" },
        { category: "servicesAndConveniences", field: "petTraining", value: true, label: "🎓 Pet Training" },
        { category: "servicesAndConveniences", field: "onlineOrdering", value: true, label: "💻 Online Ordering" },
        { category: "servicesAndConveniences", field: "curbsidePickup", value: true, label: "🚗 Curbside Pickup" },
        { category: "servicesAndConveniences", field: "returnPolicy", value: "excellent", label: "↩️ Excellent Returns" },
        { category: "servicesAndConveniences", field: "returnPolicy", value: "good", label: "↩️ Good Returns" },
      ],
      // 4. Product Selection & Quality - ALIGNED WITH BACKEND
      productSelectionAndQuality: [
        { category: "productSelectionAndQuality", field: "foodBrandVariety", value: "excellent", label: "🥘 Excellent Food Variety" },
        { category: "productSelectionAndQuality", field: "foodBrandVariety", value: "good", label: "🥘 Good Food Variety" },
        { category: "productSelectionAndQuality", field: "toySelection", value: "excellent", label: "🧸 Excellent Toy Selection" },
        { category: "productSelectionAndQuality", field: "toySelection", value: "good", label: "🧸 Good Toy Selection" },
        { category: "productSelectionAndQuality", field: "productFreshness", value: "excellent", label: "🌟 Excellent Freshness" },
        { category: "productSelectionAndQuality", field: "productFreshness", value: "good", label: "✨ Good Freshness" },
      ],
      // 5. Pricing & Value - ALIGNED WITH BACKEND
      pricingAndValue: [
        { category: "pricingAndValue", field: "overallPricing", value: "low", label: "💵 Low Prices" },
        { category: "pricingAndValue", field: "overallPricing", value: "moderate", label: "💰 Moderate Prices" },
        { category: "pricingAndValue", field: "overallPricing", value: "high", label: "💸 High Prices" },
        { category: "pricingAndValue", field: "priceMatching", value: true, label: "🏷️ Price Matching" },
      ],
      // 6. Staff Knowledge & Service - ALIGNED WITH BACKEND
      staffKnowledgeAndService: [
        { category: "staffKnowledgeAndService", field: "petKnowledge", value: "excellent", label: "🧠 Expert Pet Knowledge" },
        { category: "staffKnowledgeAndService", field: "petKnowledge", value: "good", label: "👍 Good Pet Knowledge" },
        { category: "staffKnowledgeAndService", field: "petKnowledge", value: "fair", label: "😐 Fair Pet Knowledge" },
        { category: "staffKnowledgeAndService", field: "trainingCertified", value: true, label: "🎓 Certified Staff" },
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
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0, "true": 0, "false": 0 },
        specificHours: {},
      },
      animalTypeSelection: {
        availableAnimalTypes: { dogs: 0, cats: 0, rabbits: 0, birds: 0, reptiles: 0, small_mammals: 0 },
        breedVariety: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      animalCareAndWelfare: {
        animalHealth: { excellent: 0, good: 0, fair: 0, poor: 0 },
        livingConditions: { excellent: 0, good: 0, fair: 0, poor: 0 },
      },
      adoptionProcessAndSupport: {
        applicationProcess: { easy: 0, moderate: 0, difficult: 0 },
        processingTime: { same_day: 0, within_week: 0, "1_2_weeks": 0, over_2_weeks: 0 },
        homeVisitRequired: { true: 0, false: 0, "true": 0, "false": 0 },
      },
      staffAndVolunteerQuality: {
        staffKnowledge: { excellent: 0, good: 0, fair: 0, poor: 0 },
        customerService: { excellent: 0, good: 0, fair: 0, poor: 0 },
        volunteerProgram: { true: 0, false: 0, "true": 0, "false": 0 },
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
          
          // Handle old schema fields by mapping to new ones
          if (al.parkingAndAccessibility) {
            const parkingMap = { excellent: "easy", good: "easy", limited: "moderate", poor: "difficult" };
            const mappedValue = parkingMap[al.parkingAndAccessibility];
            if (mappedValue) tagCounts.accessAndLocation.parkingDifficulty[mappedValue]++;
          }
        }

        // Hours of Operation
        if (asReview.hoursOfOperation) {
          const ho = asReview.hoursOfOperation;
          if (ho.is24Hours !== undefined) tagCounts.hoursOfOperation.is24Hours[ho.is24Hours]++;
          if (ho.specificHours) {
            tagCounts.hoursOfOperation.specificHours[ho.specificHours] =
              (tagCounts.hoursOfOperation.specificHours[ho.specificHours] || 0) + 1;
          }
        }

        // Animal Type Selection
        if (asReview.animalTypeSelection) {
          const ats = asReview.animalTypeSelection;
          if (ats.availableAnimalTypes && Array.isArray(ats.availableAnimalTypes)) {
            ats.availableAnimalTypes.forEach((type) => {
              if (tagCounts.animalTypeSelection.availableAnimalTypes[type] !== undefined) {
                tagCounts.animalTypeSelection.availableAnimalTypes[type]++;
              }
            });
          }
          if (ats.breedVariety) tagCounts.animalTypeSelection.breedVariety[ats.breedVariety]++;
        }

        // Animal Care & Welfare
        if (asReview.animalCareAndWelfare) {
          const acw = asReview.animalCareAndWelfare;
          if (acw.animalHealth) tagCounts.animalCareAndWelfare.animalHealth[acw.animalHealth]++;
          if (acw.livingConditions) tagCounts.animalCareAndWelfare.livingConditions[acw.livingConditions]++;
        }

        // Adoption Process & Support
        if (asReview.adoptionProcessAndSupport) {
          const aps = asReview.adoptionProcessAndSupport;
          if (aps.applicationProcess) tagCounts.adoptionProcessAndSupport.applicationProcess[aps.applicationProcess]++;
          if (aps.processingTime) tagCounts.adoptionProcessAndSupport.processingTime[aps.processingTime]++;
          if (aps.homeVisitRequired !== undefined)
            tagCounts.adoptionProcessAndSupport.homeVisitRequired[aps.homeVisitRequired]++;
        }

        // Staff & Volunteer Quality
        if (asReview.staffAndVolunteerQuality) {
          const svq = asReview.staffAndVolunteerQuality;
          if (svq.staffKnowledge) tagCounts.staffAndVolunteerQuality.staffKnowledge[svq.staffKnowledge]++;
          if (svq.customerService) tagCounts.staffAndVolunteerQuality.customerService[svq.customerService]++;
          if (svq.volunteerProgram !== undefined)
            tagCounts.staffAndVolunteerQuality.volunteerProgram[svq.volunteerProgram]++;
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
        {
          category: "accessAndLocation",
          field: "parkingDifficulty",
          value: "difficult",
          label: "🚗 Difficult Parking",
        },
      ],
      hoursOfOperation: [
        { category: "hoursOfOperation", field: "is24Hours", value: true, label: "🕐 24 Hours Open" },
      ],
      animalTypeSelection: [
        { category: "animalTypeSelection", field: "availableAnimalTypes", value: "dogs", label: "🐕 Dogs Available" },
        { category: "animalTypeSelection", field: "availableAnimalTypes", value: "cats", label: "🐱 Cats Available" },
        {
          category: "animalTypeSelection",
          field: "availableAnimalTypes",
          value: "rabbits",
          label: "🐰 Rabbits Available",
        },
        { category: "animalTypeSelection", field: "breedVariety", value: "excellent", label: "🎯 Great Breed Variety" },
      ],
      animalCareAndWelfare: [
        { category: "animalCareAndWelfare", field: "animalHealth", value: "excellent", label: "❤️ Excellent Health" },
        {
          category: "animalCareAndWelfare",
          field: "livingConditions",
          value: "excellent",
          label: "🏠 Great Conditions",
        },
      ],
      adoptionProcessAndSupport: [
        {
          category: "adoptionProcessAndSupport",
          field: "applicationProcess",
          value: "easy",
          label: "📝 Easy Application",
        },
        {
          category: "adoptionProcessAndSupport",
          field: "processingTime",
          value: "same_day",
          label: "⚡ Same Day Processing",
        },
        { category: "adoptionProcessAndSupport", field: "homeVisitRequired", value: false, label: "🏠 No Home Visit Required" },
      ],
      staffAndVolunteerQuality: [
        { category: "staffAndVolunteerQuality", field: "staffKnowledge", value: "excellent", label: "🧠 Expert Staff" },
        { category: "staffAndVolunteerQuality", field: "customerService", value: "excellent", label: "⭐ Excellent Service" },
        { category: "staffAndVolunteerQuality", field: "volunteerProgram", value: true, label: "👥 Volunteer Program" },
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
        <div className="header-row">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← BACK
          </button>
          {/* Delete button - only show for place creator */}
          {mongoUser && place.addedBy && String(place.addedBy) === String(mongoUser._id) && !place.isOSMLocation && place.creationSource === "user_created" && (
            <button
              className="delete-place-button"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this place"
            >
              DELETE PLACE
            </button>
          )}
        </div>
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

          {place.type === 'dog park' || place.type === 'dog_park' ? (
            <img 
              src="/dog-park-hero.png" 
              alt="Dog Park Scene" 
              className="hero-background-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              onLoad={() => console.log('Dog park image loaded successfully')}
              onError={(e) => console.error('Dog park image failed to load:', e)}
            />
          ) : place.type === 'veterinary' || place.type === 'vet' ? (
            <img 
              src="/vet.png" 
              alt="Veterinary Clinic Scene" 
              className="hero-background-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              onLoad={() => console.log('Vet image loaded successfully')}
              onError={(e) => console.error('Vet image failed to load:', e)}
            />
          ) : place.type === 'animal shelter' || place.type === 'animal_shelter' || place.type === 'shelter' ? (
            <img 
              src="/shelter.png" 
              alt="Animal Shelter Scene" 
              className="hero-background-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              onLoad={() => console.log('Shelter image loaded successfully')}
              onError={(e) => console.error('Shelter image failed to load:', e)}
            />
          ) : place.type === 'pet store' || place.type === 'pet_store' || place.type === 'petstore' ? (
            <img 
              src="/petstore.png" 
              alt="Pet Store Scene" 
              className="hero-background-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
              onLoad={() => console.log('Pet store image loaded successfully')}
              onError={(e) => console.error('Pet store image failed to load:', e)}
            />
          ) : (
            <>
              <span className="hero-icon">{locationTypes[place.type]?.icon || "📍"}</span>
              <h2>PLACE IMAGE</h2>
            </>
          )}

          {barrageQueue.map((review, _) => (
            <div
              key={review.key}
              className={`barrage-review ${review.animationClass || 'barrage-desktop-horizontal'}`} // default to hotizontal
              style={{
                top: `${review.top}px`,
                animationDuration: `${review.duration}s`
              }}
              onAnimationEnd={() => setBarrageQueue(queue => queue.filter(q => q.key !== review.key))}
            >
              {review.comment}
            </div>
          ))}

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
              <h3>Access & Location</h3>

              <div className="feature-tags">{renderSmartDogParkCategoryTags("accessAndLocation", analyzeDogParkReviewTags())}</div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>Hours of Operation</h3>

              <div className="feature-tags">{renderSmartDogParkCategoryTags("hoursOfOperation", analyzeDogParkReviewTags())}</div>
            </div>

            {/* 3. Safety Level */}
            <div className="category-section">
              <h3>Safety Level</h3>

              <div className="feature-tags">{renderSmartDogParkCategoryTags("safetyLevel", analyzeDogParkReviewTags())}</div>
            </div>

            {/* 4. Size & Layout */}
            <div className="category-section">
              <h3>Size & Layout</h3>

              <div className="feature-tags">{renderSmartDogParkCategoryTags("sizeAndLayout", analyzeDogParkReviewTags())}</div>
            </div>

            {/* 5. Amenities & Facilities */}
            <div className="category-section">
              <h3>Amenities & Facilities</h3>

              <div className="feature-tags">
                {renderSmartDogParkCategoryTags("amenitiesAndFacilities", analyzeDogParkReviewTags())}
              </div>
            </div>

            {/* 6. Maintenance & Cleanliness */}
            <div className="category-section">
              <h3>Maintenance & Cleanliness</h3>

              <div className="feature-tags">
                {renderSmartDogParkCategoryTags("maintenanceAndCleanliness", analyzeDogParkReviewTags())}
              </div>
            </div>

            {/* 7. Crowd & Social Dynamics */}
            <div className="category-section">
              <h3>Crowd & Social Dynamics</h3>

              <div className="feature-tags">
                {renderSmartDogParkCategoryTags("crowdAndSocialDynamics", analyzeDogParkReviewTags())}
              </div>
            </div>

            {/* 8. Rules, Policies & Community */}
            <div className="category-section">
              <h3>Rules, Policy & Community</h3>

              <div className="feature-tags">
                {renderSmartDogParkCategoryTags("rulesPoliciesAndCommunity", analyzeDogParkReviewTags())}
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
            {(() => {
              const vetTagCounts = analyzeVetReviewTags();
              return (
                <>
                  {/* 1. Access & Location - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Access & Location</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("accessAndLocation", vetTagCounts)}
              </div>
            </div>

                  {/* 2. Hours of Operation - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Hours of Operation</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("hoursOfOperation", vetTagCounts)}
              </div>
            </div>

                  {/* 3. Clinic Environment & Facilities - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Clinic Environment & Facilities</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("clinicEnvironmentAndFacilities", vetTagCounts)}
              </div>
            </div>

                  {/* 4. Cost & Transparency - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Cost & Transparency</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("costAndTransparency", vetTagCounts)}
              </div>
            </div>

                  {/* 5. Services & Specializations - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Services & Specializations</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("servicesAndSpecializations", vetTagCounts)}
              </div>
            </div>

                  {/* 6. Emergency & After-Hours Care - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Emergency & After-Hours Care</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("emergencyAndAfterHours", vetTagCounts)}
              </div>
            </div>

                  {/* 7. Staff & Service Quality - BACKEND ALIGNED */}
            <div className="category-section">
                    <h3>Staff & Service Quality</h3>

              <div className="feature-tags">
                      {renderSmartVetCategoryTags("staffAndServiceQuality", vetTagCounts)}
              </div>
            </div>
                </>
              );
            })()}
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
              <h3>Access & Location</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("accessAndLocation", analyzePetStoreReviewTags())}
              </div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>Hours of Operation</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("hoursOfOperation", analyzePetStoreReviewTags())}
              </div>
            </div>

            {/* 3. Services & Conveniences */}
            <div className="category-section">
              <h3>Services & Conveniences</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("servicesAndConveniences", analyzePetStoreReviewTags())}
              </div>
            </div>

            {/* 4. Product Selection & Quality */}
            <div className="category-section">
              <h3>Product Selection & Quality</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("productSelectionAndQuality", analyzePetStoreReviewTags())}
              </div>
            </div>

            {/* 5. Pricing & Value */}
            <div className="category-section">
              <h3>Pricing & Value</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("pricingAndValue", analyzePetStoreReviewTags())}
              </div>
            </div>

            {/* 6. Staff Knowledge & Service */}
            <div className="category-section">
              <h3>Staff Knowledge & Service</h3>

              <div className="feature-tags">
                {renderSmartPetStoreCategoryTags("staffKnowledgeAndService", analyzePetStoreReviewTags())}
              </div>
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
              <h3>Access & Location</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("accessAndLocation", analyzeAnimalShelterReviewTags())}
              </div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>Hours of Operation</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("hoursOfOperation", analyzeAnimalShelterReviewTags())}
              </div>
            </div>

            {/* 3. Animal Type Selection */}
            <div className="category-section">
              <h3>Animal Type Selection</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("animalTypeSelection", analyzeAnimalShelterReviewTags())}
              </div>
            </div>

            {/* 4. Animal Care & Welfare */}
            <div className="category-section">
              <h3>Animal Care & Welfare</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("animalCareAndWelfare", analyzeAnimalShelterReviewTags())}
              </div>
            </div>

            {/* 5. Adoption Process & Support */}
            <div className="category-section">
              <h3>Adoption Process & Support</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("adoptionProcessAndSupport", analyzeAnimalShelterReviewTags())}
              </div>
            </div>

            {/* 6. Staff & Volunteer Quality */}
            <div className="category-section">
              <h3>Staff & Volunteer Quality</h3>

              <div className="feature-tags">
                {renderSmartAnimalShelterCategoryTags("staffAndVolunteerQuality", analyzeAnimalShelterReviewTags())}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place Information Cards */}
      <div className="info-cards-grid">
        {/* Contact Info Card */}
        {(place.phone || place.website || place.opening_hours) && (
          <div className="info-card">
            <h3>CONTACT</h3>
            {place.phone && <p>{place.phone}</p>}
            {place.website && (
              <p>
                <a href={place.website} target="_blank" rel="noopener noreferrer" className="website-link">
                  Website
                </a>
              </p>
            )}
            {place.opening_hours && <p>{place.opening_hours}</p>}
          </div>
        )}

        {/* Tags Card */}
        {place.tags && place.tags.length > 0 && (
          <div className="info-card">
            <h3>FEATURES</h3>
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
          <p>Help other pet owners discover this place.</p>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>REVIEWS ({reviews.length})</h2>
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
                      <label>Dog Size</label>
                      <select
                        value={reviewForm.dogParkReview.sizeAndLayout.dogSize}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              sizeAndLayout: {
                                ...reviewForm.dogParkReview.sizeAndLayout,
                                dogSize: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="large">Large Dogs</option>
                        <option value="medium">Medium Dogs</option>
                        <option value="small">Small Dogs</option>
                        <option value="all_sizes">All Sizes</option>
                      </select>
                    </div>
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
                      <label>Water Access</label>
                      <select
                        value={reviewForm.dogParkReview.amenitiesAndFacilities.waterAccess}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              amenitiesAndFacilities: {
                                ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                waterAccess: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="drinking_fountain">Drinking Fountain</option>
                        <option value="fire_hydrant">Fire Hydrant</option>
                        <option value="pool">Pool</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    
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
                    
                    <div className="form-group">
                      <label>Shade and Cover</label>
                      <select
                        value={reviewForm.dogParkReview.amenitiesAndFacilities.shadeAndCover}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              amenitiesAndFacilities: {
                                ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                shadeAndCover: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="trees">Trees</option>
                        <option value="shade_structures">Shade Structures</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.amenitiesAndFacilities.biodegradableBags}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              dogParkReview: {
                                ...reviewForm.dogParkReview,
                                amenitiesAndFacilities: {
                                  ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                  biodegradableBags: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Biodegradable Bags
                      </label>
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
                      <label>Overall Crowd</label>
                      <select
                        value={reviewForm.dogParkReview.crowdAndSocialDynamics.overallCrowd}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              crowdAndSocialDynamics: {
                                ...reviewForm.dogParkReview.crowdAndSocialDynamics,
                                overallCrowd: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="crowded">Crowded</option>
                        <option value="moderate">Moderate</option>
                        <option value="quiet">Quiet</option>
                      </select>
                    </div>
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

                  {/* 1. Access & Location - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🅿️ Access & Location</h5>
                    <div className="form-group">
                      <label>Parking Difficulty</label>
                      <select
                        value={reviewForm.vetClinicReview.accessAndLocation.parkingDifficulty}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              accessAndLocation: {
                                ...reviewForm.vetClinicReview.accessAndLocation,
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
                          checked={reviewForm.vetClinicReview.accessAndLocation.publicTransportAccess}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                accessAndLocation: {
                                  ...reviewForm.vetClinicReview.accessAndLocation,
                                  publicTransportAccess: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Public Transport Access
                      </label>
                    </div>
                  </div>

                  {/* 2. Hours of Operation - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🕐 Hours of Operation</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.vetClinicReview.hoursOfOperation.is24Hours}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                hoursOfOperation: {
                                  ...reviewForm.vetClinicReview.hoursOfOperation,
                                  is24Hours: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open 24 Hours
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Specific Hours</label>
                      <input
                        type="text"
                        value={reviewForm.vetClinicReview.hoursOfOperation.specificHours}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              hoursOfOperation: {
                                ...reviewForm.vetClinicReview.hoursOfOperation,
                                specificHours: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="e.g., 8 AM - 6 PM"
                      />
                    </div>
                  </div>

                  {/* 3. Clinic Environment & Facilities - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🏢 Clinic Environment & Facilities</h5>
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
                      <label>Facility Size</label>
                      <select
                        value={reviewForm.vetClinicReview.clinicEnvironmentAndFacilities.facilitySize}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              clinicEnvironmentAndFacilities: {
                                ...reviewForm.vetClinicReview.clinicEnvironmentAndFacilities,
                                facilitySize: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Cost & Transparency - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>💰 Cost & Transparency</h5>
                    <div className="form-group">
                      <label>Cost</label>
                      <select
                        value={reviewForm.vetClinicReview.costAndTransparency.cost}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              costAndTransparency: {
                                ...reviewForm.vetClinicReview.costAndTransparency,
                                cost: e.target.value,
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

                  {/* 5. Services & Specializations - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🩺 Services & Specializations</h5>
                    <div className="form-group">
                      <label>On-Site Diagnostics</label>
                      <div className="checkbox-group">
                        {["xray", "ultrasound", "bloodwork", "ecg"].map((diagnostic) => (
                          <label key={diagnostic}>
                            <input
                              type="checkbox"
                              checked={reviewForm.vetClinicReview.servicesAndSpecializations.onSiteDiagnostics.includes(diagnostic)}
                              onChange={(e) => {
                                const currentArray = reviewForm.vetClinicReview.servicesAndSpecializations.onSiteDiagnostics || [];
                                const newArray = e.target.checked
                                  ? [...currentArray, diagnostic]
                                  : currentArray.filter(item => item !== diagnostic);
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                                    servicesAndSpecializations: {
                                      ...reviewForm.vetClinicReview.servicesAndSpecializations,
                                      onSiteDiagnostics: newArray,
                                    },
                                  },
                                });
                              }}
                            />
                            {diagnostic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        ))}
                    </div>
                    </div>
                    <div className="form-group">
                      <label>Surgery Capabilities</label>
                    <div className="checkbox-group">
                        {["routine_spay_neuter", "orthopedic", "emergency", "dental"].map((surgery) => (
                          <label key={surgery}>
                        <input
                          type="checkbox"
                              checked={reviewForm.vetClinicReview.servicesAndSpecializations.surgeryCapabilities.includes(surgery)}
                              onChange={(e) => {
                                const currentArray = reviewForm.vetClinicReview.servicesAndSpecializations.surgeryCapabilities || [];
                                const newArray = e.target.checked
                                  ? [...currentArray, surgery]
                                  : currentArray.filter(item => item !== surgery);
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                    servicesAndSpecializations: {
                                      ...reviewForm.vetClinicReview.servicesAndSpecializations,
                                      surgeryCapabilities: newArray,
                                    },
                                  },
                                });
                              }}
                            />
                            {surgery.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                        ))}
                    </div>
                  </div>
                    <div className="form-group">
                      <label>Specializations</label>
                      <div className="checkbox-group">
                        {["cardiology", "dermatology", "oncology", "behavior", "exotic_animals"].map((specialization) => (
                          <label key={specialization}>
                            <input
                              type="checkbox"
                              checked={reviewForm.vetClinicReview.servicesAndSpecializations.specializations.includes(specialization)}
                              onChange={(e) => {
                                const currentArray = reviewForm.vetClinicReview.servicesAndSpecializations.specializations || [];
                                const newArray = e.target.checked
                                  ? [...currentArray, specialization]
                                  : currentArray.filter(item => item !== specialization);
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                                    servicesAndSpecializations: {
                                      ...reviewForm.vetClinicReview.servicesAndSpecializations,
                                      specializations: newArray,
                                    },
                                  },
                                });
                              }}
                            />
                            {specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 6. Emergency & After-Hours Care - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🚨 Emergency & After-Hours Care</h5>
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
                          checked={reviewForm.vetClinicReview.emergencyAndAfterHours.openEvenings}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                                emergencyAndAfterHours: {
                                  ...reviewForm.vetClinicReview.emergencyAndAfterHours,
                                  openEvenings: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Open Evenings
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
                    <div className="form-group">
                      <label>Emergency Triage Speed</label>
                      <select
                        value={reviewForm.vetClinicReview.emergencyAndAfterHours.emergencyTriageSpeed}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                              emergencyAndAfterHours: {
                                ...reviewForm.vetClinicReview.emergencyAndAfterHours,
                                emergencyTriageSpeed: e.target.value,
                                },
                              },
                            })
                          }
                      >
                        <option value="">Select...</option>
                        <option value="immediate">Immediate</option>
                        <option value="within_30_min">Within 30 Min</option>
                        <option value="within_1_hour">Within 1 Hour</option>
                        <option value="over_1_hour">Over 1 Hour</option>
                      </select>
                    </div>
                  </div>

                  {/* 7. Staff & Service Quality - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>👨‍⚕️ Staff & Service Quality</h5>
                    <div className="form-group">
                      <label>Staff Friendliness</label>
                      <select
                        value={reviewForm.vetClinicReview.staffAndServiceQuality.staffFriendliness}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            vetClinicReview: {
                              ...reviewForm.vetClinicReview,
                              staffAndServiceQuality: {
                                ...reviewForm.vetClinicReview.staffAndServiceQuality,
                                staffFriendliness: e.target.value,
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
                      <label>Veterinarian Experience</label>
                      <select
                        value={reviewForm.vetClinicReview.staffAndServiceQuality.veterinarianExperience}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              vetClinicReview: {
                                ...reviewForm.vetClinicReview,
                              staffAndServiceQuality: {
                                ...reviewForm.vetClinicReview.staffAndServiceQuality,
                                veterinarianExperience: e.target.value,
                                },
                              },
                            })
                          }
                      >
                        <option value="">Select...</option>
                        <option value="novice">Novice</option>
                        <option value="experienced">Experienced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Pet Store Specific Form - All 6 Categories */}
              {(place.type === "pet store" || place.type === "pet_store") && (
                <div className="pet-store-form">
                  <h4>🛍️ PET STORE DETAILS</h4>

                  {/* 1. Access & Location - BACKEND ALIGNED */}
                  <div className="form-section">
                    <h5>🅿️ Access & Location</h5>
                    <div className="form-group">
                      <label>Parking Difficulty</label>
                      <select
                        value={reviewForm.petStoreReview.accessAndLocation.parkingDifficulty}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            petStoreReview: {
                              ...reviewForm.petStoreReview,
                              accessAndLocation: {
                                ...reviewForm.petStoreReview.accessAndLocation,
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
                      <label>Parking Difficulty</label>
                      <select
                        value={reviewForm.animalShelterReview.accessAndLocation.parkingDifficulty}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              accessAndLocation: {
                                ...reviewForm.animalShelterReview.accessAndLocation,
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
                  </div>

                  {/* 2. Hours of Operation */}
                  <div className="form-section">
                    <h5>🕐 Hours of Operation</h5>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.hoursOfOperation.is24Hours}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                hoursOfOperation: {
                                  ...reviewForm.animalShelterReview.hoursOfOperation,
                                  is24Hours: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        24 Hours Open
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Specific Hours (if not 24 hours)</label>
                      <input
                        type="text"
                        placeholder="e.g., 10 AM - 6 PM"
                        value={reviewForm.animalShelterReview.hoursOfOperation.specificHours}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              hoursOfOperation: {
                                ...reviewForm.animalShelterReview.hoursOfOperation,
                                specificHours: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* 3. Animal Type Selection */}
                  <div className="form-section">
                    <h5>🐾 Animal Type Selection</h5>
                    <div className="checkbox-group">
                      <h6>Available Animal Types</h6>
                      {["dogs", "cats", "rabbits", "birds", "reptiles", "small_mammals"].map((type) => (
                        <label key={type}>
                          <input
                            type="checkbox"
                            checked={reviewForm.animalShelterReview.animalTypeSelection.availableAnimalTypes.includes(type)}
                            onChange={(e) => {
                              const currentTypes = reviewForm.animalShelterReview.animalTypeSelection.availableAnimalTypes;
                              const newTypes = e.target.checked
                                ? [...currentTypes, type]
                                : currentTypes.filter((t) => t !== type);
                              setReviewForm({
                                ...reviewForm,
                                animalShelterReview: {
                                  ...reviewForm.animalShelterReview,
                                  animalTypeSelection: {
                                    ...reviewForm.animalShelterReview.animalTypeSelection,
                                    availableAnimalTypes: newTypes,
                                  },
                                },
                              });
                            }}
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
                        </label>
                      ))}
                    </div>
                    <div className="form-group">
                      <label>Breed Variety</label>
                      <select
                        value={reviewForm.animalShelterReview.animalTypeSelection.breedVariety}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              animalTypeSelection: {
                                ...reviewForm.animalShelterReview.animalTypeSelection,
                                breedVariety: e.target.value,
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
                  </div>

                  {/* 4. Animal Care & Welfare */}
                  <div className="form-section">
                    <h5>🏥 Animal Care & Welfare</h5>
                    <div className="form-group">
                      <label>Animal Health</label>
                      <select
                        value={reviewForm.animalShelterReview.animalCareAndWelfare.animalHealth}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              animalCareAndWelfare: {
                                ...reviewForm.animalShelterReview.animalCareAndWelfare,
                                animalHealth: e.target.value,
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
                      <label>Living Conditions</label>
                      <select
                        value={reviewForm.animalShelterReview.animalCareAndWelfare.livingConditions}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              animalCareAndWelfare: {
                                ...reviewForm.animalShelterReview.animalCareAndWelfare,
                                livingConditions: e.target.value,
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
                  </div>

                  {/* 5. Adoption Process & Support */}
                  <div className="form-section">
                    <h5>📋 Adoption Process & Support</h5>
                    <div className="form-group">
                      <label>Application Process</label>
                      <select
                        value={reviewForm.animalShelterReview.adoptionProcessAndSupport.applicationProcess}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              adoptionProcessAndSupport: {
                                ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                applicationProcess: e.target.value,
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
                    <div className="form-group">
                      <label>Processing Time</label>
                      <select
                        value={reviewForm.animalShelterReview.adoptionProcessAndSupport.processingTime}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              adoptionProcessAndSupport: {
                                ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                processingTime: e.target.value,
                              },
                            },
                          })
                        }
                      >
                        <option value="">Select...</option>
                        <option value="same_day">Same Day</option>
                        <option value="within_week">Within Week</option>
                        <option value="1_2_weeks">1-2 Weeks</option>
                        <option value="over_2_weeks">Over 2 Weeks</option>
                      </select>
                    </div>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.animalShelterReview.adoptionProcessAndSupport.homeVisitRequired}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                adoptionProcessAndSupport: {
                                  ...reviewForm.animalShelterReview.adoptionProcessAndSupport,
                                  homeVisitRequired: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Home Visit Required
                      </label>
                    </div>
                  </div>

                  {/* 6. Staff & Volunteer Quality */}
                  <div className="form-section">
                    <h5>👨‍👩‍👧‍👦 Staff & Volunteer Quality</h5>
                    <div className="form-group">
                      <label>Staff Knowledge</label>
                      <select
                        value={reviewForm.animalShelterReview.staffAndVolunteerQuality.staffKnowledge}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              staffAndVolunteerQuality: {
                                ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                staffKnowledge: e.target.value,
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
                      <label>Customer Service</label>
                      <select
                        value={reviewForm.animalShelterReview.staffAndVolunteerQuality.customerService}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            animalShelterReview: {
                              ...reviewForm.animalShelterReview,
                              staffAndVolunteerQuality: {
                                ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                customerService: e.target.value,
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
                          checked={reviewForm.animalShelterReview.staffAndVolunteerQuality.volunteerProgram}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              animalShelterReview: {
                                ...reviewForm.animalShelterReview,
                                staffAndVolunteerQuality: {
                                  ...reviewForm.animalShelterReview.staffAndVolunteerQuality,
                                  volunteerProgram: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        Volunteer Program Available
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
                {/* Like button positioned absolutely in top-right corner */}
                <button
                  className={`like-review-button ${reviewLikes[review._id]?.liked ? "liked" : ""}`}
                  onClick={() => handleReviewLike(review._id)}
                  title={reviewLikes[review._id]?.liked ? "Unlike this review" : "Like this review"}
                >
                  👍 {reviewLikes[review._id]?.likeCount || review.likeCount || 0}
                </button>

                <div className="review-simple-content">
                  <span className="reviewer-name">{review.userId?.name || "Anonymous"}</span>
                  <span className="review-rating">{"⭐".repeat(review.rating)}</span>
                  <span className="review-comment-text">{review.comment || "No comment"}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {/* Delete button - only show for user's own reviews */}
                  {mongoUser && review.userId?._id === mongoUser._id && (
                    <button
                      className="delete-review-button"
                      onClick={() => handleDeleteReview(review._id)}
                      title="Delete your review"
                    >
                      DELETE
                    </button>
                  )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Place</h2>
            <p>
              Are you sure you want to delete <strong>{place.name}</strong>?
            </p>
            <p className="warning-text">
              This action cannot be undone. All reviews and cards associated with this place will also be deleted.
            </p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                Cancel
              </button>
              <button className="delete-button" onClick={handleDeletePlace} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete Place"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Notification Popup */}
      <CardNotificationPopup 
        show={showCardNotification}
        cardType={cardType}
        onClose={() => setShowCardNotification(false)}
      />
    </div>
  );
};

export default PlaceDetails;
