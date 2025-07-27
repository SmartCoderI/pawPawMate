import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser } from '../contexts/UserContext';
import { placeAPI } from '../services/api';
import PlaceFormModal from '../components/PlaceFormModal';
import SearchDropdown from '../components/SearchDropdown';
import { searchPlaces, searchPetPlaces, getViewboxFromBounds, searchMajorCities } from '../services/geocoding';
import '../styles/Home.css';

const Home = () => {
  const { firebaseUser, mongoUser } = useUser();
  const navigate = useNavigate();
  
  // Check for saved map state first.
  const getSavedMapState = () => {
    try {
      const savedState = sessionStorage.getItem('pawpawmate_map_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          console.log('Restored saved map state:', parsed);
          return parsed;
        } else {
          console.log('Saved map state expired, clearing');
          sessionStorage.removeItem('pawpawmate_map_state');
        }
      }
    } catch (error) {
      console.error('Error loading saved map state:', error);
    }
    return {
      longitude: -87.6298,  // Chicago downtown longitude (fallback)
      latitude: 41.8781,    // Chicago downtown latitude (fallback)
      zoom: 13              // Slightly more zoomed in for city view
    };
  };

  const [viewState, setViewState] = useState(getSavedMapState());
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);
  
  // Restore saved filter and search query
  const getInitialFilter = () => {
    try {
      const savedState = sessionStorage.getItem('pawpawmate_map_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          return parsed.filter || 'all';
        }
      }
    } catch (error) {
      console.error('Error loading saved filter:', error);
    }
    return 'all';
  };

  const getInitialSearchQuery = () => {
    try {
      const savedState = sessionStorage.getItem('pawpawmate_map_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          return parsed.searchQuery || '';
        }
      }
    } catch (error) {
      console.error('Error loading saved search query:', error);
    }
    return '';
  };

  const [locations, setLocations] = useState([]);
  const [filter, setFilterState] = useState(getInitialFilter());
  
  // Wrapper function to save state when filter changes
  const setFilter = (newFilter) => {
    setFilterState(newFilter);
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
  const [databasePlaces, setDatabasePlaces] = useState([]);
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const mapRef = useRef();
  const fetchTimeoutRef = useRef();
  const searchTimeoutRef = useRef();

  // Location types with icons - Dog Parks first for priority
  const locationTypes = {
    all: { label: 'All', icon: '🐾' },
    dog_park: { label: 'Dog Park', icon: '🐕', color: '#B8FF9F' },
    veterinary: { label: 'VET', icon: '🏥', color: '#53f2fc' },
    pet_store: { label: 'Pet Store', icon: '🥣', color: '#FFE500' },
    animal_shelter: { label: 'Shelter', icon: '🏠', color: '#FFC29F' }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      setLocationPermissionChecked(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Current location obtained:', { latitude, longitude });
        
        // Only use current location if there's no saved map state
        const savedState = sessionStorage.getItem('pawpawmate_map_state');
        if (!savedState) {
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude,
            zoom: 13
          }));
          console.log('Using current location as no saved state found');
        } else {
          console.log('Keeping saved map state, ignoring current location');
        }
        setLocationPermissionChecked(true);
      },
      (error) => {
        console.log('Error getting location:', error.message);
        console.log('Falling back to Chicago location');
        setLocationPermissionChecked(true);
        // Keep default Chicago location
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  // Fetch locations from OpenStreetMap using Overpass API
  const fetchLocations = async (bounds) => {
    if (!bounds) return;

    const { _sw, _ne } = bounds;
    const bbox = `${_sw.lat},${_sw.lng},${_ne.lat},${_ne.lng}`;
    
    setLoading(true);
    console.log('Fetching locations for bbox:', bbox);

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

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch locations');

      const data = await response.json();
      console.log('Overpass API response:', data);
      
      // Process OSM data into our location format
      const processedLocations = data.elements
        .filter(element => {
          // Handle both nodes (with lat/lon) and ways/relations (with center)
          const hasCoords = (element.lat && element.lon) || (element.center && element.center.lat && element.center.lon);
          return hasCoords && element.tags;
        })
        .map((element, index) => {
          // Get coordinates from either direct lat/lon or center
          const lat = element.lat || element.center.lat;
          const lon = element.lon || element.center.lon;
          let type = 'veterinary';
          
          // Determine location type based on tags
          if (element.tags.leisure === 'dog_park') {
            type = 'dog_park';
          } else if (element.tags.leisure === 'park' && element.tags.name && element.tags.name.toLowerCase().includes('dog')) {
            type = 'dog_park';
          } else if (element.tags.leisure === 'park' && element.tags.dog === 'yes') {
            type = 'dog_park';
          } else if (element.tags.amenity === 'veterinary') {
            type = 'veterinary';
          } else if (element.tags.shop === 'pet') {
            type = 'pet_store';
          } else if (element.tags.shop === 'pet_grooming') {
            type = 'pet_store'; // Treat grooming as pet store for now
          } else if (element.tags.amenity === 'animal_shelter' || element.tags.amenity === 'animal_rescue' || element.tags.amenity === 'animal_boarding') {
            type = 'animal_shelter';
          } else if (element.tags.name && /shelter|rescue|humane|welfare|sanctuary|cruelty|paws|animal\s+care|animal\s+welfare|pet\s+rescue|anti-cruelty|animal\s+league/i.test(element.tags.name)) {
            type = 'animal_shelter';
          }

          // Generate better names
          let name = element.tags.name;
          if (!name && type === 'dog_park') {
            name = 'Dog Park';
          } else if (!name && type === 'animal_shelter') {
            name = 'Animal Shelter';
          } else if (!name && type === 'veterinary') {
            name = 'Veterinary Clinic';
          } else if (!name && type === 'pet_store') {
            name = 'Pet Store';
          }

          return {
            id: element.id || `location-${index}`,
            name: name || `${locationTypes[type].label}`,
            type: type,
            latitude: lat,
            longitude: lon,
            description: element.tags.description || '',
            tags: extractTags(element.tags),
            address: formatAddress(element.tags),
            phone: element.tags.phone || element.tags['contact:phone'] || '',
            website: element.tags.website || element.tags['contact:website'] || '',
            opening_hours: element.tags.opening_hours || ''
          };
        })
        .sort((a, b) => {
          // Sort to prioritize dog parks
          if (a.type === 'dog_park' && b.type !== 'dog_park') return -1;
          if (a.type !== 'dog_park' && b.type === 'dog_park') return 1;
          return 0;
        })
        .slice(0, 30); // Increased limit to show more locations

      console.log(`Processed ${processedLocations.length} locations:`);
      console.log(`- ${processedLocations.filter(l => l.type === 'dog_park').length} dog parks`);
      console.log(`- ${processedLocations.filter(l => l.type === 'veterinary').length} veterinary clinics`);
      console.log(`- ${processedLocations.filter(l => l.type === 'pet_store').length} pet stores`);
      console.log(`- ${processedLocations.filter(l => l.type === 'animal_shelter').length} animal shelters`);
      console.log('Animal shelters found:', processedLocations.filter(l => l.type === 'animal_shelter'));
      setLocations(processedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Try with a simpler query if the main one fails
      try {
        const simpleQuery = `[out:json];node["leisure"="dog_park"](${bbox});out;`;
        const simpleResponse = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(simpleQuery)}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        const simpleData = await simpleResponse.json();
        console.log('Simple query response:', simpleData);
      } catch (simpleError) {
        console.error('Simple query also failed:', simpleError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Extract relevant tags from OSM data
  const extractTags = (tags) => {
    const relevantTags = [];
    if (tags['wheelchair'] === 'yes') relevantTags.push('wheelchair-accessible');
    if (tags['outdoor_seating'] === 'yes') relevantTags.push('outdoor-seating');
    if (tags['parking']) relevantTags.push('parking');
    if (tags['24/7'] === 'yes') relevantTags.push('24/7');
    
    // Dog-specific tags
    if (tags['dog'] === 'yes' || tags['dog'] === 'leashed') relevantTags.push('dog-friendly');
    if (tags['dog'] === 'unleashed' || tags['dog:unleashed'] === 'yes') relevantTags.push('off-leash');
    if (tags['lit'] === 'yes') relevantTags.push('lit');
    if (tags['fenced'] === 'yes') relevantTags.push('fenced');
    if (tags['water'] === 'yes' || tags['drinking_water'] === 'yes') relevantTags.push('water-available');
    if (tags['surface'] === 'grass') relevantTags.push('grass-surface');
    
    return relevantTags;
  };

  // Format address from OSM tags
  const formatAddress = (tags) => {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    return parts.join(', ');
  };

  // Debounced map move handler
  const handleMapMove = (evt) => {
    setViewState(evt.viewState);
    
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
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(testQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = await response.json();
      console.log('Overpass API test response:', data);
    } catch (error) {
      console.error('Overpass API test failed:', error);
    }
  };

  // Test specifically for animal shelters in Chicago
  const testShelterQuery = async () => {
    try {
      // Chicago area bounding box: approximately 41.6, -87.9, 42.0, -87.5
      const chicagoBbox = '41.6,-87.9,42.0,-87.5';
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
      console.log('Testing shelter query for Chicago...');
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(shelterTestQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = await response.json();
      console.log('Chicago shelter test results:', data);
      console.log(`Found ${data.elements?.length || 0} potential shelter locations in Chicago area`);
      if (data.elements?.length > 0) {
        console.log('Sample shelter data:', data.elements.slice(0, 3));
      }
    } catch (error) {
      console.error('Shelter test query failed:', error);
    }
  };

  // Load database places
  const loadDatabasePlaces = async () => {
    try {
      const dbPlaces = await placeAPI.getAllPlaces();
      setDatabasePlaces(dbPlaces);
      console.log('Loaded database places:', dbPlaces.length);
    } catch (error) {
      console.error('Error loading database places:', error);
    }
  };

  // Initial load
  useEffect(() => {
    // Get user's current location first
    getCurrentLocation();
    
    // Test API first
    testOverpassAPI();
    
    // Test shelter query specifically
    testShelterQuery();
    
    // Load database places
    loadDatabasePlaces();
    
    // Initial setup (removed location fetching from here)
    const timer = setTimeout(() => {
      // This timer is just for cleanup purposes now
    }, 1000);

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
      const timer = setTimeout(() => {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          fetchLocations(bounds);
        }
      }, 500); // Shorter delay since location is already determined

      return () => clearTimeout(timer);
    }
  }, [locationPermissionChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pawpawmate_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (newHistory) => {
    localStorage.setItem('pawpawmate_search_history', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // Add item to search history
  const addToSearchHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 5); // Keep only last 5 searches
    
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
      const searchPromises = [
        searchPlaces(query, { viewbox, limit: 6 }),
        searchPetPlaces(query, viewbox)
      ];

      const [generalResults, petResults] = await Promise.allSettled(searchPromises);

      // Extract successful results
      const allExternalResults = [
        ...(generalResults.status === 'fulfilled' ? generalResults.value : []),
        ...(petResults.status === 'fulfilled' ? petResults.value : [])
      ];

      // Combine all results
      const allResults = [...databaseResults, ...majorCityResults, ...allExternalResults];
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id)
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
          if (a.name.toLowerCase().includes(query.toLowerCase()) && 
              !b.name.toLowerCase().includes(query.toLowerCase())) {
            return -1;
          }
          if (!a.name.toLowerCase().includes(query.toLowerCase()) && 
              b.name.toLowerCase().includes(query.toLowerCase())) {
            return 1;
          }
          // Then sort by importance
          return (b.importance || 0) - (a.importance || 0);
        })
        .slice(0, 10);

      setSearchResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search database places
  const searchDatabasePlaces = (query) => {
    const results = databasePlaces
      .filter(place => 
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
      )
      .map(place => ({
        id: `db-${place._id}`,
        name: place.name,
        type: place.type.replace(' ', '_'),
        lat: place.coordinates?.lat || 0,
        lng: place.coordinates?.lng || 0,
        importance: 0.8, // High importance for database places
        address: { display_name: place.address },
        isFromDatabase: true,
        originalPlace: place
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
    console.log('Selected search result:', result);
    
    // Add to search history
    addToSearchHistory(result.name);
    
    // Close dropdown
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSelectedSearchIndex(-1);
    
    // Always zoom to location on map (regardless of source)
    const zoomLevel = result.type === 'city' ? 12 : 
                     result.type === 'address' ? 16 : 
                     15; // Default zoom for places
    
    const newViewState = {
      longitude: result.lng,
      latitude: result.lat,
      zoom: zoomLevel,
      transitionDuration: 1000
    };
    
    setViewState(newViewState);
    
    // Update search query to selected result name
    setSearchQuery(result.name);
    
    // Clear saved state since user navigated to a new location
    clearSavedMapState();
  };

  // Handle keyboard navigation in search dropdown
  const handleSearchKeyNavigation = (direction) => {
    if (direction === 'down') {
      setSelectedSearchIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (direction === 'up') {
      setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : -1);
    }
  };

  // Close search dropdown
  const closeSearchDropdown = () => {
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSelectedSearchIndex(-1);
  };

  // Save current map state to sessionStorage
  const saveMapState = (state = viewState) => {
    try {
      const stateToSave = {
        longitude: state.longitude,
        latitude: state.latitude,
        zoom: state.zoom,
        filter: filter,
        searchQuery: searchQuery,
        timestamp: Date.now()
      };
      sessionStorage.setItem('pawpawmate_map_state', JSON.stringify(stateToSave));
      console.log('Saved map state:', stateToSave);
    } catch (error) {
      console.error('Error saving map state:', error);
    }
  };

  // Clear saved map state
  const clearSavedMapState = () => {
    try {
      sessionStorage.removeItem('pawpawmate_map_state');
      console.log('Cleared saved map state');
    } catch (error) {
      console.error('Error clearing saved map state:', error);
    }
  };

  const handleLocationClick = (location) => {
    // Save current map state before navigating
    saveMapState();
    
    // Check if this is a database place
    if (location.isFromDatabase) {
      console.log('Navigating to database place:', location.id);
      navigate(`/place/${location.id}`);
    } else {
      // For OSM locations, we'll use the OSM node ID directly if available, 
      // otherwise create a coordinate-based ID
      const locationId = location.id && location.id !== `location-${location.latitude}-${location.longitude}` 
        ? location.id 
        : `osm-${location.latitude}-${location.longitude}`;
        
      console.log('Navigating to OSM place:', locationId, 'with data:', location);
      navigate(`/place/${locationId}`, { state: { locationData: location } });
    }
  };

  // Handle map clicks for creating new places
  const handleMapClick = async (event) => {
    // Don't create place if user is not logged in
    if (!mongoUser || !firebaseUser) {
      alert('Please log in to create a new place');
      navigate('/login');
      return;
    }

    const { lng, lat } = event.lngLat;
    console.log('Map clicked at:', { lat, lng });

    // Check if there's already a place at this location
    const clickedLocationExists = await checkLocationExists(lat, lng);
    
    if (!clickedLocationExists) {
      // No place exists, show the creation modal
      setClickedCoordinates({ lat, lng });
      setShowPlaceModal(true);
    } else {
      console.log('A place already exists at this location');
    }
  };

  // Check if a place exists at the given coordinates
  const checkLocationExists = async (lat, lng) => {
    // Check OSM locations
    const tolerance = 0.001; // roughly 100 meters
    const osmLocationExists = locations.some(location => {
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
        return dbPlaces.some(place => {
          if (!place.coordinates) return false;
          const latDiff = Math.abs(place.coordinates.lat - lat);
          const lngDiff = Math.abs(place.coordinates.lng - lng);
          return latDiff < tolerance && lngDiff < tolerance;
        });
      } else {
        // Check in already loaded database places
        return databasePlaces.some(place => {
          if (!place.coordinates) return false;
          const latDiff = Math.abs(place.coordinates.lat - lat);
          const lngDiff = Math.abs(place.coordinates.lng - lng);
          return latDiff < tolerance && lngDiff < tolerance;
        });
      }
    } catch (error) {
      console.error('Error checking database places:', error);
      return false;
    }
  };

  // Handle successful place creation
  const handlePlaceCreated = (newPlace) => {
    console.log('New place created:', newPlace);
    
    // Add to database places
    setDatabasePlaces(prev => [...prev, newPlace]);
    
    // Navigate to the new place
    navigate(`/place/${newPlace._id}`);
  };

  // Combine OSM locations and database places
  const combinedLocations = [
    ...locations,
    ...databasePlaces.map(place => ({
      id: place._id,
      name: place.name,
      type: place.type.replace(' ', '_'), // Convert "dog park" to "dog_park" for consistency
      latitude: place.coordinates?.lat || 0,
      longitude: place.coordinates?.lng || 0,
      description: place.description || '',
      tags: place.tags || [],
      address: place.address || '',
      phone: place.phone || '',
      website: place.website || '',
      opening_hours: place.opening_hours || '',
      isFromDatabase: true
    }))
  ];

  const filteredLocations = combinedLocations.filter(location => 
    filter === 'all' || location.type === filter || location.type.replace('_', ' ') === filter
  );

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

        <div className="filter-section">
          <div className="filter-buttons">
            {Object.entries(locationTypes).map(([key, { label }]) => (
              <button
                key={key}
                className={`filter-button ${filter === key ? 'active' : ''}`}
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
        </div>

        {/* {loading && <div className="loading-indicator">Loading locations...</div>} */}
      </div>

      <div className="map-wrapper">
        {!locationPermissionChecked && (
          <div className="location-loading-overlay">
            <div className="location-loading-content">
              <div className="loading-spinner">⟳</div>
              <p>Getting your location...</p>
              <small>We'll show Chicago if location access is denied</small>
            </div>
          </div>
        )}
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMapMove}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          mapStyle={process.env.REACT_APP_MAPBOX_STYLE}
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            trackUserLocation
            showUserHeading
          />

          {filteredLocations.map(location => (
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
                  backgroundColor: locationTypes[location.type]?.color || '#6b7280',
                  fontSize: '24px',
                  width: '48px',
                  height: '48px'
                }}
              >
                <span className="marker-icon">
                  {locationTypes[location.type]?.icon || '📍'}
                </span>
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