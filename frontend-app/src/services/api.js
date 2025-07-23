import axios from 'axios';
import { auth } from '../firebase';

// Debug the environment variable more thoroughly
const envUrl = process.env.REACT_APP_API_URL;
const fallbackUrl = 'http://localhost:5001/api';

console.log('API URL Debug:', {
  'env_value': envUrl,
  'env_value_length': envUrl ? envUrl.length : 0,
  'env_value_charCodes': envUrl ? envUrl.split('').map((c, i) => `[${i}]='${c}'(${c.charCodeAt(0)})`) : [],
  'env_value_trimmed': envUrl ? envUrl.trim() : null,
  'using_fallback': !envUrl
});

// Use trimmed value to remove any spaces
const API_BASE_URL = envUrl ? envUrl.trim() : fallbackUrl;

console.log('API Configuration:', {
  'process.env.REACT_APP_API_URL': process.env.REACT_APP_API_URL,
  'API_BASE_URL': API_BASE_URL,
  'API_BASE_URL_length': API_BASE_URL.length
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available (excluding places and reviews - they handle auth via frontend)
api.interceptors.request.use(
  async (config) => {
    // Debug the actual request URL being sent
    console.log('API Request Debug:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: config.baseURL + config.url,
      method: config.method,
      urlCharCodes: config.url ? config.url.split('').map((c, i) => `[${i}]='${c}'(${c.charCodeAt(0)})`) : []
    });
    
    try {
      // Skip auth token for places and reviews endpoints (frontend handles login checks)
      const skipAuthEndpoints = ['/places', '/reviews'];
      const shouldSkipAuth = skipAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      if (shouldSkipAuth) {
        console.log('API: Skipping auth token for:', config.method, config.url);
        return config;
      }
      
      // Get Firebase ID token for other endpoints
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API: Added auth token to request:', {
          method: config.method,
          url: config.url,
          hasToken: !!token,
          tokenLength: token?.length
        });
      } else {
        console.log('API: No current user, request sent without auth token');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API calls
export const userAPI = {
  // Create user in MongoDB when they sign up
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Get user by MongoDB ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Get user by Firebase UID
  getUserByFirebaseUid: async (uid) => {
    try {
      console.log('API: Looking for user with Firebase UID:', uid);
      
      // Use the new direct endpoint
      const response = await api.get(`/users/firebase/${uid}`);
      console.log('API: Found user with matching UID:', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('API: No user found with UID:', uid);
        return null;
      }
      console.error('Error finding user by Firebase UID:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return null;
    }
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Helper function to update existing user's UID
  updateUserUid: async (userId, newUid) => {
    try {
      console.log('API: Updating user UID:', { userId, newUid });
      const response = await api.put(`/users/${userId}`, { uid: newUid });
      console.log('API: Successfully updated user UID:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user UID:', error);
      throw error;
    }
  },

  // Upload user profile photo
  uploadUserPhoto: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Pet API calls
export const petAPI = {
  // Create a new pet
  createPet: async (petData) => {
    const response = await api.post('/pets', petData);
    return response.data;
  },

  // Get all pets (filtered by owner)
  getAllPets: async (ownerId) => {
    try {
      let url = '/pets';
      if (ownerId) {
        url += `?owner=${ownerId}`;
      }
      const response = await api.get(url);
    return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      return [];
    }
  },

  // Get pet by ID
  getPetById: async (petId) => {
    const response = await api.get(`/pets/${petId}`);
    return response.data;
  },

  // Update pet
  updatePet: async (petId, petData) => {
    const response = await api.put(`/pets/${petId}`, petData);
    return response.data;
  },

  // Delete pet
  deletePet: async (petId) => {
    const response = await api.delete(`/pets/${petId}`);
    return response.data;
  },

  // Upload pet photo
  uploadPetPhoto: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/pets/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Place API calls
export const placeAPI = {
  // Get all places
  getAllPlaces: async () => {
    const response = await api.get('/places');
    return response.data;
  },

  // Create a new place
  createPlace: async (placeData) => {
    const response = await api.post('/places', placeData);
    return response.data;
  },

  // Get place by ID
  getPlaceById: async (placeId) => {
    const response = await api.get(`/places/${placeId}`);
    return response.data;
  },

  // Update place
  updatePlace: async (placeId, placeData) => {
    const response = await api.put(`/places/${placeId}`, placeData);
    return response.data;
  },

  // Delete place
  deletePlace: async (placeId, userId) => {
    const response = await api.delete(`/places/${placeId}`, {
      data: { userId }
    });
    return response.data;
  },
};

// Review API calls
export const reviewAPI = {
  // Create a review (can automatically create place if it doesn't exist)
  createReview: async (reviewData) => {
    console.log('API: Sending review creation request to backend:', reviewData);
    try {
      const response = await api.post('/reviews', reviewData);
      console.log('API: Review creation response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Review creation failed:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete a review (only by the review author)
  deleteReview: async (reviewId, userId) => {
    console.log('API: Sending review deletion request:', { reviewId, userId });
    try {
      const response = await api.delete(`/reviews/${reviewId}`, {
        data: { userId }
      });
      console.log('API: Review deletion response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Review deletion failed:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get reviews for a place
  getReviewsByPlace: async (placeId) => {
    const response = await api.get(`/reviews/${placeId}`);
    return response.data;
  },

  // Get dog park statistics
  getDogParkStats: async (placeId) => {
    const response = await api.get(`/reviews/${placeId}/dog-park-stats`);
    return response.data;
  },

  // Get vet clinic statistics
  getVetClinicStats: async (placeId) => {
    const response = await api.get(`/reviews/${placeId}/vet-clinic-stats`);
    return response.data;
  },

  // Get pet store statistics
  getPetStoreStats: async (placeId) => {
    const response = await api.get(`/reviews/${placeId}/pet-store-stats`);
    return response.data;
  },

  // Get animal shelter statistics
  getAnimalShelterStats: async (placeId) => {
    const response = await api.get(`/reviews/${placeId}/animal-shelter-stats`);
    return response.data;
  },
};

// Card API calls
export const cardAPI = {
  // Get all cards
  getAllCards: async () => {
    try {
      const response = await api.get('/cards');
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  },

  // Get user's cards
  getUserCards: async (userId) => {
    try {
      const response = await api.get(`/cards/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user cards:', error);
      return [];
    }
  },

  // Create a card
  createCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  // Get card by ID
  getCardById: async (cardId) => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },
};

// Lost Pet API calls
export const lostPetAPI = {
  // Get all lost pets with optional filtering
  getAllLostPets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.species) params.append('species', filters.species);
      if (filters.bounds) params.append('bounds', JSON.stringify(filters.bounds));
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.limit) params.append('limit', filters.limit);
      
      const queryString = params.toString();
      const url = queryString ? `/lostpets?${queryString}` : '/lostpets';
      
      console.log('API: Fetching lost pets with filters:', filters);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching lost pets:', error);
      return [];
    }
  },

  // Create a new lost pet report
  createLostPetReport: async (reportData) => {
    try {
      console.log('API: Creating lost pet report:', reportData);
      const response = await api.post('/lostpets', reportData);
      console.log('API: Lost pet report created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error creating lost pet report:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get a specific lost pet by ID
  getLostPetById: async (lostPetId) => {
    try {
      const response = await api.get(`/lostpets/${lostPetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lost pet:', error);
      throw error;
    }
  },

  // Add a sighting report to an existing lost pet
  addSightingReport: async (lostPetId, sightingData) => {
    try {
      console.log('API: Adding sighting report for pet:', lostPetId, sightingData);
      const response = await api.post(`/lostpets/${lostPetId}/sightings`, sightingData);
      console.log('API: Sighting report added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error adding sighting report:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Update lost pet status (mark as found, etc.)
  updateLostPetStatus: async (lostPetId, statusData) => {
    try {
      console.log('API: Updating lost pet status:', lostPetId, statusData);
      const response = await api.put(`/lostpets/${lostPetId}/status`, statusData);
      console.log('API: Lost pet status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error updating lost pet status:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete a lost pet report
  deleteLostPetReport: async (lostPetId, userId) => {
    try {
      console.log('API: Deleting lost pet report:', lostPetId, userId);
      const response = await api.delete(`/lostpets/${lostPetId}`, {
        data: { userId }
      });
      console.log('API: Lost pet report deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error deleting lost pet report:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get lost pets statistics
  getLostPetStats: async () => {
    try {
      const response = await api.get('/lostpets/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching lost pet stats:', error);
      return {
        total: 0,
        missing: 0,
        seen: 0,
        found: 0,
        speciesBreakdown: [],
        recentReports: 0
      };
    }
  },
};

export default api; 