import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { logOut } from '../firebase';
import { useUser } from '../contexts/UserContext';
import { petAPI, cardAPI, userAPI } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { firebaseUser, mongoUser, loading: userLoading, updateMongoUser, mongoUserId } = useUser();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pets, setPets] = useState([]);
  const [cards, setCards] = useState([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImage: ''
  });
  const [petFormData, setPetFormData] = useState({
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
  const [newPhoto, setNewPhoto] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Profile component - User state:', {
      hasFirebaseUser: !!firebaseUser,
      hasMongoUser: !!mongoUser,
      userLoading,
      firebaseUserEmail: firebaseUser?.email,
      mongoUserEmail: mongoUser?.email,
      mongoUser: mongoUser
    });
  }, [firebaseUser, mongoUser, userLoading]);

  useEffect(() => {
    // Set profile data from either mongoUser or firebaseUser
    if (mongoUser) {
      console.log('Setting profile data from mongoUser:', mongoUser);
      setProfileData({
        name: mongoUser.name || '',
        email: mongoUser.email || '',
        profileImage: mongoUser.profileImage || ''
      });
    } else if (firebaseUser) {
      console.log('Setting profile data from firebaseUser (mongoUser not available)');
      setProfileData({
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        profileImage: firebaseUser.photoURL || ''
      });
    }
  }, [mongoUser, firebaseUser]);

  // Load user's pets and cards
  useEffect(() => {
    if (mongoUserId) {
      loadUserPets();
      loadUserCards();
    }
  }, [mongoUserId]);

  const loadUserPets = async () => {
    try {
      console.log('Loading pets for user:', mongoUserId);
      const userPets = await petAPI.getAllPets(mongoUserId);
      console.log('Loaded pets:', userPets);
      setPets(userPets || []);
    } catch (error) {
      console.error('Error loading pets:', error);
      setPets([]);
    }
  };

  const loadUserCards = async () => {
    try {
      console.log('Loading cards for user:', mongoUserId);
      const userCards = await cardAPI.getUserCards(mongoUserId);
      console.log('Loaded cards:', userCards);
      setCards(userCards || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
    }
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
    return years === 0 ? '< 1 year' : `${years} year${years > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Profile form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Pet form handlers
  const handlePetInputChange = (e) => {
    const { name, value } = e.target;
    setPetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTrait = () => {
    if (newTraitInput.trim()) {
      setPetFormData(prev => ({
        ...prev,
        personalityTraits: [...prev.personalityTraits, newTraitInput.trim()]
      }));
      setNewTraitInput('');
    }
  };

  const handleRemoveTrait = (index) => {
    setPetFormData(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter((_, i) => i !== index)
    }));
  };

  const handlePetPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Store the file for later upload when form is submitted
      setPetFormData(prev => ({
        ...prev,
        _photoFile: file
      }));
    }
  };

  const resetPetForm = () => {
    setPetFormData({
      name: '',
      species: 'dog',
      breed: '',
      gender: 'unknown',
      birthDate: '',
      personalityTraits: [],
      notes: '',
      profileImage: '',
      _photoFile: null
    });
    setEditingPet(null);
    setShowAddPet(false);
    setNewTraitInput('');
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      let profileImage = profileData.profileImage;
      
      // Upload new photo if selected using AWS S3
      if (newPhoto) {
        console.log('Uploading user photo to AWS S3...');
        const uploadResult = await userAPI.uploadUserPhoto(newPhoto);
        profileImage = uploadResult.imageUrl;
        console.log('User photo uploaded successfully:', profileImage);
      }

      // Update Firebase auth profile
      await updateProfile(firebaseUser, {
        displayName: profileData.name,
        photoURL: profileImage
      });

      // Update MongoDB user if available
      if (mongoUser && updateMongoUser) {
        console.log('Saving profile data to MongoDB:', {
          name: profileData.name,
          profileImage: profileImage
        });
        
        await updateMongoUser({
          name: profileData.name,
          profileImage: profileImage
        });
        
        console.log('Profile saved successfully');
      } else {
        console.warn('Cannot save to MongoDB: mongoUser not available');
      }

      setEditing(false);
      setNewPhoto(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePetSubmit = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('Pet submit - Debug info:', {
      mongoUserId,
      mongoUser,
      mongoUserObjectId: mongoUser?._id,
      firebaseUser: firebaseUser?.uid
    });
    
    if (!mongoUserId) {
      console.error('Pet submit failed - mongoUserId is missing:', {
        mongoUserId,
        mongoUser,
        hasMongoUser: !!mongoUser,
        mongoUserKeys: mongoUser ? Object.keys(mongoUser) : 'null'
      });
      alert('Please complete your profile first. Debug: mongoUserId is missing.');
      return;
    }

    setLoading(true);
    try {
      let profileImage = petFormData.profileImage;
      
      // Upload photo to AWS S3 if a new file was selected
      if (petFormData._photoFile) {
        console.log('Uploading pet photo to AWS S3...');
        const uploadResult = await petAPI.uploadPetPhoto(petFormData._photoFile);
        profileImage = uploadResult.imageUrl;
        console.log('Pet photo uploaded successfully:', profileImage);
      }

      const petData = {
        ...petFormData,
        profileImage: profileImage,
        owner: mongoUserId
      };
      
      // Remove the temporary file reference
      delete petData._photoFile;

      if (editingPet) {
        await petAPI.updatePet(editingPet._id, petData);
      } else {
        await petAPI.createPet(petData);
      }

      await loadUserPets();
      resetPetForm();
      alert(editingPet ? 'Pet updated successfully!' : 'Pet added successfully!');
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error saving pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setPetFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender,
      birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : '',
      personalityTraits: pet.personalityTraits || [],
      notes: pet.notes || '',
      profileImage: pet.profileImage || ''
    });
    setShowAddPet(true);
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petAPI.deletePet(petId);
        await loadUserPets();
        alert('Pet deleted successfully!');
      } catch (error) {
        console.error('Error deleting pet:', error);
        alert('Error deleting pet. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (userLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!firebaseUser) {
    return (
      <div className="profile-container">
        <div className="auth-prompt">
          <h2>Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!editing && (
          <button className="edit-button" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {!mongoUser && (
        <div className="profile-warning">
          <p>⚠️ Your profile data is being synced with our database. Some features may be limited.</p>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-photo-section">
          <img 
            src={profileData.profileImage || '/default-avatar.png'} 
            alt="Profile" 
            className="profile-photo"
          />
          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
          )}
        </div>

        <div className="profile-info">
          {editing ? (
            <form className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  disabled // Email should not be editable
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setEditing(false);
                    // Reset to current data source - safely handle null mongoUser
                    const currentUser = mongoUser || firebaseUser;
                    setProfileData({
                      name: currentUser?.name || currentUser?.displayName || '',
                      email: currentUser?.email || '',
                      profileImage: currentUser?.profileImage || currentUser?.photoURL || ''
                    });
                    setNewPhoto(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <h2>{profileData.name || 'Anonymous User'}</h2>
              <p className="email">{profileData.email}</p>
              
              <div className="profile-section">
                <h3>Account Information</h3>
                {mongoUser?.joinedAt && (
                  <p><strong>Member since:</strong> {new Date(mongoUser.joinedAt).toLocaleDateString()}</p>
                )}
                {!mongoUser?.joinedAt && (
                  <p><strong>Account Status:</strong> Active</p>
                )}
              </div>

              {/* My Pets Section */}
              <div className="profile-section">
                <div className="pets-section-header">
                  <h3>My Pets ({pets.length})</h3>
                  {!showAddPet && (
                    <button 
                      className="add-pet-button"
                      onClick={() => setShowAddPet(true)}
                    >
                      Add Pet
                    </button>
                  )}
                </div>

                {showAddPet && (
                  <div className="pet-form-container">
                    <h4>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h4>
                    <form onSubmit={handlePetSubmit} className="pet-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Pet Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={petFormData.name}
                            onChange={handlePetInputChange}
                            required
                            placeholder="Enter pet's name"
                          />
                        </div>

                        <div className="form-group">
                          <label>Species</label>
                          <select
                            name="species"
                            value={petFormData.species}
                            onChange={handlePetInputChange}
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
                            name="breed"
                            value={petFormData.breed}
                            onChange={handlePetInputChange}
                            placeholder="e.g., Golden Retriever"
                          />
                        </div>

                        <div className="form-group">
                          <label>Gender</label>
                          <select
                            name="gender"
                            value={petFormData.gender}
                            onChange={handlePetInputChange}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Birth Date</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={petFormData.birthDate}
                          onChange={handlePetInputChange}
                        />
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
                        <div className="traits-display">
                          {petFormData.personalityTraits.map((trait, index) => (
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
                          value={petFormData.notes}
                          onChange={handlePetInputChange}
                          placeholder="Any special needs, medical conditions, etc."
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Profile Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePetPhotoChange}
                        />
                        {petFormData.profileImage && (
                          <img 
                            src={petFormData.profileImage} 
                            alt="Pet preview" 
                            className="photo-preview"
                          />
                        )}
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={loading}>
                          {loading ? 'Saving...' : (editingPet ? 'Update Pet' : 'Add Pet')}
                        </button>
                        <button type="button" onClick={resetPetForm}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!showAddPet && pets.length > 0 && (
                  <div className="pets-grid">
                    {pets.map(pet => (
                      <div key={pet._id} className="pet-profile-card">
                        <div className="pet-header">
                          <img 
                            src={pet.profileImage || '/default-avatar.png'} 
                            alt={pet.name}
                            className="pet-profile-image"
                          />
                          <div className="pet-basic-info">
                            <h4>{pet.name}</h4>
                            <p className="pet-species">{pet.species}{pet.breed && ` • ${pet.breed}`}</p>
                            <p className="pet-details">{pet.gender} • {calculateAge(pet.birthDate)} old</p>
                          </div>
                        </div>
                        
                        {pet.birthDate && (
                          <p className="pet-birth"><strong>Born:</strong> {formatDate(pet.birthDate)}</p>
                        )}
                        
                        {pet.personalityTraits && pet.personalityTraits.length > 0 && (
                          <div className="pet-traits">
                            <strong>Personality:</strong>
                            <div className="traits-list">
                              {pet.personalityTraits.map((trait, index) => (
                                <span key={index} className="trait-tag">{trait}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {pet.notes && (
                          <p className="pet-notes"><strong>Notes:</strong> {pet.notes}</p>
                        )}

                        <div className="pet-actions">
                          <button onClick={() => handleEditPet(pet)}>Edit</button>
                          <button onClick={() => handleDeletePet(pet._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddPet && pets.length === 0 && (
                  <div className="empty-pets">
                    <p>No pets added yet.</p>
                    <p>Click "Add Pet" to add your first pet!</p>
                  </div>
                )}
              </div>

              {/* My Cards Section */}
              <div className="profile-section">
                <div className="cards-section-header">
                  <h3>My Cards ({cards.length})</h3>
                </div>

                {cards.length > 0 ? (
                  <div className="cards-grid">
                    {cards.map(card => (
                      <div key={card._id} className="card-profile-item">
                        <div className="card-image">
                          <img 
                            src={card.imageUrl || '/placeholder-card.png'} 
                            alt={card.caption || 'Place card'}
                            className="card-preview-image"
                          />
                        </div>
                        <div className="card-details">
                          <h4>{card.place?.name || 'Unknown Place'}</h4>
                          {card.caption && <p className="card-caption">{card.caption}</p>}
                          <div className="card-meta">
                            <p className="card-date">Created: {new Date(card.createdAt).toLocaleDateString()}</p>
                            {card.helpfulCount > 0 && (
                              <p className="card-helpful">❤️ {card.helpfulCount} helpful</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-cards">
                    <p>No cards collected yet.</p>
                    <p>Visit places and create memories to collect cards!</p>
                  </div>
                )}
              </div>

              {/* Collections Summary */}
              <div className="profile-section">
                <h3>Collections Summary</h3>
                <div className="collections-grid">
                  <div className="collection-item">
                    <h4>Favorite Places</h4>
                    <p className="collection-count">{mongoUser?.favoritePlaces?.length || 0} places</p>
                  </div>
                  
                  <div className="collection-item">
                    <h4>Collected Cards</h4>
                    <p className="collection-count">{cards.length} cards</p>
                  </div>

                  <div className="collection-item">
                    <h4>My Pets</h4>
                    <p className="collection-count">{pets.length} pets</p>
                  </div>
                </div>
              </div>

              <button className="logout-button" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 