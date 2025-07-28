import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map, { Marker, NavigationControl, GeolocateControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser } from '../contexts/UserContext';
import { lostPetAPI } from '../services/api';
import '../styles/LostPets.css';

const LostPets = () => {
  const { firebaseUser, mongoUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [focusPetId, setFocusPetId] = useState(null);
  const [shouldCenterOnPet, setShouldCenterOnPet] = useState(false);

  // Check for saved map state first
  const getSavedMapState = () => {
    try {
      if (location.state?.centerLocation) {
        return {
          longitude: location.state.centerLocation.lng,
          latitude: location.state.centerLocation.lat,
          zoom: 15
        };
      }

      const savedState = sessionStorage.getItem('pawpawmate_lostpets_map_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);

        // Check if saved state is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyMinutes) {
          console.log('Restored saved lost pets map state:', parsed);
          return parsed;
        } else {
          console.log('Saved lost pets map state expired, clearing');
          sessionStorage.removeItem('pawpawmate_lostpets_map_state');
        }
      }
    } catch (error) {
      console.error('Error loading saved lost pets map state:', error);
    }
    return {
      longitude: -87.6298,  // Chicago downtown longitude (fallback)
      latitude: 41.8781,    // Chicago downtown latitude (fallback)
      zoom: 13              // Slightly more zoomed in for city view
    };
  };

  const [viewState, setViewState] = useState(getSavedMapState());
  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);

  // Lost pets data
  const [lostPets, setLostPets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // UI state
  const [selectedPet, setSelectedPet] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [reportType, setReportType] = useState('lost'); // 'lost' or 'sighting'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Form data for lost pet reports
  const [lostPetForm, setLostPetForm] = useState({
    petName: '',
    species: 'dog',
    breed: '',
    color: '',
    size: 'medium',
    features: '',
    lastSeenTime: '',
    ownerContact: {
      name: '',
      phone: '',
      email: ''
    },
    microchip: '',
    collar: '',
    favoritePlaces: '',
    reward: '',
    photos: []
  });

  // Form data for sighting reports
  const [sightingForm, setSightingForm] = useState({
    sightingTime: '',
    description: '',
    photos: []
  });

  const mapRef = useRef();
  const fetchTimeoutRef = useRef();


  useEffect(() => {
    const petIdFromNav = location.state?.focusedPetId;

    if (petIdFromNav) {
      if (location.state?.closeExistingPopup) {
        setSelectedPet(null);
      }
      setFocusPetId(petIdFromNav);
      setShouldCenterOnPet(true);

      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (focusPetId && lostPets.length > 0 && shouldCenterOnPet) {
      const targetPet = lostPets.find(pet => pet._id === focusPetId);
      if (targetPet) {
        console.log('Found target pet, centering and showing:', targetPet);
        setViewState(prev => ({
          ...prev,
          longitude: targetPet.lastSeenLocation.lng,
          latitude: targetPet.lastSeenLocation.lat,
          zoom: 16
        }));
        setSelectedPet(targetPet);
        setShouldCenterOnPet(false); // Reset after centering
        setFocusPetId(null); // Clear focusPetId to prevent re-centering
      } else {
        fetchLostPets().then(() => {

        });
      }
    }
  }, [focusPetId, lostPets, shouldCenterOnPet]);

  // Status types with colors and icons
  const statusTypes = {
    all: { label: 'All Status', icon: '🐾', color: '#6b7280' },
    missing: { label: 'Missing', icon: '❌', color: '#dc2626' }, // Red
    seen: { label: 'Seen', icon: '👀', color: '#eab308' },     // Yellow  
    found: { label: 'Found', icon: '✅', color: '#22c55e' }    // Green
  };

  // Species types for filtering
  const speciesTypes = {
    all: { label: 'All Species', icon: '🐾' },
    dog: { label: 'Dogs', icon: '🐕' },
    cat: { label: 'Cats', icon: '🐱' },
    other: { label: 'Other', icon: '🐾' }
  };

  // Date filter options
  const dateFilterOptions = {
    all: { label: 'All Time' },
    1: { label: 'Last 24 Hours' },
    3: { label: 'Last 3 Days' },
    7: { label: 'Last Week' },
    30: { label: 'Last Month' }
  };

  // Save map state to session storage
  const saveMapState = (currentViewState) => {
    try {
      const stateToSave = currentViewState || viewState;
      const mapState = {
        ...stateToSave,
        statusFilter,
        speciesFilter,
        dateFilter,
        timestamp: Date.now()
      };
      sessionStorage.setItem('pawpawmate_lostpets_map_state', JSON.stringify(mapState));
    } catch (error) {
      console.error('Error saving lost pets map state:', error);
    }
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

        // Only use current location if no saved state
        const savedState = sessionStorage.getItem('pawpawmate_lostpets_map_state');
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

  // Fetch lost pets from API
  const fetchLostPets = async () => {
    if (!mapRef.current) return;

    setLoading(true);
    console.log('Fetching lost pets...');

    try {
      const bounds = mapRef.current.getBounds();
      const filters = {};

      // Add status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      // Add species filter
      if (speciesFilter !== 'all') {
        filters.species = speciesFilter;
      }

      // Add date filter
      if (dateFilter !== 'all') {
        filters.dateRange = parseInt(dateFilter);
      }

      // Add bounds filter if available
      if (bounds) {
        filters.bounds = {
          _sw: bounds.getSouthWest(),
          _ne: bounds.getNorthEast()
        };
      }

      console.log('Fetching lost pets with filters:', filters);
      const lostPetsData = await lostPetAPI.getAllLostPets(filters);
      console.log(`Found ${lostPetsData.length} lost pets`);
      setLostPets(lostPetsData);
    } catch (error) {
      console.error('Error fetching lost pets:', error);
    } finally {
      setLoading(false);
    }
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
      fetchLostPets();
    }, 500); // Wait 500ms after user stops moving
  };

  // Handle map click (for adding new reports)
  const handleMapClick = (event) => {
    if (!mongoUser) {
      alert('Please sign in to report a lost pet or sighting');
      return;
    }

    const { lngLat } = event;
    setClickedCoordinates({
      lat: lngLat.lat,
      lng: lngLat.lng
    });

    // Clear address input when clicking on map
    setAddressInput('');

    // Only show form if not already open
    if (!showReportForm) {
      setReportType('sighting'); // Default to sighting when clicking map
      setShowReportForm(true);
    }
  };

  // Handle lost pet pin click
  const handlePetClick = (pet) => {
    setSelectedPet(pet);
  };

  // Close popup
  const closePopup = () => {
    setSelectedPet(null);
  };

  // Handle filter changes
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setTimeout(fetchLostPets, 100);
    setTimeout(saveMapState, 200);
  };

  const handleSpeciesFilterChange = (newSpecies) => {
    setSpeciesFilter(newSpecies);
    setTimeout(fetchLostPets, 100);
    setTimeout(saveMapState, 200);
  };

  const handleDateFilterChange = (newDate) => {
    setDateFilter(newDate);
    setTimeout(fetchLostPets, 100);
    setTimeout(saveMapState, 200);
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const petDate = new Date(date);
    const diffMs = now - petDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Initial load
  useEffect(() => {
    // Get user's current location first
    getCurrentLocation();

    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch lost pets when location permission is checked and map is ready
  useEffect(() => {
    if (locationPermissionChecked && mapRef.current) {
      const timer = setTimeout(() => {
        fetchLostPets();
      }, 500); // Shorter delay since location is already determined

      return () => clearTimeout(timer);
    }
  }, [locationPermissionChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get filtered lost pets
  const filteredLostPets = lostPets.filter(pet => {
    // Status filter
    if (statusFilter !== 'all' && pet.status !== statusFilter) {
      return false;
    }

    // Species filter
    if (speciesFilter !== 'all' && pet.species !== speciesFilter) {
      return false;
    }

    return true;
  });

  // Handle form input changes
  const handleLostPetFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLostPetForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setLostPetForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSightingFormChange = (field, value) => {
    setSightingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    if (!address.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };

        setClickedCoordinates(coordinates);

        // Update map view to show the geocoded location
        setViewState(prev => ({
          ...prev,
          longitude: coordinates.lng,
          latitude: coordinates.lat,
          zoom: 15
        }));

        console.log('Geocoded address:', address, 'to coordinates:', coordinates);
      } else {
        alert('Address not found. Please try a different address or click on the map.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error finding address. Please try again or click on the map.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle address input change with debounced geocoding
  const handleAddressChange = (value) => {
    setAddressInput(value);
  };

  // Handle address submission (when user presses Enter or clicks geocode button)
  const handleAddressSubmit = () => {
    if (addressInput.trim()) {
      geocodeAddress(addressInput.trim());
    }
  };

  // Reset forms
  const resetForms = () => {
    setLostPetForm({
      petName: '',
      species: 'dog',
      breed: '',
      color: '',
      size: 'medium',
      features: '',
      lastSeenTime: '',
      ownerContact: {
        name: '',
        phone: '',
        email: ''
      },
      microchip: '',
      collar: '',
      favoritePlaces: '',
      reward: '',
      photos: []
    });
    setSightingForm({
      sightingTime: '',
      description: '',
      photos: []
    });
    setClickedCoordinates(null);
    setAddressInput('');
    setShowReportForm(false);
    setIsSubmitting(false);
  };

  // Handle lost pet form submission
  const handleLostPetSubmit = async (e) => {
    e.preventDefault();
    if (!mongoUser) {
      alert('Please sign in to submit a lost pet report.');
      return;
    }

    if (!clickedCoordinates) {
      alert('Please select a location where your pet got lost by typing an address or clicking on the map.');
      return;
    }

    // Validate required fields
    if (!lostPetForm.petName.trim()) {
      alert('Please enter your pet\'s name.');
      return;
    }
    if (!lostPetForm.color.trim()) {
      alert('Please enter your pet\'s color.');
      return;
    }
    if (!lostPetForm.lastSeenTime) {
      alert('Please enter when your pet got lost.');
      return;
    }
    if (!lostPetForm.ownerContact.name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!lostPetForm.ownerContact.phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    if (!lostPetForm.ownerContact.email.trim()) {
      alert('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get address from coordinates using reverse geocoding
      let address = '';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedCoordinates.lat}&lon=${clickedCoordinates.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.display_name) {
          address = data.display_name;
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed:', geoError);
      }

      // Convert favoritePlaces string to array
      const favoritePlacesArray = lostPetForm.favoritePlaces
        ? lostPetForm.favoritePlaces.split(',').map(place => place.trim()).filter(place => place.length > 0)
        : [];

      const reportData = {
        ...lostPetForm,
        favoritePlaces: favoritePlacesArray, // Convert string to array
        lastSeenLocation: {
          lat: clickedCoordinates.lat,
          lng: clickedCoordinates.lng,
          address: address
        },
        userId: mongoUser._id
      };

      console.log('Submitting lost pet report:', reportData);
      const newReport = await lostPetAPI.createLostPetReport(reportData);
      console.log('Lost pet report created:', newReport);

      // Refresh the map data
      fetchLostPets();
      resetForms();
      alert('Lost pet report submitted successfully!');
    } catch (error) {
      console.error('Error submitting lost pet report:', error);

      // More specific error handling
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Submission failed: ${error.response.data.error}`);
      } else if (error.message) {
        alert(`Submission failed: ${error.message}`);
      } else {
        alert('Error submitting report. Please check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sighting form submission
  const handleSightingSubmit = async (e) => {
    e.preventDefault();
    if (!mongoUser || !clickedCoordinates) {
      alert('Please select a location on the map and make sure you are logged in.');
      return;
    }

    if (!selectedPet) {
      // This is a general sighting report - we'll need to create a new lost pet entry
      // For now, alert the user to select a specific pet
      alert('Please first click on a lost pet pin on the map to report a sighting for that specific pet. If you found a new lost pet, please use "Report Lost Pet" instead.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get address from coordinates
      let address = '';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedCoordinates.lat}&lon=${clickedCoordinates.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.display_name) {
          address = data.display_name;
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed:', geoError);
      }

      const sightingData = {
        ...sightingForm,
        location: {
          lat: clickedCoordinates.lat,
          lng: clickedCoordinates.lng,
          address: address
        },
        userId: mongoUser._id
      };

      console.log('Submitting sighting report:', sightingData);
      const updatedPet = await lostPetAPI.addSightingReport(selectedPet._id, sightingData);
      console.log('Sighting report added:', updatedPet);

      // Refresh the map data
      fetchLostPets();
      resetForms();
      alert('Sighting report submitted successfully!');
    } catch (error) {
      console.error('Error submitting sighting report:', error);
      alert('Error submitting sighting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lost-pets-container">
      <div className="map-controls">
        <div className="controls-header">
          <h1>Lost & Found Pets</h1>
          <div className="report-buttons">
            <button
              className="report-button lost-button"
              onClick={() => {
                if (!mongoUser) {
                  alert('Please sign in to report a lost pet');
                  return;
                }
                setShowReportForm(true);
                setReportType('lost');
              }}
            >
              Report Lost Pet
            </button>
            <button
              className="report-button seen-button"
              onClick={() => {
                if (!mongoUser) {
                  alert('Please sign in to report a sighting');
                  return;
                }
                setShowReportForm(true);
                setReportType('sighting');
              }}
            >
              Report Seen Pet
            </button>
          </div>
        </div>

        <div className="filter-section">
          {/* Status Filter */}
          <div className="filter-group">
            <label>Status:</label>
            <div className="filter-buttons">
              {Object.entries(statusTypes).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  className={`filter-button status-${key} ${statusFilter === key ? 'active' : ''}`}
                  onClick={() => handleStatusFilterChange(key)}
                >
                  <span className="filter-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Species Filter */}
          <div className="filter-group">
            <label>Species:</label>
            <div className="filter-buttons">
              {Object.entries(speciesTypes).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  className={`filter-button ${speciesFilter === key ? 'active' : ''}`}
                  onClick={() => handleSpeciesFilterChange(key)}
                >
                  <span className="filter-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="filter-group">
            <label>Time:</label>
            <div className="filter-buttons">
              {Object.entries(dateFilterOptions).map(([key, { label }]) => (
                <button
                  key={key}
                  className={`filter-button ${dateFilter === key ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="location-count-display">
            {filteredLostPets.length} lost pets found
            {loading && <span className="location-count-spinner">⟳</span>}
          </div>
        </div>

        <div className="map-instructions">
          <p>
            📍 <strong>Red pins:</strong> Missing pets |
            👀 <strong>Yellow pins:</strong> Recently seen |
            ✅ <strong>Green pins:</strong> Found pets
          </p>
          <p>Click on any pin for details, or click on the map to report a sighting</p>
        </div>
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

          {/* Lost Pet Markers */}
          {filteredLostPets.map(pet => (
            <Marker
              key={pet._id}
              longitude={pet.lastSeenLocation.lng}
              latitude={pet.lastSeenLocation.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handlePetClick(pet);
              }}
            >
              <div
                className={`lost-pet-marker status-${pet.status} ${focusPetId === pet._id ? 'focused-marker' : ''}`}
                style={{
                  backgroundColor: statusTypes[pet.status]?.color || '#6b7280',
                  fontSize: focusPetId === pet._id ? '28px' : '24px', // Make focused marker larger
                  width: focusPetId === pet._id ? '56px' : '48px',
                  height: focusPetId === pet._id ? '56px' : '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: focusPetId === pet._id ? '4px solid #3b82f6' : '3px solid white', // Blue border for focused
                  boxShadow: focusPetId === pet._id
                    ? '0 4px 12px rgba(59, 130, 246, 0.5)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  animation: focusPetId === pet._id ? 'pulse 2s infinite' : 'none'
                }}
              >
                <span className="marker-icon">
                  {statusTypes[pet.status]?.icon || '🐾'}
                </span>
              </div>
            </Marker>
          ))}

          {/* Selected Location Marker (when form is open) */}
          {showReportForm && clickedCoordinates && (
            <Marker
              longitude={clickedCoordinates.lng}
              latitude={clickedCoordinates.lat}
              anchor="bottom"
            >
              <div
                className="location-selection-marker"
                style={{
                  backgroundColor: '#3b82f6',
                  fontSize: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  animation: 'pulse 2s infinite'
                }}
              >
                <span className="marker-icon">📍</span>
              </div>
            </Marker>
          )}

          {/* Popup for selected pet */}
          {selectedPet && (
            <Popup
              longitude={selectedPet.lastSeenLocation.lng}
              latitude={selectedPet.lastSeenLocation.lat}
              onClose={closePopup}
              closeButton={true}
              closeOnClick={false}
              anchor="top"
              maxWidth="400px"
            >
              <div className="pet-popup">
                <div className="pet-popup-header">
                  <h3>{selectedPet.petName}</h3>
                  <span className={`status-badge status-${selectedPet.status}`}>
                    {statusTypes[selectedPet.status]?.icon} {statusTypes[selectedPet.status]?.label}
                  </span>
                </div>

                {selectedPet.photos && selectedPet.photos.length > 0 && (
                  <div className="pet-popup-photo">
                    <img
                      src={selectedPet.photos[0]}
                      alt={selectedPet.petName}
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}

                <div className="pet-popup-details">
                  <p><strong>Species:</strong> {selectedPet.species} {selectedPet.breed && `(${selectedPet.breed})`}</p>
                  <p><strong>Color:</strong> {selectedPet.color}</p>
                  <p><strong>Size:</strong> {selectedPet.size}</p>
                  {selectedPet.features && (
                    <p><strong>Features:</strong> {selectedPet.features}</p>
                  )}

                  <div className="location-time-info">
                    <p><strong>Last seen:</strong> {formatTimeAgo(selectedPet.lastSeenTime)}</p>
                    {selectedPet.lastSeenLocation.address && (
                      <p><strong>Location:</strong> {selectedPet.lastSeenLocation.address}</p>
                    )}
                  </div>

                  <div className="contact-info">
                    <p><strong>Contact:</strong> {selectedPet.ownerContact.name}</p>
                    <p><strong>Phone:</strong> {selectedPet.ownerContact.phone}</p>
                    <p><strong>Email:</strong> {selectedPet.ownerContact.email}</p>
                  </div>

                  {selectedPet.reward && (
                    <div className="reward-info">
                      <p><strong>Reward:</strong> {selectedPet.reward}</p>
                    </div>
                  )}

                  {selectedPet.sightings && selectedPet.sightings.length > 0 && (
                    <div className="sightings-info">
                      <p><strong>Recent sightings:</strong> {selectedPet.sightings.length}</p>
                      <small>Last sighting: {formatTimeAgo(selectedPet.sightings[selectedPet.sightings.length - 1].reportedAt)}</small>
                    </div>
                  )}
                </div>

                <div className="pet-popup-actions">
                  {mongoUser && selectedPet.status !== 'found' && (
                    <button
                      className="sighting-button"
                      onClick={() => {
                        setClickedCoordinates({
                          lat: selectedPet.lastSeenLocation.lat,
                          lng: selectedPet.lastSeenLocation.lng
                        });
                        setReportType('sighting');
                        setShowReportForm(true);
                        // Keep selectedPet for sighting submission
                      }}
                    >
                      Report Sighting
                    </button>
                  )}

                  {mongoUser && mongoUser._id === selectedPet.reportedBy._id && selectedPet.status !== 'found' && (
                    <button
                      className="found-button"
                      onClick={() => {
                        // TODO: Implement mark as found functionality
                        alert('Mark as found functionality coming soon!');
                      }}
                    >
                      Mark as Found
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="modal-overlay" onClick={() => resetForms()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {reportType === 'lost' ? 'Report Lost Pet' : 'Report Sighting'}
              </h2>
              <button onClick={() => resetForms()}>✕</button>
            </div>
            <div className="modal-body">
              {reportType === 'lost' ? (
                <form onSubmit={handleLostPetSubmit} className="report-form">
                  <div className="form-section">
                    <h3>Pet Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Pet Name *</label>
                        <input
                          type="text"
                          value={lostPetForm.petName}
                          onChange={(e) => handleLostPetFormChange('petName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Species *</label>
                        <select
                          value={lostPetForm.species}
                          onChange={(e) => handleLostPetFormChange('species', e.target.value)}
                          required
                        >
                          <option value="dog">Dog</option>
                          <option value="cat">Cat</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Breed</label>
                        <input
                          type="text"
                          value={lostPetForm.breed}
                          onChange={(e) => handleLostPetFormChange('breed', e.target.value)}
                          placeholder="e.g., Golden Retriever"
                        />
                      </div>
                      <div className="form-group">
                        <label>Color *</label>
                        <input
                          type="text"
                          value={lostPetForm.color}
                          onChange={(e) => handleLostPetFormChange('color', e.target.value)}
                          required
                          placeholder="e.g., Brown, Black with white spots"
                        />
                      </div>
                      <div className="form-group">
                        <label>Size *</label>
                        <select
                          value={lostPetForm.size}
                          onChange={(e) => handleLostPetFormChange('size', e.target.value)}
                          required
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Distinguishing Features</label>
                      <textarea
                        value={lostPetForm.features}
                        onChange={(e) => handleLostPetFormChange('features', e.target.value)}
                        placeholder="Any unique markings, scars, or features..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>When did your pet get lost?</h3>
                    <div className="form-group">
                      <label>Where did your pet get lost? *</label>
                      <div className="address-input-container">
                        <input
                          type="text"
                          value={addressInput}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder="Enter address where your pet got lost (e.g., 123 Main St, Chicago, IL)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddressSubmit();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddressSubmit}
                          disabled={!addressInput.trim() || isGeocoding}
                          className="geocode-button"
                        >
                          {isGeocoding ? '...' : 'Find'}
                        </button>
                      </div>
                      <small className="address-help">Type an address and click "Find", or click directly on the map</small>
                    </div>

                    <div className="form-group">
                      <label>When did your pet get lost? *</label>
                      <input
                        type="datetime-local"
                        value={lostPetForm.lastSeenTime}
                        onChange={(e) => handleLostPetFormChange('lastSeenTime', e.target.value)}
                        required
                      />
                    </div>

                    {clickedCoordinates && (
                      <div className="location-info">
                        <p><strong>Selected Location:</strong></p>
                        <p>{clickedCoordinates.lat.toFixed(6)}, {clickedCoordinates.lng.toFixed(6)}</p>
                        <small>You can click on a different location on the map or enter a new address to change this.</small>
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          value={lostPetForm.ownerContact.name}
                          onChange={(e) => handleLostPetFormChange('ownerContact.name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={lostPetForm.ownerContact.phone}
                          onChange={(e) => handleLostPetFormChange('ownerContact.phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={lostPetForm.ownerContact.email}
                        onChange={(e) => handleLostPetFormChange('ownerContact.email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Additional Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Microchip ID</label>
                        <input
                          type="text"
                          value={lostPetForm.microchip}
                          onChange={(e) => handleLostPetFormChange('microchip', e.target.value)}
                          placeholder="If your pet is microchipped"
                        />
                      </div>
                      <div className="form-group">
                        <label>Collar Description</label>
                        <input
                          type="text"
                          value={lostPetForm.collar}
                          onChange={(e) => handleLostPetFormChange('collar', e.target.value)}
                          placeholder="Color, type, tags..."
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Favorite Places</label>
                        <input
                          type="text"
                          value={lostPetForm.favoritePlaces}
                          onChange={(e) => handleLostPetFormChange('favoritePlaces', e.target.value)}
                          placeholder="Parks, streets where your pet likes to go (separate with commas)"
                        />
                      </div>
                      <div className="form-group">
                        <label>Reward</label>
                        <input
                          type="text"
                          value={lostPetForm.reward}
                          onChange={(e) => handleLostPetFormChange('reward', e.target.value)}
                          placeholder="e.g., $100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => resetForms()} className="cancel-button">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="submit-button">
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSightingSubmit} className="report-form">
                  <div className="form-section">
                    <h3>Sighting Information</h3>
                    {selectedPet ? (
                      <div className="selected-pet-info">
                        <p><strong>Reporting sighting for:</strong> {selectedPet.petName} ({selectedPet.species})</p>
                      </div>
                    ) : (
                      <div className="no-pet-selected-info">
                        <p><strong>💡 To report a sighting:</strong> First click on a lost pet pin on the map, then click "Report Sighting" from the popup.</p>
                        <p>If you found a different lost pet not shown on the map, please use "Report Lost Pet" instead.</p>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Where did you see this pet?</label>
                      <div className="address-input-container">
                        <input
                          type="text"
                          value={addressInput}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder="Enter street address where you saw the pet"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddressSubmit();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddressSubmit}
                          disabled={!addressInput.trim() || isGeocoding}
                          className="geocode-button"
                        >
                          {isGeocoding ? '...' : 'Find'}
                        </button>
                      </div>
                      <small className="address-help">Type an address and click "Find", or click directly on the map</small>
                    </div>

                    <div className="form-group">
                      <label>When did you see this pet? *</label>
                      <input
                        type="datetime-local"
                        value={sightingForm.sightingTime}
                        onChange={(e) => handleSightingFormChange('sightingTime', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={sightingForm.description}
                        onChange={(e) => handleSightingFormChange('description', e.target.value)}
                        placeholder="Describe what you saw, pet's condition, behavior..."
                        rows={4}
                      />
                    </div>

                    {clickedCoordinates && (
                      <div className="location-info">
                        <p><strong>Sighting Location:</strong></p>
                        <p>{clickedCoordinates.lat.toFixed(6)}, {clickedCoordinates.lng.toFixed(6)}</p>
                        <small>You can click on a different location on the map or enter a new address to change this.</small>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => resetForms()} className="cancel-button">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="submit-button">
                      {isSubmitting ? 'Submitting...' : 'Submit Sighting'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostPets; 