import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { petAPI } from '../services/api';
import '../styles/Pets.css';

const Pets = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'unknown',
    birthDate: '',
    personalityTraits: [],
    notes: '',
    profileImage: ''
  });
  const [newTraitInput, setNewTraitInput] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadUserPets();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserPets = async () => {
    try {
      // Note: This assumes the backend filters pets by authenticated user
      const petsData = await petAPI.getAllPets();
      setPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
      setPets([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTrait = () => {
    if (newTraitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        personalityTraits: [...prev.personalityTraits, newTraitInput.trim()]
      }));
      setNewTraitInput('');
    }
  };

  const handleRemoveTrait = (index) => {
    setFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await petAPI.uploadPetPhoto(file);
        setFormData(prev => ({
          ...prev,
          profileImage: response.imageUrl
        }));
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error uploading photo. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const petData = {
        ...formData,
        owner: user.uid // This needs to be the MongoDB user ID in real implementation
      };

      if (editingPet) {
        await petAPI.updatePet(editingPet._id, petData);
      } else {
        await petAPI.createPet(petData);
      }

      await loadUserPets();
      resetForm();
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error saving pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender,
      birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : '',
      personalityTraits: pet.personalityTraits || [],
      notes: pet.notes || '',
      profileImage: pet.profileImage || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petAPI.deletePet(petId);
        await loadUserPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
        alert('Error deleting pet. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      gender: 'unknown',
      birthDate: '',
      personalityTraits: [],
      notes: '',
      profileImage: ''
    });
    setEditingPet(null);
    setShowAddForm(false);
    setNewTraitInput('');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Unknown';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return years - 1;
    }
    return years;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="pets-container">
        <div className="auth-prompt">
          <h2>Please sign in to manage your pets</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pets-container">
      <div className="pets-header">
        <h1>My Pets</h1>
        {!showAddForm && (
          <button className="add-pet-button" onClick={() => setShowAddForm(true)}>
            Add New Pet
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="pet-form-container">
          <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
          <form onSubmit={handleSubmit} className="pet-form">
            <div className="form-group">
              <label>Pet Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter pet's name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Species</label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="e.g., Golden Retriever"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Personality Traits</label>
              <div className="traits-input">
                <input
                  type="text"
                  value={newTraitInput}
                  onChange={(e) => setNewTraitInput(e.target.value)}
                  placeholder="e.g., playful, friendly, shy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTrait();
                    }
                  }}
                />
                <button type="button" onClick={handleAddTrait}>Add</button>
              </div>
              <div className="traits-list">
                {formData.personalityTraits.map((trait, index) => (
                  <span key={index} className="trait-tag">
                    {trait}
                    <button type="button" onClick={() => handleRemoveTrait(index)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special needs, medical conditions, etc."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              {formData.profileImage && (
                <img 
                  src={formData.profileImage} 
                  alt="Pet preview" 
                  className="photo-preview"
                />
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingPet ? 'Update Pet' : 'Add Pet')}
              </button>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.length === 0 ? (
            <p className="empty-state">No pets added yet. Click "Add New Pet" to get started!</p>
          ) : (
            pets.map(pet => (
              <div key={pet._id} className="pet-card">
                <div className="pet-image">
                  <img 
                    src={pet.profileImage || '/default-avatar.png'} 
                    alt={pet.name}
                  />
                </div>
                <div className="pet-details">
                  <h3>{pet.name}</h3>
                  <p className="pet-info">
                    {pet.species} {pet.breed && `• ${pet.breed}`}
                  </p>
                  <p className="pet-info">
                    {pet.gender} • Age: {calculateAge(pet.birthDate)}
                  </p>
                  {pet.personalityTraits && pet.personalityTraits.length > 0 && (
                    <div className="pet-traits">
                      {pet.personalityTraits.map((trait, index) => (
                        <span key={index} className="trait">{trait}</span>
                      ))}
                    </div>
                  )}
                  {pet.notes && (
                    <p className="pet-notes">{pet.notes}</p>
                  )}
                  <div className="pet-actions">
                    <button onClick={() => handleEdit(pet)}>Edit</button>
                    <button onClick={() => handleDelete(pet._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Pets; 