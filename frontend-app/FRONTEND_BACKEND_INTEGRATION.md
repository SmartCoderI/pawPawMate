# Frontend-Backend Integration Guide

## Overview
This document outlines the integration between the React frontend and MongoDB backend for PawPawMate.

## Current Status

### Backend (MongoDB + Express)
- **Database**: MongoDB with Mongoose ODM
- **API Base URL**: `http://localhost:4000/api`
- **Authentication**: Firebase Admin SDK (configured but auth middleware commented out for dev)
- **CORS**: Enabled for all origins

### Frontend (React + Firebase)
- **Authentication**: Firebase Auth
- **Previous Storage**: Firebase Firestore (needs migration to MongoDB)
- **New API Service**: Created `src/services/api.js` for MongoDB communication

## Schema Alignment

### User Schema
**Backend (MongoDB)**:
```javascript
{
  uid: String (Firebase UID),
  name: String,
  email: String,
  profileImage: String,
  joinedAt: Date,
  favoritePlaces: [ObjectId],
  collectedCards: [ObjectId]
}
```

**Frontend Changes Made**:
- Updated Profile.js to use simplified fields matching backend
- Removed Firestore-specific fields (bio, location, petName, petType, favoriteBreed)
- Added display of favoritePlaces and collectedCards counts

### Pet Schema
**Backend (MongoDB)**:
```javascript
{
  owner: ObjectId (User reference),
  name: String,
  species: 'dog' | 'cat' | 'other',
  breed: String,
  gender: 'male' | 'female' | 'unknown',
  birthDate: Date,
  profileImage: String,
  personalityTraits: [String],
  notes: String,
  createdAt: Date
}
```

**Frontend Changes Made**:
- Created new Pets.js component for pet management
- Added route `/pets` in App.js
- Created Pets.css for styling
- Separated pet management from user profile

## Files Created/Modified

### New Files:
1. `src/services/api.js` - API service for MongoDB communication
2. `src/pages/Pets.js` - Pet management component
3. `src/styles/Pets.css` - Pet component styles
4. `.env.example` - Environment configuration template

### Modified Files:
1. `src/pages/Profile.js` - Simplified to match User schema
2. `src/App.js` - Added Pets route

## Integration Challenges & Solutions

### 1. User ID Synchronization
**Challenge**: Frontend uses Firebase UID, backend expects MongoDB ObjectId
**Current Solution**: Storing Firebase UID in MongoDB user.uid field
**TODO**: Backend needs endpoint to find/create users by Firebase UID

### 2. Authentication Flow
**Challenge**: Backend auth middleware expects Firebase token verification
**Current Status**: Auth middleware commented out for development
**TODO**: 
- Implement Firebase token verification in backend
- Pass Firebase auth token in API requests
- Create user in MongoDB on first Firebase login

### 3. Data Migration
**Challenge**: Existing users may have data in Firestore
**TODO**: Create migration script or handle dual-source data temporarily

## Next Steps for Full Integration

1. **Backend Updates Needed**:
   - Add endpoint to find user by Firebase UID: `GET /api/users/firebase/:uid`
   - Add endpoint to create user from Firebase data: `POST /api/users/firebase`
   - Update pet routes to filter by authenticated user's pets
   - Enable auth middleware with proper Firebase token verification

2. **Frontend Updates Needed**:
   - Implement proper user creation on first login
   - Add error handling for API failures
   - Update Dashboard.js to use MongoDB API instead of Firestore
   - Update other components (Home, LostPets) to use MongoDB

3. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Set `REACT_APP_API_URL` if backend runs on different port/host
   - Ensure backend `.env` has `MONGO_URI` and Firebase credentials

4. **Testing**:
   - Test user registration/login flow
   - Test pet CRUD operations
   - Test image uploads
   - Test real-time features (lost pet alerts)

## Running the Application

### Backend:
```bash
cd pawPawMate/backend-app/src/backend
npm install
npm start
```

### Frontend:
```bash
cd pawPawMate/frontend-app
npm install
npm start
```

## API Endpoints Summary

### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Pets
- `POST /api/pets` - Create pet
- `GET /api/pets` - Get all pets (should filter by user)
- `GET /api/pets/:id` - Get pet by ID
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet
- `POST /api/pets/upload-photo` - Upload pet photo

### Places
- `GET /api/places` - Get all places
- `POST /api/places` - Create place
- `GET /api/places/:id` - Get place by ID
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/place/:placeId` - Get reviews for place

### Cards
- `GET /api/cards/user/:userId` - Get user's cards
- `POST /api/cards` - Create card 