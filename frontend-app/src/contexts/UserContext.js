import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { userAPI } from '../services/api';
import useAutoLocationUpdates from '../hook/UseAutoLocationUpdate';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setFirebaseUser(user);

      if (user) {
        await user.reload(); // Ensure we have the latest user data
        const refreshedUser = auth.currentUser;
        setFirebaseUser(refreshedUser);
        // Early return if user is not verified
        if (!refreshedUser.emailVerified) {
          setMongoUser(null);
          setLoading(false);
          return;
        }

        // Try to find or create MongoDB user
        try {
          console.log('Looking for MongoDB user with UID:', refreshedUser.uid);
          let dbUser = await userAPI.getUserByFirebaseUid(refreshedUser.uid);

          if (!dbUser) {
            console.log('MongoDB user not found, creating new user...');
            // Create new MongoDB user with correct structure - ensure data is stored in MongoDB Atlas
            dbUser = await userAPI.createUser({
              uid: refreshedUser.uid, // Firebase UID for authentication reference only
              name: refreshedUser.displayName || refreshedUser.email?.split('@')[0] || 'User',
              email: refreshedUser.email || '',
              profileImage: refreshedUser.photoURL || '',
              favoritePlaces: [], // Initialize as empty array
              collectedCards: [], // Initialize as empty array
              lastLoginLocation: {
                lat: null,
                lng: null,
                updatedAt: new Date()
              }
            });
            console.log('Created new MongoDB user in Atlas:', dbUser);
          } else {
            console.log('Found existing MongoDB user in Atlas:', dbUser);

            // Ensure user has required fields (for backward compatibility)
            if (!dbUser.favoritePlaces) dbUser.favoritePlaces = [];
            if (!dbUser.collectedCards) dbUser.collectedCards = [];
            if (!dbUser.lastLoginLocation) {
              dbUser.lastLoginLocation = {
                lat: null,
                lng: null,
                updatedAt: new Date()
              };
            }
          }

          setMongoUser(dbUser);

        } catch (error) {
          console.error('Error syncing user with MongoDB Atlas:', error);
          // Don't set mongoUser to null if there's an error - user might still be valid
          // Just log the error and continue
        }
      } else {
        console.log('No Firebase user, clearing MongoDB user');
        setFirebaseUser(null);
        setMongoUser(null);
      }

      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const updateMongoUser = async (updates) => {
    if (!mongoUser?._id) {
      console.error('Cannot update user: mongoUser._id is missing');
      return;
    }

    try {
      console.log('Updating MongoDB user with:', updates);
      const updatedUser = await userAPI.updateUser(mongoUser._id, updates);
      console.log('Successfully updated MongoDB user:', updatedUser);
      setMongoUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating MongoDB user:', error);
      throw error;
    }
  };

  const updateLastLoginLocation = async (lat, lng) => {
    if (!mongoUser?._id) {
      console.error('Cannot update location: mongoUser is missing. - UserContext.js > updateLastLoginLocation');
      return;
    }
    try {
      await updateMongoUser({
        lastLoginLocation: {
          lat, lng, updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error("Error updating last login location:", error);
      throw error;
    }
  };

  const requestLocationUpdate = useCallback(async () => {
    if (!mongoUser?._id) {
      console.error('Cannot update location, mongoUser is missing. - UserContext.js > requestLocationUpdate');
      return;
    }
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported. - UserContext.js > requestLocationUpdate'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateLastLoginLocation(position.coords.latitude, position.coords.longitude);
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          } catch (error) {
            console.error("Error updating last login location:", error);
            reject(error);
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 }  // 5 minutes
      );
    });
  }, [mongoUser?._id]);

  useAutoLocationUpdates(mongoUser, requestLocationUpdate);

  const value = {
    firebaseUser,
    mongoUser,
    loading,
    updateMongoUser,
    requestLocationUpdate,
    mongoUserId: mongoUser?._id
  };

  // console.log('UserContext value:', {
  //   hasFirebaseUser: !!firebaseUser,
  //   hasMongoUser: !!mongoUser,
  //   loading,
  //   firebaseUserEmail: firebaseUser?.email,
  //   mongoUserEmail: mongoUser?.email,
  //   mongoUserId: mongoUser?._id,
  //   mongoUserObject: mongoUser,
  //   mongoUserIdType: typeof mongoUser?._id
  // });

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 