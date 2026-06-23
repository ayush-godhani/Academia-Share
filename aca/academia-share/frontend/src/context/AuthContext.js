
// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../utils/api';
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // Register: Firebase Auth + save profile to backend
  const register = async ({ firstName, lastName, email, password, userType, institution, newsletter }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    // Save extra info to Firestore via backend
    await api.post('/auth/register', { uid, firstName, lastName, email, userType, institution, newsletter });
    return cred.user;
  };
 
  // Login with Firebase
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };
 
  // Logout
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };
 
  // Get Firebase ID token for API calls
  const getToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };
 
  // Fetch Firestore profile from backend
  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setUserProfile(res.data.user);
      return res.data.user;
    } catch {
      return null;
    }
  };
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Set token in axios defaults after login
        const token = await user.getIdToken();
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchProfile();
      } else {
        delete api.defaults.headers.common['Authorization'];
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
 
  const value = { currentUser, userProfile, loading, register, login, logout, getToken, fetchProfile };
 
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);
