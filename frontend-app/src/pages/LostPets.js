import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/LostPets.css';

const LostPets = () => {
  const [lostPets, setLostPets] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    petName: '',
    petType: 'dog',
    breed: '',
    color: '',
    size: 'medium',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    reward: '',
    photo: null
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    loadLostPets();

    return () => unsubscribe();
  }, []);

  const loadLostPets = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'lostPets'));
      const pets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLostPets(pets.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
    } catch (error) {
      console.error('Error loading lost pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to report a lost pet');
      return;
    }

    setLoading(true);
    try {
      let photoURL = '';
      
      // Upload photo if provided
      if (formData.photo) {
        const storageRef = ref(storage, `lostPets/${Date.now()}_${formData.photo.name}`);
        const snapshot = await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // Save to Firestore
      await addDoc(collection(db, 'lostPets'), {
        ...formData,
        photoURL,
        userId: user.uid,
        userName: user.displayName || user.email,
        createdAt: serverTimestamp(),
        status: 'lost'
      });

      // Reset form
      setFormData({
        petName: '',
        petType: 'dog',
        breed: '',
        color: '',
        size: 'medium',
        lastSeenLocation: '',
        lastSeenDate: '',
        description: '',
        contactPhone: '',
        contactEmail: '',
        reward: '',
        photo: null
      });
      setShowReportForm(false);
      
      // Reload pets
      await loadLostPets();
    } catch (error) {
      console.error('Error reporting lost pet:', error);
      alert('Error reporting lost pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="lost-pets-container">
      <div className="lost-pets-header">
        <h1>Lost & Found Pets</h1>
        <button 
          className="report-button"
          onClick={() => setShowReportForm(!showReportForm)}
        >
          {showReportForm ? 'Cancel' : 'Report Lost Pet'}
        </button>
      </div>

      {showReportForm && (
        <div className="report-form-container">
          <h2>Report a Lost Pet</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-row">
              <div className="form-group">
                <label>Pet Name*</label>
                <input
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pet Type*</label>
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
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
                  value={formData.breed}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Color*</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Size*</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Last Seen Location*</label>
                <input
                  type="text"
                  name="lastSeenLocation"
                  value={formData.lastSeenLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Seen Date*</label>
                <input
                  type="datetime-local"
                  name="lastSeenDate"
                  value={formData.lastSeenDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any distinguishing features, collar info, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone*</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Email*</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reward (Optional)</label>
                <input
                  type="text"
                  name="reward"
                  value={formData.reward}
                  onChange={handleInputChange}
                  placeholder="e.g., $100"
                />
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      <div className="lost-pets-grid">
        {lostPets.length === 0 ? (
          <p className="empty-state">No lost pets reported yet.</p>
        ) : (
          lostPets.map(pet => (
            <div key={pet.id} className="lost-pet-card">
              {pet.photoURL && (
                <img src={pet.photoURL} alt={pet.petName} className="pet-photo" />
              )}
              <div className="pet-info">
                <h3>{pet.petName}</h3>
                <div className="pet-details">
                  <span className="pet-type">{pet.petType}</span>
                  <span className="pet-size">{pet.size}</span>
                  {pet.breed && <span className="pet-breed">{pet.breed}</span>}
                </div>
                <p className="pet-color">Color: {pet.color}</p>
                <p className="last-seen">
                  Last seen: {pet.lastSeenLocation} on{' '}
                  {new Date(pet.lastSeenDate).toLocaleDateString()}
                </p>
                {pet.description && (
                  <p className="pet-description">{pet.description}</p>
                )}
                {pet.reward && (
                  <p className="reward">Reward: {pet.reward}</p>
                )}
                <div className="contact-info">
                  <p>Contact: {pet.contactPhone}</p>
                  <p>{pet.contactEmail}</p>
                </div>
                <p className="posted-date">
                  Posted {new Date(pet.createdAt?.toDate()).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LostPets; 