import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { placeAPI, reviewAPI } from '../services/api';
import '../styles/PlaceDetails.css';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { mongoUser, firebaseUser } = useUser();
  
  // State management
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dogParkStats, setDogParkStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [address, setAddress] = useState(''); // Add state for resolved address
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    dogParkReview: {
      accessAndLocation: {
        parkingDifficulty: '',
        handicapFriendly: false,
        parkingToParkDistance: ''
      },
      hoursOfOperation: {
        is24Hours: false,
        dawnToDusk: false,
        specificHours: ''
      },
      safetyLevel: {
        fencingCondition: '',
        doubleGated: false,
        nightIllumination: false,
        firstAidStation: false,
        emergencyContact: false,
        surveillanceCameras: false,
        noSharpEdges: false
      },
      sizeAndLayout: {
        separateAreas: '',
        runningSpace: '',
        drainagePerformance: ''
      },
      amenitiesAndFacilities: {
        seatingLevel: '',
        shadeAndCover: '',
        wasteStation: false,
        biodegradableBags: false,
        restroom: false,
        waterAccess: ''
      },
      maintenanceAndCleanliness: {
        overallCleanliness: '',
        trashLevel: '',
        odorLevel: '',
        equipmentCondition: ''
      },
      crowdAndSocialDynamics: {
        peakDays: [],
        peakHours: '',
        socialEvents: [],
        ownerCulture: '',
        wastePickup: '',
        ownerFriendliness: ''
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: '',
        vaccinationRequired: false,
        aggressiveDogPolicy: '',
        otherRules: '',
        communityEnforcement: ''
      }
    }
  });

  // Location types with icons
  const locationTypes = {
    'dog park': { label: 'Dog Park', icon: '🌳', color: '#22c55e' },
    vet: { label: 'Veterinarian', icon: '🏥', color: '#3b82f6' },
    'pet store': { label: 'Pet Store', icon: '🏪', color: '#f59e0b' },
    other: { label: 'Other', icon: '📍', color: '#6b7280' }
  };

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Try to construct a nice address from the components
        const addr = data.address || {};
        
        let streetAddress = '';
        
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
        let cityInfo = '';
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
        let fullAddress = '';
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
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  // Load place data and reviews
  useEffect(() => {
    const loadPlaceData = async () => {
      try {
        setLoading(true);
        console.log('Loading place data for ID:', id);
        console.log('Location state:', location.state);
        
        // Check if this is an OSM-based ID OR a numeric OSM node ID
        if (id.startsWith('osm-') || /^\d+$/.test(id)) {
          let osmLocation = null;
          
          if (location.state?.locationData) {
            osmLocation = location.state.locationData;
          } else if (id.startsWith('osm-')) {
            // Parse coordinates from OSM ID format: osm-lat-lng
            const parts = id.split('-');
            if (parts.length >= 3) {
              const lat = parseFloat(parts[1]);
              const lng = parseFloat(parts[2]);
              osmLocation = {
                name: 'Location from Map',
                type: 'other',
                latitude: lat,
                longitude: lng,
                tags: ['from-map']
              };
            }
          } else if (/^\d+$/.test(id)) {
            // This is a pure OSM node ID - we need the location data from navigation state
            if (!location.state?.locationData) {
              throw new Error('OSM location data not found. Please navigate from the map.');
            }
            osmLocation = location.state.locationData;
          }
          
          if (osmLocation) {
            // First, try to find if this place already exists in database by coordinates
            let existingPlace = null;
            try {
              console.log('Checking if place exists in database by coordinates:', {
                lat: osmLocation.latitude,
                lng: osmLocation.longitude
              });
              
              // Try to find place by coordinates (within ~100 meters)
              const places = await placeAPI.getAllPlaces();
              const tolerance = 0.001; // roughly 100 meters
              
              console.log('Searching for existing places. OSM location coords:', {
                lat: osmLocation.latitude,
                lng: osmLocation.longitude
              });
              console.log('Database places:', places.map(p => ({
                id: p._id,
                name: p.name,
                coords: p.coordinates
              })));
              
              existingPlace = places.find(p => {
                if (!p.coordinates) return false;
                const latDiff = Math.abs(p.coordinates.lat - osmLocation.latitude);
                const lngDiff = Math.abs(p.coordinates.lng - osmLocation.longitude);
                const matches = latDiff < tolerance && lngDiff < tolerance;
                
                console.log('Comparing with place:', {
                  id: p._id,
                  name: p.name,
                  dbCoords: p.coordinates,
                  osmCoords: { lat: osmLocation.latitude, lng: osmLocation.longitude },
                  latDiff,
                  lngDiff,
                  tolerance,
                  matches
                });
                
                return matches;
              });
              
              if (existingPlace) {
                console.log('Found existing place in database:', existingPlace);
                // Redirect to the existing place instead of treating as OSM
                navigate(`/place/${existingPlace._id}`, { replace: true });
                return;
              } else {
                console.log('No existing place found - will treat as new OSM location');
              }
            } catch (coordError) {
              console.log('Could not search for existing place by coordinates:', coordError);
            }
            
            // Create enhanced place object from OSM data
            const enhancedPlace = {
              _id: id,
              name: osmLocation.name || 'Unnamed Location',
              type: osmLocation.type || 'other',
              coordinates: { 
                lat: osmLocation.latitude, 
                lng: osmLocation.longitude 
              },
              tags: osmLocation.tags || [],
              address: osmLocation.address || '',
              phone: osmLocation.phone || '',
              website: osmLocation.website || '',
              opening_hours: osmLocation.opening_hours || '',
              description: osmLocation.description || '',
              addedBy: null,
              createdAt: new Date(),
              isOSMLocation: true // Flag to indicate this is from OSM
            };
            
            setPlace(enhancedPlace);
            
            // Try to get a proper street address from coordinates
            if (osmLocation.latitude && osmLocation.longitude && !enhancedPlace.address) {
              console.log('Attempting reverse geocoding for coordinates:', osmLocation.latitude, osmLocation.longitude);
              const resolvedAddress = await reverseGeocode(osmLocation.latitude, osmLocation.longitude);
              if (resolvedAddress) {
                console.log('Resolved address:', resolvedAddress);
                setAddress(resolvedAddress);
                // Update the place object with the resolved address
                setPlace(prev => ({ ...prev, address: resolvedAddress }));
              }
            }
            
            // ALWAYS try to load reviews for OSM locations in case they were already saved
            try {
              console.log('Attempting to load reviews for OSM location:', id);
              const reviewsData = await reviewAPI.getReviewsByPlace(id);
              console.log('Found reviews for OSM location:', reviewsData);
              setReviews(reviewsData);
              
              // Load dog park stats if it's a dog park and has reviews
              if ((osmLocation.type === 'dog park' || osmLocation.type === 'leisure') && reviewsData.length > 0) {
                try {
                  const statsData = await reviewAPI.getDogParkStats(id);
                  setDogParkStats(statsData);
                } catch (statsError) {
                  console.error('Error loading dog park stats for OSM location:', statsError);
                  setDogParkStats(null);
                }
              } else {
                setDogParkStats(null);
              }
            } catch (reviewError) {
              console.log('No reviews found for OSM location (this is normal for new locations):', reviewError);
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
            console.log('Attempting reverse geocoding for database place:', placeData.coordinates);
            const resolvedAddress = await reverseGeocode(placeData.coordinates.lat, placeData.coordinates.lng);
            if (resolvedAddress) {
              console.log('Resolved address for database place:', resolvedAddress);
              setAddress(resolvedAddress);
              // Update the place object with the resolved address
              setPlace(prev => ({ ...prev, address: resolvedAddress }));
            }
          }
          
          // Load reviews
          const reviewsData = await reviewAPI.getReviewsByPlace(id);
          setReviews(reviewsData);
          
          // Load dog park stats if it's a dog park
          if (placeData.type === 'dog park') {
            try {
              const statsData = await reviewAPI.getDogParkStats(id);
              setDogParkStats(statsData);
            } catch (statsError) {
              console.error('Error loading dog park stats:', statsError);
            }
          }
        } catch (placeError) {
          console.error('Error loading place from database:', placeError);
          // If place not found in database, treat as invalid ID
          throw new Error(`Place with ID ${id} not found`);
        }
        
      } catch (err) {
        console.error('Error loading place data:', err);
        setError('Failed to load place information. The place might not exist or there might be a server issue.');
        
        // If it's a malformed OSM ID or other issue, offer to go back to home
        if (id.startsWith('osm-') || /^\d+$/.test(id)) {
          setTimeout(() => {
            navigate('/');
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
    
    // Check if user is logged in
    if (!mongoUser || !firebaseUser) {
      alert('Please log in to leave a review. You will be redirected to the login page.');
      navigate('/login');
      return;
    }

    // Check if this is an OSM location that needs to be saved first
    if (id.startsWith('osm-') || /^\d+$/.test(id)) {
      try {
        // For OSM locations, we'll let the backend create the place automatically
        const lat = Number(place.coordinates?.lat);
        const lng = Number(place.coordinates?.lng);
        
        // Validate coordinates before creating place data
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          throw new Error(`Invalid coordinates: lat=${place.coordinates?.lat}, lng=${place.coordinates?.lng}`);
        }
        
        // Map OSM place types to our database enum values
        let mappedType = place.type || 'other';
        if (mappedType === 'dog_park') mappedType = 'dog park';
        if (mappedType === 'pet_store') mappedType = 'pet store';
        
        // Prepare place data for the backend to create automatically
        const placeData = {
          name: place.name || 'Unnamed Location',
          type: mappedType,
          coordinates: {
            lat: lat,
            lng: lng
          },
          tags: place.tags || [],
          address: place.address || '',
          phone: place.phone || '',
          website: place.website || '',
          opening_hours: place.opening_hours || '',
          description: place.description || ''
        };
        
        // Submit the review with place data - backend will create place automatically
        const reviewData = {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userId: mongoUser._id,
          placeData: placeData // Include place data for automatic creation
        };

        // Add dog park review data if it's a dog park
        if (mappedType === 'dog park') {
          reviewData.dogParkReview = reviewForm.dogParkReview;
        }

        console.log('Submitting review with place auto-creation:', reviewData);
        const createdReview = await reviewAPI.createReview(reviewData);
        console.log('Review created successfully (place auto-created or found):', createdReview);
        
        // Extract the place ID from the review response
        const actualPlaceId = createdReview.placeId;
        console.log('Actual place ID used:', actualPlaceId);
        
        // If the place ID is different from current URL, navigate to the correct place
        if (actualPlaceId !== id) {
          console.log('Navigating to existing place:', actualPlaceId);
          navigate(`/place/${actualPlaceId}`);
          return;
        }
        
        // Update the place state to reflect it's now in the database
        setPlace({ ...place, _id: actualPlaceId, isOSMLocation: false });
        
        // Reload reviews
        const updatedReviews = await reviewAPI.getReviewsByPlace(actualPlaceId);
        setReviews(updatedReviews);
        
        // Reload stats if dog park
        if (mappedType === 'dog park') {
          const updatedStats = await reviewAPI.getDogParkStats(actualPlaceId);
          setDogParkStats(updatedStats);
        }
        
        // Reset form and hide it
        setShowReviewForm(false);
        setReviewForm({
          rating: 5,
          comment: '',
          dogParkReview: reviewForm.dogParkReview
        });
        
        alert('Review submitted successfully!');
        return;
        
      } catch (err) {
        console.error('Error submitting review with place auto-creation:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          stack: err.stack
        });
        
        let errorMessage = 'Failed to save place and submit review. ';
        if (err.response?.status === 401) {
          errorMessage += 'Authentication failed. Please try logging out and back in.';
        } else if (err.response?.status === 403) {
          errorMessage += 'Permission denied. Please check your login status.';
        } else if (err.response?.status === 400) {
          const errorDetails = err.response?.data?.details || err.response?.data?.error || err.message;
          errorMessage += `Invalid data: ${errorDetails}`;
          console.log('Full error response:', err.response?.data);
        } else {
          errorMessage += 'Please try again.';
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
        userId: mongoUser._id // Add user ID to review
      };

      // Add dog park review data if it's a dog park
      if (place.type === 'dog park') {
        reviewData.dogParkReview = reviewForm.dogParkReview;
      }

      console.log('Submitting review with data:', reviewData);
      const createdReview = await reviewAPI.createReview(reviewData);
      console.log('Review created successfully:', createdReview);
      
      // Reload reviews
      const updatedReviews = await reviewAPI.getReviewsByPlace(id);
      setReviews(updatedReviews);
      
      // Reload stats if dog park
      if (place.type === 'dog park') {
        const updatedStats = await reviewAPI.getDogParkStats(id);
        setDogParkStats(updatedStats);
      }
      
      // Reset form and hide it
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        comment: '',
        dogParkReview: reviewForm.dogParkReview // Keep structure but reset values
      });
      
      alert('Review submitted successfully!');
      
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
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
        parkingToParkDistance: { close: 0, moderate: 0, far: 0 }
      },
      hoursOfOperation: {
        is24Hours: { true: 0, false: 0 },
        dawnToDusk: { true: 0, false: 0 }
      },
      safetyLevel: {
        fencingCondition: { fully_enclosed: 0, partially_enclosed: 0, not_enclosed: 0 },
        doubleGated: { true: 0, false: 0 },
        nightIllumination: { true: 0, false: 0 },
        firstAidStation: { true: 0, false: 0 },
        emergencyContact: { true: 0, false: 0 },
        surveillanceCameras: { true: 0, false: 0 },
        noSharpEdges: { true: 0, false: 0 }
      },
      sizeAndLayout: {
        separateAreas: { yes_small_large: 0, yes_other: 0, no: 0 },
        runningSpace: { enough: 0, limited: 0, tight: 0 },
        drainagePerformance: { excellent: 0, good: 0, poor: 0 }
      },
      amenitiesAndFacilities: {
        seatingLevel: { bench: 0, gazebo: 0, no_seat: 0 },
        shadeAndCover: { trees: 0, shade_structures: 0, none: 0 },
        wasteStation: { true: 0, false: 0 },
        biodegradableBags: { true: 0, false: 0 },
        restroom: { true: 0, false: 0 },
        waterAccess: { drinking_fountain: 0, fire_hydrant: 0, pool: 0, none: 0 }
      },
      maintenanceAndCleanliness: {
        overallCleanliness: { good: 0, neutral: 0, bad: 0 },
        trashLevel: { clean: 0, moderate: 0, dirty: 0 },
        odorLevel: { none: 0, mild: 0, strong: 0 },
        equipmentCondition: { good: 0, fair: 0, poor: 0 }
      },
      crowdAndSocialDynamics: {
        ownerCulture: { excellent: 0, good: 0, fair: 0, poor: 0 },
        wastePickup: { always: 0, usually: 0, sometimes: 0, rarely: 0 },
        ownerFriendliness: { very_friendly: 0, friendly: 0, neutral: 0, unfriendly: 0 }
      },
      rulesPoliciesAndCommunity: {
        leashPolicy: { off_leash_allowed: 0, leash_required: 0, mixed_areas: 0 },
        vaccinationRequired: { true: 0, false: 0 },
        aggressiveDogPolicy: { strict: 0, moderate: 0, lenient: 0, none: 0 },
        communityEnforcement: { strict: 0, moderate: 0, lenient: 0, none: 0 }
      }
    };

    // Count occurrences from all reviews
    reviews.forEach(review => {
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
          if (af.biodegradableBags !== undefined) tagCounts.amenitiesAndFacilities.biodegradableBags[af.biodegradableBags]++;
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
          if (rpc.vaccinationRequired !== undefined) tagCounts.rulesPoliciesAndCommunity.vaccinationRequired[rpc.vaccinationRequired]++;
          if (rpc.aggressiveDogPolicy) tagCounts.rulesPoliciesAndCommunity.aggressiveDogPolicy[rpc.aggressiveDogPolicy]++;
          if (rpc.communityEnforcement) tagCounts.rulesPoliciesAndCommunity.communityEnforcement[rpc.communityEnforcement]++;
        }
      }
    });

    return tagCounts;
  };

  // Get tag styling based on frequency
  const getTagStyle = (category, field, value, tagCounts) => {
    if (!tagCounts[category] || !tagCounts[category][field]) {
      return 'option-tag gray'; // Default gray for no data
    }
    
    const count = tagCounts[category][field][value] || 0;
    const totalReviews = reviews.length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    if (count === 0) return 'option-tag gray';
    if (percentage >= 60) return 'option-tag popular'; // Most popular (bright color)
    if (percentage >= 30) return 'option-tag common'; // Common (medium color)
    if (percentage >= 10) return 'option-tag mentioned'; // Mentioned (light color)
    return 'option-tag rare'; // Rarely mentioned (faded color)
  };

  // Render smart category tags - show top 3-5 relevant tags per category
  const renderSmartCategoryTags = (category, tagCounts) => {
    const tagMappings = {
      accessAndLocation: [
        { category: 'accessAndLocation', field: 'parkingDifficulty', value: 'easy', label: '🚗 Easy Parking' },
        { category: 'accessAndLocation', field: 'parkingDifficulty', value: 'moderate', label: '🚗 Moderate Parking' },
        { category: 'accessAndLocation', field: 'parkingDifficulty', value: 'difficult', label: '🚗 Difficult Parking' },
        { category: 'accessAndLocation', field: 'handicapFriendly', value: true, label: '♿ Handicap Friendly' }
      ],
      hoursOfOperation: [
        { category: 'hoursOfOperation', field: 'is24Hours', value: true, label: '🕐 24 Hours Open' },
        { category: 'hoursOfOperation', field: 'dawnToDusk', value: true, label: '🌅 Dawn to Dusk' }
      ],
      safetyLevel: [
        { category: 'safetyLevel', field: 'fencingCondition', value: 'fully_enclosed', label: '🚧 Fully Enclosed' },
        { category: 'safetyLevel', field: 'fencingCondition', value: 'partially_enclosed', label: '🚧 Partially Enclosed' },
        { category: 'safetyLevel', field: 'doubleGated', value: true, label: '🚪 Double Gated' },
        { category: 'safetyLevel', field: 'nightIllumination', value: true, label: '💡 Night Lighting' }
      ],
      sizeAndLayout: [
        { category: 'sizeAndLayout', field: 'separateAreas', value: 'yes_small_large', label: '📐 Small/Large Areas' },
        { category: 'sizeAndLayout', field: 'runningSpace', value: 'enough', label: '🏃 Enough Space' },
        { category: 'sizeAndLayout', field: 'runningSpace', value: 'limited', label: '🏃 Limited Space' }
      ],
      amenitiesAndFacilities: [
        { category: 'amenitiesAndFacilities', field: 'seatingLevel', value: 'bench', label: '🪑 Bench Seating' },
        { category: 'amenitiesAndFacilities', field: 'wasteStation', value: true, label: '🗑️ Waste Station' },
        { category: 'amenitiesAndFacilities', field: 'restroom', value: true, label: '🚻 Restroom' },
        { category: 'amenitiesAndFacilities', field: 'shadeAndCover', value: 'trees', label: '🌳 Tree Shade' }
      ],
      maintenanceAndCleanliness: [
        { category: 'maintenanceAndCleanliness', field: 'overallCleanliness', value: 'good', label: '🧽 Good Cleanliness' },
        { category: 'maintenanceAndCleanliness', field: 'overallCleanliness', value: 'neutral', label: '🧽 Fair Cleanliness' },
        { category: 'maintenanceAndCleanliness', field: 'overallCleanliness', value: 'bad', label: '🧽 Poor Cleanliness' }
      ],
      crowdAndSocialDynamics: [
        { category: 'crowdAndSocialDynamics', field: 'ownerCulture', value: 'excellent', label: '⭐ Excellent Culture' },
        { category: 'crowdAndSocialDynamics', field: 'ownerCulture', value: 'good', label: '⭐ Good Culture' },
        { category: 'crowdAndSocialDynamics', field: 'ownerFriendliness', value: 'very_friendly', label: '😊 Very Friendly' },
        { category: 'crowdAndSocialDynamics', field: 'ownerFriendliness', value: 'friendly', label: '🙂 Friendly' }
      ],
      rulesPoliciesAndCommunity: [
        { category: 'rulesPoliciesAndCommunity', field: 'leashPolicy', value: 'off_leash_allowed', label: '🦮 Off-Leash Allowed' },
        { category: 'rulesPoliciesAndCommunity', field: 'leashPolicy', value: 'leash_required', label: '🦮 Leash Required' },
        { category: 'rulesPoliciesAndCommunity', field: 'vaccinationRequired', value: true, label: '💉 Vaccination Required' }
      ]
    };

    const mapping = tagMappings[category];
    if (!mapping) return [];

    // Calculate popularity scores and sort
    const tagsWithScores = mapping.map(tag => {
      const count = tagCounts[tag.category]?.[tag.field]?.[tag.value] || 0;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return {
        ...tag,
        count,
        percentage,
        styleClass: getTagStyle(tag.category, tag.field, tag.value, tagCounts)
      };
    });

    // Sort by count (popular first) and limit to 4 tags
    const sortedTags = tagsWithScores
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return sortedTags.map(tag => (
      <span 
        key={`${tag.field}-${tag.value}`} 
        className={tag.styleClass}
        title={tag.count > 0 ? `${tag.count} review${tag.count !== 1 ? 's' : ''} mention this` : 'No reviews mention this yet'}
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
          <p>{error || 'Place not found'}</p>
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
            <span className="type-icon">
              {locationTypes[place.type]?.icon || '📍'}
            </span>
            <span className="type-label">
              {locationTypes[place.type]?.label || place.type}
            </span>
          </div>
          <div className="place-address">
            {place.address && <span className="address-line">📍 {place.address}</span>}
            {!place.address && place.coordinates && (
              <span className="address-line">📍 {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}</span>
            )}
            {!place.address && !place.coordinates && <span className="address-line">📍 Address not available</span>}
          </div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="hero-image-section">
        <div className="hero-placeholder">
          <span className="hero-icon">🌳</span>
          <h2>PLACE IMAGE</h2>
        </div>
      </div>

      {/* Dog Park Categories Overview - Show all 8 categories with available options */}
      {(place.type === 'dog park' || place.type === 'leisure' || true) && (
        <div className="dog-park-stats">
          <h2>🐕 DOG PARK CATEGORIES</h2>
          <p className="categories-description">Evaluate this dog park across these 8 key categories when leaving a review</p>
          
          {/* Show review statistics if available */}
          {dogParkStats && dogParkStats.totalReviews > 0 && (
            <div className="review-stats-summary">
              <h3>📊 REVIEW SUMMARY ({dogParkStats.totalReviews} reviews)</h3>
              <p>Average Rating: <strong>{dogParkStats.averageRating}/5 ⭐</strong></p>
            </div>
          )}
          
          <div className="category-tags-grid">
            {/* 1. Access & Location */}
            <div className="category-section">
              <h3>📍 Access & Location</h3>
              <p className="category-description">Ease of reaching and using the park</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('accessAndLocation', analyzeReviewTags())}
              </div>
            </div>

            {/* 2. Hours of Operation */}
            <div className="category-section">
              <h3>⏰ Hours of Operation</h3>
              <p className="category-description">When the park is available for use</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('hoursOfOperation', analyzeReviewTags())}
              </div>
            </div>

            {/* 3. Safety Level */}
            <div className="category-section">
              <h3>🛡️ Safety Level</h3>
              <p className="category-description">Security and safety features</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('safetyLevel', analyzeReviewTags())}
              </div>
            </div>

            {/* 4. Size & Layout */}
            <div className="category-section">
              <h3>📏 Size & Layout</h3>
              <p className="category-description">Space design and functionality</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('sizeAndLayout', analyzeReviewTags())}
              </div>
            </div>

            {/* 5. Amenities & Facilities */}
            <div className="category-section">
              <h3>🎾 Amenities & Facilities</h3>
              <p className="category-description">Comfort and convenience features</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('amenitiesAndFacilities', analyzeReviewTags())}
              </div>
            </div>

            {/* 6. Maintenance & Cleanliness */}
            <div className="category-section">
              <h3>🧹 Maintenance & Cleanliness</h3>
              <p className="category-description">Upkeep and hygiene standards</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('maintenanceAndCleanliness', analyzeReviewTags())}
              </div>
            </div>

            {/* 7. Crowd & Social Dynamics */}
            <div className="category-section">
              <h3>👥 Crowd & Social Dynamics</h3>
              <p className="category-description">Usage patterns and community behavior</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('crowdAndSocialDynamics', analyzeReviewTags())}
              </div>
            </div>

            {/* 8. Rules, Policies & Community */}
            <div className="category-section">
              <h3>📋 Rules, Policy & Community</h3>
              <p className="category-description">Regulations and community standards</p>
              <div className="feature-tags">
                {renderSmartCategoryTags('rulesPoliciesAndCommunity', analyzeReviewTags())}
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
                <span key={index} className="tag-chip">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Review Call-to-Action for OSM locations */}
      {place.isOSMLocation && (
        <div className="osm-review-cta">
          <h2>🎯 HELP OTHERS DISCOVER THIS PLACE!</h2>
          <p>This location was found on the map. Be the first to review it and help other pet owners know what to expect!</p>
          {mongoUser ? (
            <button 
              className="big-review-button"
              onClick={() => setShowReviewForm(true)}
            >
              🌟 BE THE FIRST TO REVIEW
            </button>
          ) : (
            <button 
              className="big-review-button login-required"
              onClick={() => {
                alert('Please log in to add a review. You will be redirected to the login page.');
                navigate('/login');
              }}
            >
              🔐 LOG IN TO REVIEW
            </button>
          )}
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>📝 REVIEWS ({reviews.length})</h2>
          {mongoUser ? (
            <button 
              className="add-review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? '✖ CANCEL' : '+ ADD REVIEW'}
            </button>
          ) : (
            <button 
              className="add-review-button login-required"
              onClick={() => {
                alert('Please log in to add a review. You will be redirected to the login page.');
                navigate('/login');
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
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-button ${reviewForm.rating >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
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
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>

              {/* Dog Park Specific Form - All 8 Categories */}
              {(place.type === 'dog park' || place.type === 'leisure' || true) && (
                <div className="dog-park-form">
                  <h4>🐕 DOG PARK DETAILS</h4>
                  
                  {/* 1. Access & Location */}
                  <div className="form-section">
                    <h5>📍 Access & Location</h5>
                    <div className="form-group">
                      <label>Parking Difficulty</label>
                      <select
                        value={reviewForm.dogParkReview.accessAndLocation.parkingDifficulty}
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            accessAndLocation: {
                              ...reviewForm.dogParkReview.accessAndLocation,
                              parkingDifficulty: e.target.value
                            }
                          }
                        })}
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
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              accessAndLocation: {
                                ...reviewForm.dogParkReview.accessAndLocation,
                                handicapFriendly: e.target.checked
                              }
                            }
                          })}
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
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              hoursOfOperation: {
                                ...reviewForm.dogParkReview.hoursOfOperation,
                                is24Hours: e.target.checked
                              }
                            }
                          })}
                        />
                        Open 24/7
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.hoursOfOperation.dawnToDusk}
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              hoursOfOperation: {
                                ...reviewForm.dogParkReview.hoursOfOperation,
                                dawnToDusk: e.target.checked
                              }
                            }
                          })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            safetyLevel: {
                              ...reviewForm.dogParkReview.safetyLevel,
                              fencingCondition: e.target.value
                            }
                          }
                        })}
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
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              safetyLevel: {
                                ...reviewForm.dogParkReview.safetyLevel,
                                doubleGated: e.target.checked
                              }
                            }
                          })}
                        />
                        Double Gated Entry
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.safetyLevel.nightIllumination}
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              safetyLevel: {
                                ...reviewForm.dogParkReview.safetyLevel,
                                nightIllumination: e.target.checked
                              }
                            }
                          })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            sizeAndLayout: {
                              ...reviewForm.dogParkReview.sizeAndLayout,
                              separateAreas: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            sizeAndLayout: {
                              ...reviewForm.dogParkReview.sizeAndLayout,
                              runningSpace: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            amenitiesAndFacilities: {
                              ...reviewForm.dogParkReview.amenitiesAndFacilities,
                              seatingLevel: e.target.value
                            }
                          }
                        })}
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
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              amenitiesAndFacilities: {
                                ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                wasteStation: e.target.checked
                              }
                            }
                          })}
                        />
                        Waste Station
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={reviewForm.dogParkReview.amenitiesAndFacilities.restroom}
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              amenitiesAndFacilities: {
                                ...reviewForm.dogParkReview.amenitiesAndFacilities,
                                restroom: e.target.checked
                              }
                            }
                          })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            maintenanceAndCleanliness: {
                              ...reviewForm.dogParkReview.maintenanceAndCleanliness,
                              overallCleanliness: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            maintenanceAndCleanliness: {
                              ...reviewForm.dogParkReview.maintenanceAndCleanliness,
                              trashLevel: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            crowdAndSocialDynamics: {
                              ...reviewForm.dogParkReview.crowdAndSocialDynamics,
                              ownerFriendliness: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            crowdAndSocialDynamics: {
                              ...reviewForm.dogParkReview.crowdAndSocialDynamics,
                              peakHours: e.target.value
                            }
                          }
                        })}
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
                        onChange={(e) => setReviewForm({
                          ...reviewForm,
                          dogParkReview: {
                            ...reviewForm.dogParkReview,
                            rulesPoliciesAndCommunity: {
                              ...reviewForm.dogParkReview.rulesPoliciesAndCommunity,
                              leashPolicy: e.target.value
                            }
                          }
                        })}
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
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            dogParkReview: {
                              ...reviewForm.dogParkReview,
                              rulesPoliciesAndCommunity: {
                                ...reviewForm.dogParkReview.rulesPoliciesAndCommunity,
                                vaccinationRequired: e.target.checked
                              }
                            }
                          })}
                        />
                        Vaccination Required
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
              <p>Be the first to review this place!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review-card-simple">
                <div className="review-simple-content">
                  <span className="reviewer-name">{review.userId?.name || 'Anonymous'}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  <span className="review-comment-text">{review.comment || 'No comment'}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails; 