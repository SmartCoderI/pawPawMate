// Geocoding service using OpenStreetMap Nominatim API
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Major cities cache for instant results
const MAJOR_CITIES = [
  // Major US Cities
  { id: 'city-nyc', name: 'New York, NY, USA', type: 'city', lat: 40.7128, lng: -74.0060, importance: 1.0 },
  { id: 'city-la', name: 'Los Angeles, CA, USA', type: 'city', lat: 34.0522, lng: -118.2437, importance: 0.95 },
  { id: 'city-chicago', name: 'Chicago, IL, USA', type: 'city', lat: 41.8781, lng: -87.6298, importance: 0.9 },
  { id: 'city-houston', name: 'Houston, TX, USA', type: 'city', lat: 29.7604, lng: -95.3698, importance: 0.85 },
  { id: 'city-phoenix', name: 'Phoenix, AZ, USA', type: 'city', lat: 33.4484, lng: -112.0740, importance: 0.8 },
  { id: 'city-philadelphia', name: 'Philadelphia, PA, USA', type: 'city', lat: 39.9526, lng: -75.1652, importance: 0.8 },
  { id: 'city-san-antonio', name: 'San Antonio, TX, USA', type: 'city', lat: 29.4241, lng: -98.4936, importance: 0.75 },
  { id: 'city-san-diego', name: 'San Diego, CA, USA', type: 'city', lat: 32.7157, lng: -117.1611, importance: 0.75 },
  { id: 'city-dallas', name: 'Dallas, TX, USA', type: 'city', lat: 32.7767, lng: -96.7970, importance: 0.75 },
  { id: 'city-san-jose', name: 'San Jose, CA, USA', type: 'city', lat: 37.3382, lng: -121.8863, importance: 0.7 },
  { id: 'city-austin', name: 'Austin, TX, USA', type: 'city', lat: 30.2672, lng: -97.7431, importance: 0.7 },
  { id: 'city-jacksonville', name: 'Jacksonville, FL, USA', type: 'city', lat: 30.3322, lng: -81.6557, importance: 0.65 },
  { id: 'city-fort-worth', name: 'Fort Worth, TX, USA', type: 'city', lat: 32.7555, lng: -97.3308, importance: 0.65 },
  { id: 'city-columbus', name: 'Columbus, OH, USA', type: 'city', lat: 39.9612, lng: -82.9988, importance: 0.65 },
  { id: 'city-charlotte', name: 'Charlotte, NC, USA', type: 'city', lat: 35.2271, lng: -80.8431, importance: 0.6 },
  { id: 'city-san-francisco', name: 'San Francisco, CA, USA', type: 'city', lat: 37.7749, lng: -122.4194, importance: 0.85 },
  { id: 'city-indianapolis', name: 'Indianapolis, IN, USA', type: 'city', lat: 39.7684, lng: -86.1581, importance: 0.6 },
  { id: 'city-seattle', name: 'Seattle, WA, USA', type: 'city', lat: 47.6062, lng: -122.3321, importance: 0.8 },
  { id: 'city-denver', name: 'Denver, CO, USA', type: 'city', lat: 39.7392, lng: -104.9903, importance: 0.75 },
  { id: 'city-washington', name: 'Washington, DC, USA', type: 'city', lat: 38.9072, lng: -77.0369, importance: 0.9 },
  { id: 'city-boston', name: 'Boston, MA, USA', type: 'city', lat: 42.3601, lng: -71.0589, importance: 0.85 },
  { id: 'city-el-paso', name: 'El Paso, TX, USA', type: 'city', lat: 31.7619, lng: -106.4850, importance: 0.55 },
  { id: 'city-detroit', name: 'Detroit, MI, USA', type: 'city', lat: 42.3314, lng: -83.0458, importance: 0.7 },
  { id: 'city-nashville', name: 'Nashville, TN, USA', type: 'city', lat: 36.1627, lng: -86.7816, importance: 0.65 },
  { id: 'city-portland', name: 'Portland, OR, USA', type: 'city', lat: 45.5152, lng: -122.6784, importance: 0.65 },
  { id: 'city-oklahoma-city', name: 'Oklahoma City, OK, USA', type: 'city', lat: 35.4676, lng: -97.5164, importance: 0.6 },
  { id: 'city-las-vegas', name: 'Las Vegas, NV, USA', type: 'city', lat: 36.1699, lng: -115.1398, importance: 0.75 },
  { id: 'city-louisville', name: 'Louisville, KY, USA', type: 'city', lat: 38.2527, lng: -85.7585, importance: 0.55 },
  { id: 'city-baltimore', name: 'Baltimore, MD, USA', type: 'city', lat: 39.2904, lng: -76.6122, importance: 0.65 },
  { id: 'city-milwaukee', name: 'Milwaukee, WI, USA', type: 'city', lat: 43.0389, lng: -87.9065, importance: 0.6 },
  { id: 'city-albuquerque', name: 'Albuquerque, NM, USA', type: 'city', lat: 35.0844, lng: -106.6504, importance: 0.55 },
  { id: 'city-tucson', name: 'Tucson, AZ, USA', type: 'city', lat: 32.2226, lng: -110.9747, importance: 0.55 },
  { id: 'city-fresno', name: 'Fresno, CA, USA', type: 'city', lat: 36.7378, lng: -119.7871, importance: 0.55 },
  { id: 'city-sacramento', name: 'Sacramento, CA, USA', type: 'city', lat: 38.5816, lng: -121.4944, importance: 0.6 },
  { id: 'city-mesa', name: 'Mesa, AZ, USA', type: 'city', lat: 33.4152, lng: -111.8315, importance: 0.55 },
  { id: 'city-kansas-city', name: 'Kansas City, MO, USA', type: 'city', lat: 39.0997, lng: -94.5786, importance: 0.6 },
  { id: 'city-atlanta', name: 'Atlanta, GA, USA', type: 'city', lat: 33.7490, lng: -84.3880, importance: 0.8 },
  { id: 'city-long-beach', name: 'Long Beach, CA, USA', type: 'city', lat: 33.7701, lng: -118.1937, importance: 0.6 },
  { id: 'city-colorado-springs', name: 'Colorado Springs, CO, USA', type: 'city', lat: 38.8339, lng: -104.8214, importance: 0.55 },
  { id: 'city-raleigh', name: 'Raleigh, NC, USA', type: 'city', lat: 35.7796, lng: -78.6382, importance: 0.6 },
  { id: 'city-miami', name: 'Miami, FL, USA', type: 'city', lat: 25.7617, lng: -80.1918, importance: 0.75 },
  { id: 'city-virginia-beach', name: 'Virginia Beach, VA, USA', type: 'city', lat: 36.8529, lng: -75.9780, importance: 0.55 },
  { id: 'city-omaha', name: 'Omaha, NE, USA', type: 'city', lat: 41.2524, lng: -95.9980, importance: 0.55 },
  { id: 'city-oakland', name: 'Oakland, CA, USA', type: 'city', lat: 37.8044, lng: -122.2712, importance: 0.65 },
  { id: 'city-minneapolis', name: 'Minneapolis, MN, USA', type: 'city', lat: 44.9778, lng: -93.2650, importance: 0.65 },
  { id: 'city-tulsa', name: 'Tulsa, OK, USA', type: 'city', lat: 36.1540, lng: -95.9928, importance: 0.55 },
  { id: 'city-arlington', name: 'Arlington, TX, USA', type: 'city', lat: 32.7357, lng: -97.1081, importance: 0.55 },
  { id: 'city-new-orleans', name: 'New Orleans, LA, USA', type: 'city', lat: 29.9511, lng: -90.0715, importance: 0.7 },
  { id: 'city-wichita', name: 'Wichita, KS, USA', type: 'city', lat: 37.6872, lng: -97.3301, importance: 0.5 },
  { id: 'city-cleveland', name: 'Cleveland, OH, USA', type: 'city', lat: 41.4993, lng: -81.6944, importance: 0.6 },
  { id: 'city-tampa', name: 'Tampa, FL, USA', type: 'city', lat: 27.9506, lng: -82.4572, importance: 0.65 },
  { id: 'city-bakersfield', name: 'Bakersfield, CA, USA', type: 'city', lat: 35.3733, lng: -119.0187, importance: 0.5 },
  { id: 'city-aurora', name: 'Aurora, CO, USA', type: 'city', lat: 39.7294, lng: -104.8319, importance: 0.5 },
  { id: 'city-anaheim', name: 'Anaheim, CA, USA', type: 'city', lat: 33.8366, lng: -117.9143, importance: 0.55 },
  { id: 'city-honolulu', name: 'Honolulu, HI, USA', type: 'city', lat: 21.3099, lng: -157.8581, importance: 0.65 },
  { id: 'city-santa-ana', name: 'Santa Ana, CA, USA', type: 'city', lat: 33.7455, lng: -117.8677, importance: 0.55 },
  { id: 'city-corpus-christi', name: 'Corpus Christi, TX, USA', type: 'city', lat: 27.8006, lng: -97.3964, importance: 0.5 },
  { id: 'city-riverside', name: 'Riverside, CA, USA', type: 'city', lat: 33.9533, lng: -117.3962, importance: 0.55 },
  { id: 'city-lexington', name: 'Lexington, KY, USA', type: 'city', lat: 38.0406, lng: -84.5037, importance: 0.5 },
  { id: 'city-stockton', name: 'Stockton, CA, USA', type: 'city', lat: 37.9577, lng: -121.2908, importance: 0.5 },
  { id: 'city-buffalo', name: 'Buffalo, NY, USA', type: 'city', lat: 42.8864, lng: -78.8784, importance: 0.55 },
  { id: 'city-saint-paul', name: 'Saint Paul, MN, USA', type: 'city', lat: 44.9537, lng: -93.0900, importance: 0.55 },
  { id: 'city-cincinnati', name: 'Cincinnati, OH, USA', type: 'city', lat: 39.1031, lng: -84.5120, importance: 0.6 },
  { id: 'city-anchorage', name: 'Anchorage, AK, USA', type: 'city', lat: 61.2181, lng: -149.9003, importance: 0.5 },
  { id: 'city-henderson', name: 'Henderson, NV, USA', type: 'city', lat: 36.0395, lng: -114.9817, importance: 0.5 },
  { id: 'city-greensboro', name: 'Greensboro, NC, USA', type: 'city', lat: 36.0726, lng: -79.7920, importance: 0.5 },
  { id: 'city-plano', name: 'Plano, TX, USA', type: 'city', lat: 33.0198, lng: -96.6989, importance: 0.5 },
  { id: 'city-newark', name: 'Newark, NJ, USA', type: 'city', lat: 40.7357, lng: -74.1724, importance: 0.55 },
  { id: 'city-lincoln', name: 'Lincoln, NE, USA', type: 'city', lat: 40.8136, lng: -96.7026, importance: 0.5 },
  { id: 'city-orlando', name: 'Orlando, FL, USA', type: 'city', lat: 28.5383, lng: -81.3792, importance: 0.65 },
  { id: 'city-chula-vista', name: 'Chula Vista, CA, USA', type: 'city', lat: 32.6401, lng: -117.0842, importance: 0.5 },
  { id: 'city-jersey-city', name: 'Jersey City, NJ, USA', type: 'city', lat: 40.7282, lng: -74.0776, importance: 0.55 },
  { id: 'city-chandler', name: 'Chandler, AZ, USA', type: 'city', lat: 33.3062, lng: -111.8413, importance: 0.5 },
  { id: 'city-laredo', name: 'Laredo, TX, USA', type: 'city', lat: 27.5306, lng: -99.4803, importance: 0.5 },
  { id: 'city-madison', name: 'Madison, WI, USA', type: 'city', lat: 43.0731, lng: -89.4012, importance: 0.55 },
  { id: 'city-lubbock', name: 'Lubbock, TX, USA', type: 'city', lat: 33.5779, lng: -101.8552, importance: 0.5 },
  { id: 'city-winston-salem', name: 'Winston-Salem, NC, USA', type: 'city', lat: 36.0999, lng: -80.2442, importance: 0.5 },
  { id: 'city-garland', name: 'Garland, TX, USA', type: 'city', lat: 32.9126, lng: -96.6389, importance: 0.5 },
  { id: 'city-glendale', name: 'Glendale, AZ, USA', type: 'city', lat: 33.5387, lng: -112.1860, importance: 0.5 },
  { id: 'city-hialeah', name: 'Hialeah, FL, USA', type: 'city', lat: 25.8576, lng: -80.2781, importance: 0.5 },
  { id: 'city-reno', name: 'Reno, NV, USA', type: 'city', lat: 39.5296, lng: -119.8138, importance: 0.5 },
  { id: 'city-baton-rouge', name: 'Baton Rouge, LA, USA', type: 'city', lat: 30.4515, lng: -91.1871, importance: 0.55 },
  { id: 'city-irvine', name: 'Irvine, CA, USA', type: 'city', lat: 33.6846, lng: -117.8265, importance: 0.5 },
  { id: 'city-chesapeake', name: 'Chesapeake, VA, USA', type: 'city', lat: 36.7682, lng: -76.2875, importance: 0.5 },
  { id: 'city-irving', name: 'Irving, TX, USA', type: 'city', lat: 32.8140, lng: -96.9489, importance: 0.5 },
  { id: 'city-scottsdale', name: 'Scottsdale, AZ, USA', type: 'city', lat: 33.4942, lng: -111.9261, importance: 0.55 },
  { id: 'city-north-las-vegas', name: 'North Las Vegas, NV, USA', type: 'city', lat: 36.1989, lng: -115.1175, importance: 0.5 },
  { id: 'city-fremont', name: 'Fremont, CA, USA', type: 'city', lat: 37.5485, lng: -121.9886, importance: 0.5 },
  { id: 'city-gilbert', name: 'Gilbert, AZ, USA', type: 'city', lat: 33.3528, lng: -111.7890, importance: 0.5 },
  { id: 'city-san-bernardino', name: 'San Bernardino, CA, USA', type: 'city', lat: 34.1083, lng: -117.2898, importance: 0.5 },
  { id: 'city-boise', name: 'Boise, ID, USA', type: 'city', lat: 43.6150, lng: -116.2023, importance: 0.55 },
  { id: 'city-birmingham', name: 'Birmingham, AL, USA', type: 'city', lat: 33.5207, lng: -86.8025, importance: 0.55 }
];

// Search major cities locally for instant results
export const searchMajorCities = (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  return MAJOR_CITIES
    .filter(city => 
      city.name.toLowerCase().includes(searchTerm) ||
      city.name.toLowerCase().replace(/,.*/, '').includes(searchTerm) // Match city name without state
    )
    .sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aExact = a.name.toLowerCase().startsWith(searchTerm);
      const bExact = b.name.toLowerCase().startsWith(searchTerm);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then sort by importance
      return b.importance - a.importance;
    })
    .slice(0, 5) // Limit to top 5 cities
    .map(city => ({
      ...city,
      address: { display_name: city.name },
      isMajorCity: true
    }));
};

// Rate limiting - Nominatim allows max 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // Reduced to 500ms for better UX
const REQUEST_TIMEOUT = 5000; // 5 second timeout

// Simple cache to avoid repeated API calls
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ensure we don't exceed rate limits
const rateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
};

// Search for places using Nominatim
export const searchPlaces = async (query, options = {}) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Check cache first
  const cacheKey = `${query.toLowerCase()}_${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  await rateLimit();

  const {
    limit = 10,
    countrycodes = 'us', // Default to US
    viewbox = null, // Optional bounding box for prioritizing results
    bounded = false, // Whether to restrict results to viewbox
    addressdetails = true
  } = options;

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: limit.toString(),
      addressdetails: addressdetails ? '1' : '0',
      countrycodes,
      'accept-language': 'en'
    });

    // Add viewbox if provided (for prioritizing results near current map view)
    if (viewbox) {
      params.append('viewbox', viewbox);
      params.append('bounded', bounded ? '1' : '0');
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'PawPawMate/1.0 (pet-friendly places finder)'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Process and categorize results
    const results = data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      type: categorizeResult(item),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      importance: item.importance || 0,
      address: item.address || {},
      boundingbox: item.boundingbox,
      raw: item
    }));

    // Cache the results
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Geocoding search timed out');
    } else {
      console.error('Geocoding search error:', error);
    }
    return [];
  }
};

// Categorize search results by type
const categorizeResult = (item) => {
  const type = item.type;
  const category = item.category;
  
  // Cities and towns
  if (type === 'city' || type === 'town' || type === 'village' || 
      type === 'hamlet' || type === 'municipality' || 
      category === 'place') {
    return 'city';
  }
  
  // Addresses
  if (type === 'house' || type === 'building' || 
      category === 'building' || item.address?.house_number) {
    return 'address';
  }
  
  // Pet-related places
  if (type === 'veterinary' || item.display_name.toLowerCase().includes('vet')) {
    return 'vet';
  }
  
  if (type === 'pet' || item.display_name.toLowerCase().includes('pet')) {
    return 'pet_store';
  }
  
  if (item.display_name.toLowerCase().includes('dog park') || 
      item.display_name.toLowerCase().includes('dog run')) {
    return 'dog_park';
  }
  
  if (item.display_name.toLowerCase().includes('shelter') || 
      item.display_name.toLowerCase().includes('rescue') ||
      item.display_name.toLowerCase().includes('humane')) {
    return 'shelter';
  }
  
  // Default to address for specific locations
  return 'address';
};

// Reverse geocoding - get place name from coordinates
export const reverseGeocode = async (lat, lng) => {
  await rateLimit();

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'en'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'PawPawMate/1.0 (pet-friendly places finder)'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.display_name) {
      return {
        name: data.display_name,
        address: data.address || {},
        type: categorizeResult(data)
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Search specifically for pet-related places
export const searchPetPlaces = async (query, bounds = null) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const petKeywords = [
    'veterinary', 'vet', 'animal hospital', 'pet store', 'pet shop',
    'dog park', 'dog run', 'animal shelter', 'pet rescue', 'grooming',
    'pet boarding', 'kennel', 'doggy daycare', 'pet training'
  ];

  const results = [];

  // Search for each pet-related keyword combined with the query
  for (const keyword of petKeywords) {
    const searchQuery = `${keyword} ${query}`;
    
    try {
      const keywordResults = await searchPlaces(searchQuery, {
        limit: 5,
        viewbox: bounds,
        bounded: !!bounds
      });
      
      results.push(...keywordResults);
    } catch (error) {
      console.error(`Error searching for ${keyword}:`, error);
    }
  }

  // Remove duplicates and sort by importance
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );

  return uniqueResults
    .sort((a, b) => (b.importance || 0) - (a.importance || 0))
    .slice(0, 10);
};

// Get viewbox string from map bounds for prioritizing nearby results
export const getViewboxFromBounds = (bounds) => {
  if (!bounds || !bounds._sw || !bounds._ne) {
    return null;
  }
  
  const { _sw, _ne } = bounds;
  // Format: left,top,right,bottom (min_lon,max_lat,max_lon,min_lat)
  return `${_sw.lng},${_ne.lat},${_ne.lng},${_sw.lat}`;
};

const geocodingService = {
  searchPlaces,
  reverseGeocode,
  searchPetPlaces,
  getViewboxFromBounds
};

export default geocodingService; 