import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
};

// Pet API calls
export const petAPI = {
  // Create a new pet
  createPet: async (petData) => {
    const response = await api.post('/pets', petData);
    return response.data;
  },

  // Get all pets (for a user)
  getAllPets: async () => {
    const response = await api.get('/pets');
    return response.data;
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
    formData.append('photo', file);
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
  deletePlace: async (placeId) => {
    const response = await api.delete(`/places/${placeId}`);
    return response.data;
  },
};

// Review API calls
export const reviewAPI = {
  // Create a review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a place
  getReviewsByPlace: async (placeId) => {
    const response = await api.get(`/reviews/place/${placeId}`);
    return response.data;
  },
};

// Card API calls
export const cardAPI = {
  // Get user's cards
  getUserCards: async (userId) => {
    const response = await api.get(`/cards/user/${userId}`);
    return response.data;
  },

  // Create a card
  createCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },
};

export default api; 