import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { userAPI } from '../services/api';

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
        // Try to find or create MongoDB user
        try {
          console.log('Looking for MongoDB user with UID:', user.uid);
          let dbUser = await userAPI.getUserByFirebaseUid(user.uid);
          
          if (!dbUser) {
            console.log('MongoDB user not found, creating new user...');
            // Create new MongoDB user with correct structure - ensure data is stored in MongoDB Atlas
            dbUser = await userAPI.createUser({
              uid: user.uid, // Firebase UID for authentication reference only
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              profileImage: user.photoURL || '',
              favoritePlaces: [], // Initialize as empty array
              collectedCards: []  // Initialize as empty array
            });
            console.log('Created new MongoDB user in Atlas:', dbUser);
          } else {
            console.log('Found existing MongoDB user in Atlas:', dbUser);
            
            // Ensure user has required fields (for backward compatibility)
            if (!dbUser.favoritePlaces) dbUser.favoritePlaces = [];
            if (!dbUser.collectedCards) dbUser.collectedCards = [];
          }
          
          setMongoUser(dbUser);
        } catch (error) {
          console.error('Error syncing user with MongoDB Atlas:', error);
          // Don't set mongoUser to null if there's an error - user might still be valid
          // Just log the error and continue
        }
      } else {
        console.log('No Firebase user, clearing MongoDB user');
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

  const value = {
    firebaseUser,
    mongoUser,
    loading,
    updateMongoUser,
    mongoUserId: mongoUser?._id
  };

  console.log('UserContext value:', {
    hasFirebaseUser: !!firebaseUser,
    hasMongoUser: !!mongoUser,
    loading,
    firebaseUserEmail: firebaseUser?.email,
    mongoUserEmail: mongoUser?.email,
    mongoUserId: mongoUser?._id,
    mongoUserObject: mongoUser,
    mongoUserIdType: typeof mongoUser?._id
  });

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 