import React, { useState, useEffect } from 'react';
import { auth, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logOut } from '../firebase';
import { userAPI } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImage: ''
  });
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async (firebaseUid) => {
    try {
      // First, try to get the user from MongoDB using Firebase UID
      // Note: This assumes the backend has been updated to find users by Firebase UID
      // For now, we'll create a new user if one doesn't exist
      const userData = {
        uid: firebaseUid,
        name: user?.displayName || '',
        email: user?.email || '',
        profileImage: user?.photoURL || ''
      };
      
      // Store the user data temporarily
      // In a real implementation, you'd need to sync Firebase UID with MongoDB _id
      setMongoUser(userData);
      setProfileData({
        name: userData.name,
        email: userData.email,
        profileImage: userData.profileImage
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // If user doesn't exist in MongoDB, use Firebase data
      setProfileData({
        name: user?.displayName || '',
        email: user?.email || '',
        profileImage: user?.photoURL || ''
      });
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
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let profileImage = profileData.profileImage;
      
      // Upload new photo if selected
      if (newPhoto) {
        const storageRef = ref(storage, `profiles/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, newPhoto);
        profileImage = await getDownloadURL(snapshot.ref);
      }

      // Update Firebase auth profile
      await updateProfile(user, {
        displayName: profileData.name,
        photoURL: profileImage
      });

      // Update MongoDB user
      // Note: In a real implementation, you'd need to sync with MongoDB
      // For now, we'll just update the local state
      const updatedUser = {
        ...mongoUser,
        name: profileData.name,
        email: profileData.email,
        profileImage: profileImage
      };
      
      setMongoUser(updatedUser);
      setProfileData({
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage
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
                    loadUserProfile(user.uid);
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
                <p>Firebase UID: {user.uid}</p>
                {mongoUser?.joinedAt && (
                  <p>Member since: {new Date(mongoUser.joinedAt).toLocaleDateString()}</p>
                )}
              </div>

              <div className="profile-section">
                <h3>Collections</h3>
                <p>Favorite Places: {mongoUser?.favoritePlaces?.length || 0}</p>
                <p>Collected Cards: {mongoUser?.collectedCards?.length || 0}</p>
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