import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useUser } from "../contexts/UserContext";
import { placeAPI } from "../services/api";
import PlaceFormModal from "../components/PlaceFormModal";
import SearchDropdown from "../components/SearchDropdown";
import { searchPlaces, searchPetPlaces, getViewboxFromBounds, searchMajorCities } from "../services/geocoding";
import "../styles/Home.css";

const Home = () => {
  const { firebaseUser, mongoUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for saved map state first.
  const getSavedMapState = () => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);

        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          console.log("Restored saved map state:", parsed);
          return parsed;
        } else {
          console.log("Saved map state expired, clearing");
          sessionStorage.removeItem("pawpawmate_map_state");
        }
      }
    } catch (error) {
      console.error("Error loading saved map state:", error);
    }
    return {
      longitude: -87.6298, // Chicago downtown longitude (fallback)
      latitude: 41.8881, // Chicago downtown latitude - moved north (fallback)
      zoom: 14, // More zoomed in for better city view
    };
  };

  const [viewState, setViewState] = useState(getSavedMapState());
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);

  // Restore saved filter and search query
  const getInitialFilter = () => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          return parsed.filter || "all";
        }
      }
    } catch (error) {
      console.error("Error loading saved filter:", error);
    }
    return "all";
  };

  const getInitialSearchQuery = () => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          return parsed.searchQuery || "";
        }
      }
    } catch (error) {
      console.error("Error loading saved search query:", error);
    }
    return "";
  };

  // Function to get cached locations
  const getCachedLocations = () => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes && parsed.locations) {
          console.log("Restored cached locations:", parsed.locations.length);
          return parsed.locations;
        }
      }
    } catch (error) {
      console.error("Error loading cached locations:", error);
    }
    return [];
  };

  const getCachedDatabasePlaces = () => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes && parsed.databasePlaces) {
          console.log("Restored cached database places:", parsed.databasePlaces.length);
          return parsed.databasePlaces;
        }
      }
    } catch (error) {
      console.error("Error loading cached database places:", error);
    }
    return [];
  };

  const [locationsState, setLocationsState] = useState(getCachedLocations());
  const [databaseLoaded, setDatabaseLoaded] = useState(() => {
    // If we have cached database places, mark as loaded
    return getCachedDatabasePlaces().length > 0;
  });
  const [apiLoaded, setApiLoaded] = useState(() => {
    // If we have cached locations, mark as loaded
    return getCachedLocations().length > 0;
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(() => {
    // If we have cached data, we can complete initial load immediately
    const hasCachedData = getCachedLocations().length > 0 || getCachedDatabasePlaces().length > 0;
    return hasCachedData;
  });

  // Cache for displayed places (to maintain consistency on back navigation)
  const [cachedDisplayedPlaces, setCachedDisplayedPlaces] = useState(() => {
    try {
      const savedState = sessionStorage.getItem("pawpawmate_map_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes && parsed.displayedPlaces) {
          console.log("Restored cached displayed places:", parsed.displayedPlaces.length);
          return parsed.displayedPlaces;
        }
      }
    } catch (error) {
      console.error("Error loading cached displayed places:", error);
    }
    return null;
  });

  // Wrapper function to save state when locations change
  const setLocations = (newLocations) => {
    setLocationsState(newLocations);
    // Save state after locations change
    setTimeout(() => saveMapState(), 100);
  };

  const locations = locationsState;
  const [filter, setFilterState] = useState(getInitialFilter());

  // Wrapper function to save state when filter changes
  const setFilter = (newFilter) => {
    setFilterState(newFilter);

    // Clear cached displayed places when filter changes
    if (cachedDisplayedPlaces) {
      setCachedDisplayedPlaces(null);
    }

    // Save state after filter changes
    setTimeout(() => saveMapState(), 100);
  };
  const [searchQuery, setSearchQueryState] = useState(getInitialSearchQuery());

  // Wrapper function to save state when search query changes
  const setSearchQuery = (newQuery) => {
    setSearchQueryState(newQuery);
    // Save state after search query changes
    setTimeout(() => saveMapState(), 100);
  };
  const [loading, setLoading] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [databasePlacesState, setDatabasePlacesState] = useState(getCachedDatabasePlaces());

  // Wrapper function to save state when database places change
  const setDatabasePlaces = (newPlaces) => {
    const actualNewPlaces = typeof newPlaces === "function" ? newPlaces(databasePlacesState) : newPlaces;
    setDatabasePlacesState(actualNewPlaces);
    // Save state after database places change with updated places
    setTimeout(() => saveMapState(), 150);
  };

  const databasePlaces = databasePlacesState;

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);

  const mapRef = useRef();
  const fetchTimeoutRef = useRef();
  const searchTimeoutRef = useRef();

  // Smart filtering function with per-type limits and dog park priority
  const applySmartFiltering = (places) => {
    if (places.length <= 20) {
      return places; // No filtering needed if 20 or fewer places
    }

    const typeCounters = {
      dog_park: 0,
      veterinary: 0,
      pet_store: 0,
      animal_shelter: 0,
    };

    const maxPerType = 10;
    const totalLimit = 20;

    // Sort by type priority (dog parks first) and then by other criteria
    const sortedPlaces = places.sort((a, b) => {
      // Priority 1: Dog parks first
      if (a.type === "dog_park" && b.type !== "dog_park") return -1;
      if (a.type !== "dog_park" && b.type === "dog_park") return 1;

      // Priority 2: Database places over API places (for consistency)
      if (a.isFromDatabase && !b.isFromDatabase) return -1;
      if (!a.isFromDatabase && b.isFromDatabase) return 1;

      return 0;
    });

    const selectedPlaces = [];

    // First pass: Fill dog parks up to max limit (10)
    for (const place of sortedPlaces) {
      if (place.type === "dog_park" && typeCounters.dog_park < maxPerType) {
        selectedPlaces.push(place);
        typeCounters.dog_park++;
        if (selectedPlaces.length >= totalLimit) break;
      }
    }

    // Second pass: Fill other types up to their limits
    for (const place of sortedPlaces) {
      if (selectedPlaces.length >= totalLimit) break;

      if (place.type !== "dog_park") {
        const typeCounter = typeCounters[place.type] || 0;
        if (typeCounter < maxPerType) {
          selectedPlaces.push(place);
          typeCounters[place.type] = typeCounter + 1;
        }
      }
    }

    console.log("Smart filtering applied:", {
      totalPlaces: places.length,
      selectedPlaces: selectedPlaces.length,
      typeDistribution: typeCounters,
    });

    return selectedPlaces.slice(0, totalLimit);
  };

  // Location types with icons - Dog Parks first for priority
  const locationTypes = {
    all: { label: "All", icon: "🐾" },
    dog_park: { label: "Dog Park", icon: "🐕", color: "#B8FF9F" },
    veterinary: { label: "VET", icon: "🏥", color: "#53f2fc" },
    pet_store: { label: "Pet Store", icon: "🥣", color: "#FFE500" },
    animal_shelter: { label: "Shelter", icon: "🏠", color: "#FFC29F" },
  };

  // Get user's current location (triggered by button click)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser");
      alert("Geolocation is not supported by this browser");
      return;
    }

    // Show loading state
    setLocationPermissionChecked(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Current location obtained:", { latitude, longitude });

        // Always use current location when user clicks the button
        setViewState((prev) => ({
          ...prev,
          longitude,
          latitude,
          zoom: 15, // Zoom in more when user specifically requests location
        }));
        console.log("Using current location from user request");
        setLocationPermissionChecked(true);
      },
      (error) => {
        console.log("Error getting location:", error.message);
        console.log("Could not get current location");
        setLocationPermissionChecked(true);

        // Show user-friendly error message
        let errorMessage = "Could not get your current location. ";
        if (error.code === 1) {
          errorMessage += "Please allow location access and try again.";
        } else if (error.code === 2) {
          errorMessage += "Location information is unavailable.";
        } else if (error.code === 3) {
          errorMessage += "Location request timed out.";
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute when user manually requests
      }
    );
  };

  // Fetch locations from OpenStreetMap using Overpass API
  const fetchLocations = async (bounds) => {
    if (!bounds) return;

    const { _sw, _ne } = bounds;
    const bbox = `${_sw.lat},${_sw.lng},${_ne.lat},${_ne.lng}`;

    setLoading(true);
    console.log("Fetching locations for bbox:", bbox);

    try {
      // Comprehensive Overpass API query for dog parks and pet locations
      const overpassQuery = `
        [out:json][timeout:25];
        (
          // Dog parks
          node["leisure"="dog_park"](${bbox});
          way["leisure"="dog_park"](${bbox});
          relation["leisure"="dog_park"](${bbox});
          
          // Parks with dog areas (name contains "dog")
          node["leisure"="park"]["name"~"[Dd]og",i](${bbox});
          way["leisure"="park"]["name"~"[Dd]og",i](${bbox});
          
          // Parks that allow dogs
          node["leisure"="park"]["dog"="yes"](${bbox});
          way["leisure"="park"]["dog"="yes"](${bbox});
          
          // Other pet locations
          node["amenity"="veterinary"](${bbox});
          way["amenity"="veterinary"](${bbox});
          node["shop"="pet"](${bbox});
          way["shop"="pet"](${bbox});
          
          // Animal shelters - multiple tagging approaches
          node["amenity"="animal_shelter"](${bbox});
          way["amenity"="animal_shelter"](${bbox});
          node["amenity"="animal_rescue"](${bbox});
          way["amenity"="animal_rescue"](${bbox});
          node["amenity"="animal_boarding"](${bbox});
          way["amenity"="animal_boarding"](${bbox});
          
          // Places with comprehensive shelter/rescue keywords in the name
          node["name"~"[Ss]helter|[Rr]escue|[Hh]umane|[Ww]elfare|[Ss]anctuary|[Cc]ruelty|PAWS|[Aa]nimal [Cc]are|[Aa]nimal [Ww]elfare|[Pp]et [Rr]escue|[Aa]nti-[Cc]ruelty",i](${bbox});
          way["name"~"[Ss]helter|[Rr]escue|[Hh]umane|[Ww]elfare|[Ss]anctuary|[Cc]ruelty|PAWS|[Aa]nimal [Cc]are|[Aa]nimal [Ww]elfare|[Pp]et [Rr]escue|[Aa]nti-[Cc]ruelty",i](${bbox});
          
          // Additional specific searches for common shelter types
          node["name"~"[Aa]nimal [Ll]eague",i](${bbox});
          way["name"~"[Aa]nimal [Ll]eague",i](${bbox});
          
          // Other pet service locations
          node["shop"="pet_grooming"](${bbox});
          way["shop"="pet_grooming"](${bbox});
        );
        out center;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch locations");

      const data = await response.json();
      console.log("Overpass API response:", data);

      // Process OSM data into our location format
      const processedLocations = data.elements
        .filter((element) => {
          // Handle both nodes (with lat/lon) and ways/relations (with center)
          const hasCoords =
            (element.lat && element.lon) || (element.center && element.center.lat && element.center.lon);
          return hasCoords && element.tags;
        })
        .map((element, index) => {
          // Get coordinates from either direct lat/lon or center
          const lat = element.lat || element.center.lat;
          const lon = element.lon || element.center.lon;
          let type = "veterinary";

          // Determine location type based on tags
          if (element.tags.leisure === "dog_park") {
            type = "dog_park";
          } else if (
            element.tags.leisure === "park" &&
            element.tags.name &&
            element.tags.name.toLowerCase().includes("dog")
          ) {
            type = "dog_park";
          } else if (element.tags.leisure === "park" && element.tags.dog === "yes") {
            type = "dog_park";
          } else if (element.tags.amenity === "veterinary") {
            type = "veterinary";
          } else if (element.tags.shop === "pet") {
            type = "pet_store";
          } else if (element.tags.shop === "pet_grooming") {
            type = "pet_store"; // Treat grooming as pet store for now
          } else if (
            element.tags.amenity === "animal_shelter" ||
            element.tags.amenity === "animal_rescue" ||
            element.tags.amenity === "animal_boarding"
          ) {
            type = "animal_shelter";
          } else if (
            element.tags.name &&
            /shelter|rescue|humane|welfare|sanctuary|cruelty|paws|animal\s+care|animal\s+welfare|pet\s+rescue|anti-cruelty|animal\s+league/i.test(
              element.tags.name
            )
          ) {
            type = "animal_shelter";
          }

          // Generate better names
          let name = element.tags.name;
          if (!name && type === "dog_park") {
            name = "Dog Park";
          } else if (!name && type === "animal_shelter") {
            name = "Animal Shelter";
          } else if (!name && type === "veterinary") {
            name = "Veterinary Clinic";
          } else if (!name && type === "pet_store") {
            name = "Pet Store";
          }

          return {
            id: element.id || `location-${index}`,
            name: name || `${locationTypes[type].label}`,
            type: type,
            latitude: lat,
            longitude: lon,
            description: element.tags.description || "",
            tags: extractTags(element.tags),
            address: formatAddress(element.tags),
            phone: element.tags.phone || element.tags["contact:phone"] || "",
            website: element.tags.website || element.tags["contact:website"] || "",
            opening_hours: element.tags.opening_hours || "",
          };
        })
        .sort((a, b) => {
          // Sort to prioritize dog parks
          if (a.type === "dog_park" && b.type !== "dog_park") return -1;
          if (a.type !== "dog_park" && b.type === "dog_park") return 1;
          return 0;
        })
        .slice(0, 20); // Increased limit to show more locations

      console.log(`Processed ${processedLocations.length} locations:`);
      console.log(`- ${processedLocations.filter((l) => l.type === "dog_park").length} dog parks`);
      console.log(`- ${processedLocations.filter((l) => l.type === "veterinary").length} veterinary clinics`);
      console.log(`- ${processedLocations.filter((l) => l.type === "pet_store").length} pet stores`);
      console.log(`- ${processedLocations.filter((l) => l.type === "animal_shelter").length} animal shelters`);
      console.log(
        "Animal shelters found:",
        processedLocations.filter((l) => l.type === "animal_shelter")
      );
      setLocations(processedLocations);
      setApiLoaded(true);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setApiLoaded(true); // Set as loaded even on error to prevent infinite wait
      // Try with a simpler query if the main one fails
      try {
        const simpleQuery = `[out:json];node["leisure"="dog_park"](${bbox});out;`;
        const simpleResponse = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(simpleQuery)}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const simpleData = await simpleResponse.json();
        console.log("Simple query response:", simpleData);
      } catch (simpleError) {
        console.error("Simple query also failed:", simpleError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Extract relevant tags from OSM data
  const extractTags = (tags) => {
    const relevantTags = [];
    if (tags["wheelchair"] === "yes") relevantTags.push("wheelchair-accessible");
    if (tags["outdoor_seating"] === "yes") relevantTags.push("outdoor-seating");
    if (tags["parking"]) relevantTags.push("parking");
    if (tags["24/7"] === "yes") relevantTags.push("24/7");

    // Dog-specific tags
    if (tags["dog"] === "yes" || tags["dog"] === "leashed") relevantTags.push("dog-friendly");
    if (tags["dog"] === "unleashed" || tags["dog:unleashed"] === "yes") relevantTags.push("off-leash");
    if (tags["lit"] === "yes") relevantTags.push("lit");
    if (tags["fenced"] === "yes") relevantTags.push("fenced");
    if (tags["water"] === "yes" || tags["drinking_water"] === "yes") relevantTags.push("water-available");
    if (tags["surface"] === "grass") relevantTags.push("grass-surface");

    return relevantTags;
  };

  // Format address from OSM tags
  const formatAddress = (tags) => {
    const parts = [];
    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
    if (tags["addr:street"]) parts.push(tags["addr:street"]);
    if (tags["addr:city"]) parts.push(tags["addr:city"]);
    if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
    return parts.join(", ");
  };

  // Debounced map move handler
  const handleMapMove = (evt) => {
    setViewState(evt.viewState);

    // Clear cached displayed places when user actively moves the map
    if (cachedDisplayedPlaces) {
      setCachedDisplayedPlaces(null);
    }

    // Save map state after user moves the map
    saveMapState(evt.viewState);

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set new timeout to fetch data after user stops moving map
    fetchTimeoutRef.current = setTimeout(() => {
      const bounds = mapRef.current?.getBounds();
      if (bounds) {
        fetchLocations(bounds);
      }
    }, 500); // Wait 500ms after user stops moving
  };

  // Test Overpass API connectivity
  const testOverpassAPI = async () => {
    try {
      const testQuery = '[out:json];node["leisure"="dog_park"](41.8,-87.7,41.9,-87.6);out count;';
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(testQuery)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      console.log("Overpass API test response:", data);
    } catch (error) {
      console.error("Overpass API test failed:", error);
    }
  };

  // Test specifically for animal shelters in Chicago
  const testShelterQuery = async () => {
    try {
      // Chicago area bounding box: approximately 41.6, -87.9, 42.0, -87.5
      const chicagoBbox = "41.6,-87.9,42.0,-87.5";
      const shelterTestQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="animal_shelter"](${chicagoBbox});
          way["amenity"="animal_shelter"](${chicagoBbox});
          node["name"~"[Ss]helter|[Rr]escue|[Hh]umane|[Ww]elfare|[Ss]anctuary|[Cc]ruelty|PAWS|[Aa]nimal [Cc]are|[Aa]nimal [Ww]elfare|[Pp]et [Rr]escue|[Aa]nti-[Cc]ruelty|[Aa]nimal [Ll]eague",i](${chicagoBbox});
          way["name"~"[Ss]helter|[Rr]escue|[Hh]umane|[Ww]elfare|[Ss]anctuary|[Cc]ruelty|PAWS|[Aa]nimal [Cc]are|[Aa]nimal [Ww]elfare|[Pp]et [Rr]escue|[Aa]nti-[Cc]ruelty|[Aa]nimal [Ll]eague",i](${chicagoBbox});
        );
        out center;
      `;
      console.log("Testing shelter query for Chicago...");
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(shelterTestQuery)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      console.log("Chicago shelter test results:", data);
      console.log(`Found ${data.elements?.length || 0} potential shelter locations in Chicago area`);
      if (data.elements?.length > 0) {
        console.log("Sample shelter data:", data.elements.slice(0, 3));
      }
    } catch (error) {
      console.error("Shelter test query failed:", error);
    }
  };

  // Load database places
  const loadDatabasePlaces = async (forceRefresh = false) => {
    // Check if we have cached database places first (unless forced refresh)
    const cachedDatabasePlaces = getCachedDatabasePlaces();
    if (cachedDatabasePlaces.length > 0 && !forceRefresh) {
      console.log("Using cached database places, skipping fetch");
      setDatabaseLoaded(true);
      return;
    }

    try {
      const dbPlaces = await placeAPI.getAllPlaces();
      setDatabasePlaces(dbPlaces);
      setDatabaseLoaded(true);
      console.log("Loaded database places:", dbPlaces.length);
    } catch (error) {
      console.error("Error loading database places:", error);
      setDatabaseLoaded(true); // Set as loaded even on error to prevent infinite wait
    }
  };

  // Check for place deletion on location change (when returning from PlaceDetails)
  useEffect(() => {
    if (location.state?.deletedPlaceId) {
      handlePlaceDeleted(location.state.deletedPlaceId);
      // Clear the state to prevent repeated deletions
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    // Set location permission as checked immediately (no automatic location request)
    setLocationPermissionChecked(true);

    // Test API first
    testOverpassAPI();

    // Test shelter query specifically
    testShelterQuery();

    // Load database places
    loadDatabasePlaces();

    // Ensure we fetch locations for Chicago when first loading
    const timer = setTimeout(() => {
      const cachedLocations = getCachedLocations();
      if (cachedLocations.length === 0) {
        console.log("No cached locations, ensuring initial fetch for Chicago area");
        // Create bounds for Chicago area based on viewState
        const chicagoBounds = {
          _sw: { lat: viewState.latitude - 0.05, lng: viewState.longitude - 0.05 },
          _ne: { lat: viewState.latitude + 0.05, lng: viewState.longitude + 0.05 },
        };
        fetchLocations(chicagoBounds);
      }
    }, 2000); // Wait for map to be ready

    return () => {
      clearTimeout(timer);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch locations when location permission is checked and map is ready
  useEffect(() => {
    if (locationPermissionChecked && mapRef.current) {
      // Check if we have cached locations first
      const cachedLocations = getCachedLocations();
      const cachedDatabasePlaces = getCachedDatabasePlaces();

      if (cachedLocations.length > 0 || cachedDatabasePlaces.length > 0) {
        console.log("Using cached locations, skipping fetch");
        setApiLoaded(true); // Mark as loaded when using cached data
        return; // Skip fetching if we have cached data
      }

      const timer = setTimeout(() => {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          console.log("No cached locations found, fetching new ones");
          fetchLocations(bounds);
        } else {
          console.log("Map bounds not available, retrying...");
          // Retry if bounds not available yet
          setTimeout(() => {
            const retryBounds = mapRef.current?.getBounds();
            if (retryBounds) {
              console.log("Retry successful, fetching locations");
              fetchLocations(retryBounds);
            }
          }, 1000);
        }
      }, 500); // Shorter delay since location is already determined

      return () => clearTimeout(timer);
    }
  }, [locationPermissionChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Control initial load completion to prevent flickering
  useEffect(() => {
    if (databaseLoaded && apiLoaded && !initialLoadComplete) {
      // Add a small delay to ensure smooth rendering without flickering
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
        console.log("Initial load completed - places will now be displayed");
      }, 300); // 300ms delay to prevent flickering

      return () => clearTimeout(timer);
    }
  }, [databaseLoaded, apiLoaded, initialLoadComplete]);

  // Add window focus detection to refresh places when user returns from other tabs/apps
  useEffect(() => {
    const handleFocus = () => {
      // Small delay to allow navigation state to be processed first
      setTimeout(() => {
        console.log("Window focused - checking for place updates");
        loadDatabasePlaces(true); // Force refresh when window gets focus
      }, 100);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("pawpawmate_search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error loading search history:", error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (newHistory) => {
    localStorage.setItem("pawpawmate_search_history", JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // Add item to search history
  const addToSearchHistory = (searchTerm) => {
    const newHistory = [searchTerm, ...searchHistory.filter((item) => item !== searchTerm)].slice(0, 5); // Keep only last 5 searches

    saveSearchHistory(newHistory);
  };

  // Debounced search function
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);

    try {
      // First, quickly show local results (database places + major cities)
      const databaseResults = searchDatabasePlaces(query);
      const majorCityResults = searchMajorCities(query);

      const immediateResults = [...databaseResults, ...majorCityResults];
      if (immediateResults.length > 0) {
        setSearchResults(immediateResults.slice(0, 6)); // Show first 6 immediate results
      }

      // Get current map bounds for prioritizing nearby results
      const bounds = mapRef.current?.getBounds();
      const viewbox = getViewboxFromBounds(bounds);

      // Then perform external searches with timeout handling
      const searchPromises = [searchPlaces(query, { viewbox, limit: 6 }), searchPetPlaces(query, viewbox)];

      const [generalResults, petResults] = await Promise.allSettled(searchPromises);

      // Extract successful results
      const allExternalResults = [
        ...(generalResults.status === "fulfilled" ? generalResults.value : []),
        ...(petResults.status === "fulfilled" ? petResults.value : []),
      ];

      // Combine all results
      const allResults = [...databaseResults, ...majorCityResults, ...allExternalResults];
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.id === result.id)
      );

      // Sort by importance and relevance
      const sortedResults = uniqueResults
        .sort((a, b) => {
          // Prioritize database results first
          if (a.isFromDatabase && !b.isFromDatabase) return -1;
          if (!a.isFromDatabase && b.isFromDatabase) return 1;

          // Then prioritize major cities
          if (a.isMajorCity && !b.isMajorCity) return -1;
          if (!a.isMajorCity && b.isMajorCity) return 1;

          // Then prioritize exact matches
          if (
            a.name.toLowerCase().includes(query.toLowerCase()) &&
            !b.name.toLowerCase().includes(query.toLowerCase())
          ) {
            return -1;
          }
          if (
            !a.name.toLowerCase().includes(query.toLowerCase()) &&
            b.name.toLowerCase().includes(query.toLowerCase())
          ) {
            return 1;
          }
          // Then sort by importance
          return (b.importance || 0) - (a.importance || 0);
        })
        .slice(0, 10);

      setSearchResults(sortedResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search database places
  const searchDatabasePlaces = (query) => {
    const results = databasePlaces
      .filter(
        (place) =>
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.address.toLowerCase().includes(query.toLowerCase())
      )
      .map((place) => ({
        id: `db-${place._id}`,
        name: place.name,
        type: place.type.replace(" ", "_"),
        lat: place.coordinates?.lat || 0,
        lng: place.coordinates?.lng || 0,
        importance: 0.8, // High importance for database places
        address: { display_name: place.address },
        isFromDatabase: true,
        originalPlace: place,
      }));

    return results;
  };

  // Handle search input change with debouncing
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSearchIndex(-1);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show dropdown immediately if query is long enough
    if (query.trim().length >= 2) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 200); // Reduced debounce delay for faster response
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultSelect(searchResults[0]);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    console.log("Selected search result:", result);

    // Add to search history
    addToSearchHistory(result.name);

    // Close dropdown
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSelectedSearchIndex(-1);

    // Always zoom to location on map (regardless of source)
    const zoomLevel = result.type === "city" ? 12 : result.type === "address" ? 16 : 15; // Default zoom for places

    const newViewState = {
      longitude: result.lng,
      latitude: result.lat,
      zoom: zoomLevel,
      transitionDuration: 1000,
    };

    setViewState(newViewState);

    // Update search query to selected result name
    setSearchQuery(result.name);

    // Clear saved state since user navigated to a new location
    clearSavedMapState();
  };

  // Handle keyboard navigation in search dropdown
  const handleSearchKeyNavigation = (direction) => {
    if (direction === "down") {
      setSelectedSearchIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (direction === "up") {
      setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
  };

  // Close search dropdown
  const closeSearchDropdown = () => {
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSelectedSearchIndex(-1);
  };

  // Save current map state to sessionStorage
  const saveMapState = (state = viewState, displayedPlaces = null) => {
    try {
      const stateToSave = {
        longitude: state.longitude,
        latitude: state.latitude,
        zoom: state.zoom,
        filter: filter,
        searchQuery: searchQuery,
        locations: locations, // Cache the fetched locations
        databasePlaces: databasePlaces, // Cache database places too
        displayedPlaces: displayedPlaces, // Cache currently displayed places for consistent back navigation
        timestamp: Date.now(),
      };
      sessionStorage.setItem("pawpawmate_map_state", JSON.stringify(stateToSave));
      console.log("Saved map state with locations:", stateToSave);
    } catch (error) {
      console.error("Error saving map state:", error);
    }
  };

  // Save map state with currently displayed places (for navigation consistency)
  const saveMapStateWithDisplayedPlaces = (displayedPlaces) => {
    saveMapState(viewState, displayedPlaces);
    setCachedDisplayedPlaces(displayedPlaces);
  };

  // Clear saved map state
  const clearSavedMapState = () => {
    try {
      sessionStorage.removeItem("pawpawmate_map_state");
      console.log("Cleared saved map state");
    } catch (error) {
      console.error("Error clearing saved map state:", error);
    }
  };

  const handleLocationClick = (location) => {
    // Save current map state with displayed places before navigating for consistent back navigation
    saveMapStateWithDisplayedPlaces(filteredLocations);

    // Check if this is a database place
    if (location.isFromDatabase) {
      console.log("Navigating to database place:", location.id);
      navigate(`/place/${location.id}`);
    } else {
      // For OSM locations, we'll use the OSM node ID directly if available,
      // otherwise create a coordinate-based ID
      const locationId =
        location.id && location.id !== `location-${location.latitude}-${location.longitude}`
          ? location.id
          : `osm-${location.latitude}-${location.longitude}`;

      console.log("Navigating to OSM place:", locationId, "with data:", location);
      navigate(`/place/${locationId}`, { state: { locationData: location } });
    }
  };

  // Handle map clicks for creating new places
  const handleMapClick = async (event) => {
    // Don't create place if user is not logged in
    if (!mongoUser || !firebaseUser) {
      alert("Please log in to create a new place");
      navigate("/login");
      return;
    }

    const { lng, lat } = event.lngLat;
    console.log("Map clicked at:", { lat, lng });

    // Check if there's already a place at this location
    const clickedLocationExists = await checkLocationExists(lat, lng);

    if (!clickedLocationExists) {
      // No place exists, show the creation modal
      setClickedCoordinates({ lat, lng });
      setShowPlaceModal(true);
    } else {
      console.log("A place already exists at this location");
    }
  };

  // Check if a place exists at the given coordinates
  const checkLocationExists = async (lat, lng) => {
    // Check OSM locations
    const tolerance = 0.001; // roughly 100 meters
    const osmLocationExists = locations.some((location) => {
      const latDiff = Math.abs(location.latitude - lat);
      const lngDiff = Math.abs(location.longitude - lng);
      return latDiff < tolerance && lngDiff < tolerance;
    });

    if (osmLocationExists) {
      return true;
    }

    // Check database locations
    try {
      // Load database places if not already loaded
      if (databasePlaces.length === 0) {
        const dbPlaces = await placeAPI.getAllPlaces();
        setDatabasePlaces(dbPlaces);

        // Check in the newly loaded places
        return dbPlaces.some((place) => {
          if (!place.coordinates) return false;
          const latDiff = Math.abs(place.coordinates.lat - lat);
          const lngDiff = Math.abs(place.coordinates.lng - lng);
          return latDiff < tolerance && lngDiff < tolerance;
        });
      } else {
        // Check in already loaded database places
        return databasePlaces.some((place) => {
          if (!place.coordinates) return false;
          const latDiff = Math.abs(place.coordinates.lat - lat);
          const lngDiff = Math.abs(place.coordinates.lng - lng);
          return latDiff < tolerance && lngDiff < tolerance;
        });
      }
    } catch (error) {
      console.error("Error checking database places:", error);
      return false;
    }
  };

  // Handle successful place creation
  const handlePlaceCreated = (newPlace) => {
    console.log("New place created:", newPlace);

    // Add to database places immediately using functional update to avoid race conditions
    setDatabasePlaces((prevPlaces) => {
      const updatedPlaces = [...prevPlaces, newPlace];
      // Force cache update with the new place after state update
      setTimeout(() => {
        saveMapState(viewState);
      }, 100);
      return updatedPlaces;
    });

    // Close the modal and reset coordinates
    setShowPlaceModal(false);
    setClickedCoordinates(null);

    // Show success message
    console.log(`✅ New ${newPlace.type} "${newPlace.name}" created successfully and will appear on the map!`);
  };

  // Handle place deletion - remove from map state
  const handlePlaceDeleted = (deletedPlaceId) => {
    console.log("Place deleted:", deletedPlaceId);

    // Remove from database places immediately
    setDatabasePlaces((prevPlaces) => {
      const updatedPlaces = prevPlaces.filter((place) => place._id !== deletedPlaceId);
      // Force cache update after place removal
      setTimeout(() => {
        saveMapState(viewState);
      }, 100);
      return updatedPlaces;
    });

    // Also refresh database places to ensure consistency (fallback mechanism)
    setTimeout(() => {
      loadDatabasePlaces(true); // Force refresh
    }, 500);

    // Show success message
    console.log(`✅ Place removed from map successfully!`);
  };

  // Map database place types to display types
  const mapPlaceType = (dbType) => {
    const typeMapping = {
      "dog park": "dog_park",
      vet: "veterinary",
      "pet store": "pet_store",
      shelter: "animal_shelter",
    };
    return typeMapping[dbType] || dbType.replace(" ", "_");
  };

  // Combine OSM locations and database places
  const combinedLocations = [
    ...locations,
    ...databasePlaces.map((place) => ({
      id: place._id,
      name: place.name,
      type: mapPlaceType(place.type), // Proper type mapping for consistent icons
      latitude: place.coordinates?.lat || 0,
      longitude: place.coordinates?.lng || 0,
      description: place.description || "",
      tags: place.tags || [],
      address: place.address || "",
      phone: place.phone || "",
      website: place.website || "",
      opening_hours: place.opening_hours || "",
      isFromDatabase: true,
    })),
  ];

  // Get current map bounds
  const mapBounds = mapRef.current?.getBounds();

  // Only show places when both database and API are loaded AND initial load is complete
  const allDataLoaded = databaseLoaded && apiLoaded && initialLoadComplete;

  // Debug logging
  console.log("Loading states:", {
    databaseLoaded,
    apiLoaded,
    initialLoadComplete,
    allDataLoaded,
    combinedPlacesCount: combinedLocations.length,
    hasCachedDisplayedPlaces: !!cachedDisplayedPlaces,
  });

  const filteredLocations = !allDataLoaded
    ? []
    : (() => {
        // If we have cached displayed places (user returning from place details), use them
        // But only if the filter and map bounds are similar to prevent showing wrong places
        if (cachedDisplayedPlaces && cachedDisplayedPlaces.length > 0) {
          console.log("Using cached displayed places for consistency");
          return cachedDisplayedPlaces;
        }

        // Otherwise, calculate fresh filtered locations
        // First apply basic filtering (type, bounds, filter)
        const basicFilteredLocations = combinedLocations.filter((location) => {
          // Check if location type is known
          if (!locationTypes[location.type]) return false;

          // Check if location matches current filter
          const matchesFilter =
            filter === "all" || location.type === filter || location.type.replace("_", " ") === filter;
          if (!matchesFilter) return false;

          // Check if location is within current map bounds
          if (mapBounds) {
            const isInBounds =
              location.latitude >= mapBounds.getSouth() &&
              location.latitude <= mapBounds.getNorth() &&
              location.longitude >= mapBounds.getWest() &&
              location.longitude <= mapBounds.getEast();
            return isInBounds;
          }

          return true; // If no bounds available, include all locations
        });

        // Apply smart filtering if we have more than 20 places
        const finalFilteredPlaces = applySmartFiltering(basicFilteredLocations);

        // Clear cached displayed places since we're calculating fresh ones
        if (cachedDisplayedPlaces) {
          setCachedDisplayedPlaces(null);
        }

        return finalFilteredPlaces;
      })();

  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const toggleFiltersCollapsed = () => {
    setFiltersCollapsed((prev) => !prev);
  };

  // Ensure the map resizes correctly when the filter panel collapses/expands
  useEffect(() => {
    // Wait for layout to settle before resizing the map
    const rAF = requestAnimationFrame(() => {
      try {
        mapRef.current?.resize();
      } catch (e) {
        console.warn("Map resize after filter toggle failed:", e);
      }
    });
    return () => cancelAnimationFrame(rAF);
  }, [filtersCollapsed]);

  return (
    <div className="home-container">
      <div className="map-controls">
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search for cities, addresses, or pet places..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
              autoComplete="off"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {showSearchDropdown && (
            <SearchDropdown
              results={searchResults}
              loading={searchLoading}
              onSelect={handleSearchResultSelect}
              onClose={closeSearchDropdown}
              selectedIndex={selectedSearchIndex}
              onKeyNavigation={handleSearchKeyNavigation}
              searchQuery={searchQuery}
            />
          )}
        </div>

        <div className={`filter-section ${filtersCollapsed ? "collapsed" : ""}`}>
          <div className="filter-toggle">
            <button type="button" className="filter-toggle-button" onClick={toggleFiltersCollapsed}>
              {filtersCollapsed ? "Show Filters ▾" : "Hide Filters ▴"}
            </button>
          </div>
          {!filtersCollapsed && (
            <div className="filter-buttons">
              {Object.entries(locationTypes).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`filter-button ${filter === key ? "active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
              <div className="location-count-display">
                {filteredLocations.length} locations found
                {loading && <span className="location-count-spinner">⟳</span>}
              </div>
            </div>
          )}
        </div>

        {/* {loading && <div className="loading-indicator">Loading locations...</div>} */}
      </div>

      <div className="map-wrapper">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMapMove}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          mapStyle={process.env.REACT_APP_MAPBOX_STYLE}
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" trackUserLocation showUserHeading />

          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleLocationClick(location);
              }}
            >
              <div
                className="marker"
                style={{
                  backgroundColor: locationTypes[location.type]?.color || "#6b7280",
                  fontSize: "24px",
                  width: "48px",
                  height: "48px",
                }}
              >
                <span className="marker-icon">{locationTypes[location.type]?.icon || "📍"}</span>
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {/* Place Creation Modal */}
      <PlaceFormModal
        isOpen={showPlaceModal}
        onClose={() => {
          setShowPlaceModal(false);
          setClickedCoordinates(null);
        }}
        coordinates={clickedCoordinates}
        onPlaceCreated={handlePlaceCreated}
      />
    </div>
  );
};

export default Home;
