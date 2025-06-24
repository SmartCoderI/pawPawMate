import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logOut } from '../firebase';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    favoriteBreed: '',
    petName: '',
    petType: '',
    location: '',
    photoURL: ''
  });
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          displayName: data.displayName || user?.displayName || '',
          bio: data.bio || '',
          favoriteBreed: data.favoriteBreed || '',
          petName: data.petName || '',
          petType: data.petType || '',
          location: data.location || '',
          photoURL: data.photoURL || user?.photoURL || ''
        });
      } else {
        // Initialize with auth data
        setProfileData(prev => ({
          ...prev,
          displayName: user?.displayName || '',
          photoURL: user?.photoURL || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

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
          photoURL: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let photoURL = profileData.photoURL;
      
      // Upload new photo if selected
      if (newPhoto) {
        const storageRef = ref(storage, `profiles/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, newPhoto);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // Update auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoURL
      });

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        photoURL,
        updatedAt: new Date()
      });

      setEditing(false);
      setNewPhoto(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
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

      <div className="profile-content">
        <div className="profile-photo-section">
          <img 
            src={profileData.photoURL || '/default-avatar.png'} 
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
                <label>Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself and your pets"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                />
              </div>

              <div className="form-group">
                <label>Pet Name</label>
                <input
                  type="text"
                  name="petName"
                  value={profileData.petName}
                  onChange={handleInputChange}
                  placeholder="Your pet's name"
                />
              </div>

              <div className="form-group">
                <label>Pet Type</label>
                <select
                  name="petType"
                  value={profileData.petType}
                  onChange={handleInputChange}
                >
                  <option value="">Select pet type</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Favorite Breed</label>
                <input
                  type="text"
                  name="favoriteBreed"
                  value={profileData.favoriteBreed}
                  onChange={handleInputChange}
                  placeholder="Your favorite pet breed"
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
                    loadUserProfile(user.uid);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <h2>{profileData.displayName || 'Anonymous User'}</h2>
              <p className="email">{user.email}</p>
              
              {profileData.bio && (
                <div className="profile-section">
                  <h3>About</h3>
                  <p>{profileData.bio}</p>
                </div>
              )}

              {profileData.location && (
                <div className="profile-section">
                  <h3>Location</h3>
                  <p>{profileData.location}</p>
                </div>
              )}

              {(profileData.petName || profileData.petType || profileData.favoriteBreed) && (
                <div className="profile-section">
                  <h3>Pet Information</h3>
                  {profileData.petName && <p>Pet Name: {profileData.petName}</p>}
                  {profileData.petType && <p>Pet Type: {profileData.petType}</p>}
                  {profileData.favoriteBreed && <p>Favorite Breed: {profileData.favoriteBreed}</p>}
                </div>
              )}

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