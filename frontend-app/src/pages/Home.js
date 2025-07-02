import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useUser } from '../contexts/UserContext';
import '../styles/Home.css';

const Home = () => {
  const { firebaseUser } = useUser();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    longitude: -87.6298,  // Chicago downtown longitude
    latitude: 41.8781,    // Chicago downtown latitude
    zoom: 13              // Slightly more zoomed in for city view
  });
  
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();
  const fetchTimeoutRef = useRef();

  // Location types with icons - Dog Parks first for priority
  const locationTypes = {
    all: { label: 'All', icon: '🐾' },
    dog_park: { label: 'Dog Park', icon: '🌳', color: '#22c55e' },
    veterinary: { label: 'Veterinarian', icon: '🏥', color: '#3b82f6' },
    pet_store: { label: 'Pet Store', icon: '🏪', color: '#f59e0b' },
    animal_shelter: { label: 'Shelter', icon: '🏠', color: '#ef4444' }
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

  // Initial load
  useEffect(() => {
    // Test API first
    testOverpassAPI();
    
    // Test shelter query specifically
    testShelterQuery();
    
    // Fetch initial locations after map loads
    const timer = setTimeout(() => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          fetchLocations(bounds);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement geocoding search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLocationClick = (location) => {
    // Directly navigate to place details instead of showing popup
    // For OSM locations, we'll use the OSM node ID directly if available, 
    // otherwise create a coordinate-based ID
    const locationId = location.id && location.id !== `location-${location.latitude}-${location.longitude}` 
      ? location.id 
      : `osm-${location.latitude}-${location.longitude}`;
      
    console.log('Navigating to place:', locationId, 'with data:', location);
    navigate(`/place/${locationId}`, { state: { locationData: location } });
  };

  const filteredLocations = locations.filter(location => 
    filter === 'all' || location.type === filter
  );

  return (
    <div className="home-container">
      <div className="map-controls">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search for pet-friendly places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

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
          </div>
          
          <div className="location-count-display">
            {filteredLocations.length} locations found
            {loading && <span className="loading-spinner">⟳</span>}
          </div>
        </div>

        {/* {loading && <div className="loading-indicator">Loading locations...</div>} */}
      </div>

      <div className="map-wrapper">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMapMove}
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
    </div>
  );
};

export default Home; 