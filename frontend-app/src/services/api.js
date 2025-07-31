import axios from "axios";
import { auth } from "../firebase";

// Debug the environment variable more thoroughly
const envUrl = process.env.REACT_APP_API_URL;
const fallbackUrl = "http://localhost:5001/api";

// Use trimmed value to remove any spaces
const API_BASE_URL = envUrl ? envUrl.trim() : fallbackUrl;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available (excluding places and reviews - they handle auth via frontend)
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip auth token for places and reviews endpoints (frontend handles login checks)
      const skipAuthEndpoints = ["/places", "/reviews"];
      const shouldSkipAuth = skipAuthEndpoints.some((endpoint) => config.url?.includes(endpoint));

      if (shouldSkipAuth) {
        return config;
      }

      // Get Firebase ID token for other endpoints
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
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
    const response = await api.post("/users", userData);
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
      const response = await api.get(`/users/firebase/${uid}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
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
      const response = await api.put(`/users/${userId}`, { uid: newUid });
      return response.data;
    } catch (error) {
      console.error("Error updating user UID:", error);
      throw error;
    }
  },

  // Upload user profile photo
  uploadUserPhoto: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/users/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  markWelcomeModalSeen: async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/viewed-welcome-modal`);
      return response.data.user; // Return the updated user object from the response
    } catch (error) {
      console.error("API: Failed to mark welcome modal as seen:", error);
      throw error;
    }
  },
};

// Pet API calls
export const petAPI = {
  // Create a new pet
  createPet: async (petData) => {
    const response = await api.post("/pets", petData);
    return response.data;
  },

  // Get all pets (filtered by owner)
  getAllPets: async (ownerId) => {
    try {
      let url = "/pets";
      if (ownerId) {
        url += `?owner=${ownerId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching pets:", error);
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
    formData.append("image", file);
    const response = await api.post("/pets/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Place API calls
export const placeAPI = {
  // Get all places
  getAllPlaces: async () => {
    const response = await api.get("/places");
    return response.data;
  },

  // Create a new place
  createPlace: async (placeData) => {
    const response = await api.post("/places", placeData);
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
      data: { userId },
    });
    return response.data;
  },
};

// Review API calls
export const reviewAPI = {
  // Create a review (can automatically create place if it doesn't exist)
  createReview: async (reviewData) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("API: Review creation failed:", error);
      console.error("API: Error response:", error.response?.data);
      throw error;
    }
  },

  // Delete a review (only by the review author)
  deleteReview: async (reviewId, userId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`, {
        data: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("API: Review deletion failed:", error);
      console.error("API: Error response:", error.response?.data);
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

  // Like or unlike a review
  likeReview: async (reviewId, userId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/like`, { userId });
      return response.data;
    } catch (error) {
      console.error("API: Review like failed:", error);
      console.error("API: Error response:", error.response?.data);
      throw error;
    }
  },

  // Get like status for a review by a specific user
  getReviewLikeStatus: async (reviewId, userId) => {
    try {
      const response = await api.get(`/reviews/${reviewId}/like-status?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("API: Get review like status failed:", error);
      console.error("API: Error response:", error.response?.data);
      throw error;
    }
  },
};

// Card API calls
export const cardAPI = {
  // Get all cards
  getAllCards: async () => {
    try {
      const response = await api.get("/cards");
      return response.data;
    } catch (error) {
      console.error("Error fetching cards:", error);
      return [];
    }
  },

  // Get user's cards
  getUserCards: async (userId) => {
    try {
      const response = await api.get(`/cards/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user cards:", error);
      return [];
    }
  },

  // Create a card
  createCard: async (cardData) => {
    const response = await api.post("/cards", cardData);
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

      if (filters.status) params.append("status", filters.status);
      if (filters.species) params.append("species", filters.species);
      if (filters.bounds) params.append("bounds", JSON.stringify(filters.bounds));
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.limit) params.append("limit", filters.limit);

      const queryString = params.toString();
      const url = queryString ? `/lostpets?${queryString}` : "/lostpets";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching lost pets:", error);

      return [];
    }
  },

  // Create a new lost pet report
  createLostPetReport: async (reportData) => {
    console.log('API: createLostPetReport called with photos:', reportData.photos?.length || 0);

    if (reportData.photos && reportData.photos.length > 0) {
      console.log('API: Photo validation starting for', reportData.photos.length, 'photos');

      if (reportData.photos.length > 5) {
        throw new Error('Maximum 5 photos allowed');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      for (const photo of reportData.photos) {
        if (photo.size > maxSize) {
          throw new Error(`Photo "${photo.name}" is too large. Maximum size is 5MB.`);
        }
        if (!allowedTypes.includes(photo.type)) {
          throw new Error(`Photo "${photo.name}" has unsupported format. Use JPEG, PNG, GIF, or WebP.`);
        }
      }
      console.log('API: Photo validation passed');
    }

    const formData = new FormData();

    formData.append('petName', reportData.petName);
    formData.append('species', reportData.species);
    formData.append('breed', reportData.breed || '');
    formData.append('color', reportData.color);
    formData.append('size', reportData.size);
    formData.append('features', reportData.features || '');
    formData.append('lastSeenTime', reportData.lastSeenTime);
    formData.append('microchip', reportData.microchip || '');
    formData.append('collar', reportData.collar || '');
    formData.append('reward', reportData.reward || '');
    formData.append('userId', reportData.userId);

    formData.append('lastSeenLocation', JSON.stringify(reportData.lastSeenLocation));
    formData.append('ownerContact', JSON.stringify(reportData.ownerContact));
    formData.append('favoritePlaces', JSON.stringify(reportData.favoritePlaces || []));

    if (reportData.photos && reportData.photos.length > 0) {
      console.log('API: Appending', reportData.photos.length, 'photos to FormData');
      reportData.photos.forEach((photo, index) => {
        console.log(`API: Appending photo ${index + 1}: ${photo.name} (${photo.size} bytes)`);
        formData.append('photos', photo);
      });
    } else {
      console.log('API: No photos to append to FormData');
    }

    try {
      const response = await api.post("/lostpets", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("API: Error creating lost pet report:", error);
      console.error("API: Error response:", error.response?.data);

      throw error;
    }
  },

  // Get a specific lost pet by ID
  getLostPetById: async (lostPetId) => {
    try {
      const response = await api.get(`/lostpets/${lostPetId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lost pet:", error);

      throw error;
    }
  },

  // Add a sighting report to an existing lost pet
  addSightingReport: async (lostPetId, sightingData) => {
    try {
      const response = await api.post(`/lostpets/${lostPetId}/sightings`, sightingData);
      return response.data;
    } catch (error) {
      console.error("API: Error adding sighting report:", error);
      console.error("API: Error response:", error.response?.data);

      throw error;
    }
  },

  // Update lost pet status (mark as found, etc.)
  updateLostPetStatus: async (lostPetId, statusData) => {
    try {
      const response = await api.put(`/lostpets/${lostPetId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error("API: Error updating lost pet status:", error);
      console.error("API: Error response:", error.response?.data);

      throw error;
    }
  },

  // Delete a lost pet report
  deleteLostPetReport: async (lostPetId, userId) => {
    try {
      const response = await api.delete(`/lostpets/${lostPetId}`, {
        data: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("API: Error deleting lost pet report:", error);
      console.error("API: Error response:", error.response?.data);

      throw error;
    }
  },

  // Get lost pets statistics
  getLostPetStats: async () => {
    try {
      const response = await api.get("/lostpets/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching lost pet stats:", error);

      return {
        total: 0,
        missing: 0,
        seen: 0,
        found: 0,
        speciesBreakdown: [],

        recentReports: 0,
      };
    }
  },
};

export default api;
