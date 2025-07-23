import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { placeAPI } from '../services/api';
import './PlaceFormModal.css';

const PlaceFormModal = ({ isOpen, onClose, coordinates, onPlaceCreated }) => {
  const { mongoUser, firebaseUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog park', // Default to dog park
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  // Place types matching backend enum
  const placeTypes = [
    { value: 'dog park', label: 'DOG PARK', icon: '🐕' },
    { value: 'vet', label: 'VET', icon: '🏥' },
    { value: 'pet store', label: 'PET STORE', icon: '🏪' },
    { value: 'shelter', label: 'SHELTER', icon: '🏠' },
  ];

  // Reverse geocode to get address when coordinates change
  useEffect(() => {
    if (coordinates && isOpen) {
      reverseGeocodeAddress();
    }
  }, [coordinates, isOpen]);

  const reverseGeocodeAddress = async () => {
    if (!coordinates) return;
    
    setAddressLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to get address');
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract street address
        const addr = data.address || {};
        let streetAddress = '';

        if (addr.house_number && addr.road) {
          streetAddress = `${addr.house_number} ${addr.road}`;
        } else if (addr.road) {
          streetAddress = addr.road;
        }

        // Add city
        let city = addr.city || addr.town || addr.village || addr.suburb || '';
        let state = addr.state || '';

        let fullAddress = streetAddress;
        if (city) {
          fullAddress = fullAddress ? `${fullAddress}, ${city}` : city;
        }
        if (state) {
          fullAddress = fullAddress ? `${fullAddress}, ${state}` : state;
        }

        setFormData(prev => ({ ...prev, address: fullAddress || data.display_name }));
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setFormData(prev => ({ ...prev, address: 'Address not available' }));
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!mongoUser || !firebaseUser) {
      setError('Please log in to create a new place');
      return;
    }

    // Validate form
    if (!formData.name.trim()) {
      setError('Place name is required');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare place data
      const placeData = {
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim(),
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng
        },
        userId: mongoUser._id, // Add user ID for backend
        tags: [], // Empty tags initially
        description: '', // Empty description
        phone: '',
        website: '',
        opening_hours: ''
      };

      console.log('Creating new place:', placeData);
      
      // Create the place
      const createdPlace = await placeAPI.createPlace(placeData);
      console.log('Place created successfully:', createdPlace);

      // Call success callback
      if (onPlaceCreated) {
        onPlaceCreated(createdPlace);
      }

      // Close modal
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        type: 'dog park',
        address: '',
      });
    } catch (err) {
      console.error('Error creating place:', err);
      
      // Check for duplicate error
      if (err.response?.data?.error?.includes('duplicate') || 
          err.response?.data?.error?.includes('already exists')) {
        setError('A place with this name or address already exists');
      } else {
        setError(err.response?.data?.error || 'Failed to create place. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Place</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="place-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Place Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter place name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Place Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              {placeTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={addressLoading ? "Getting address..." : "Enter address"}
              required
              disabled={loading || addressLoading}
            />
          </div>

          <div className="coordinates-info">
            📍 Location: {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading || addressLoading}
            >
              {loading ? 'Creating...' : 'Create Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceFormModal; 