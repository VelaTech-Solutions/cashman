// src/firebase/auth.js - Handles Firebase authentication logic

import { firebaseApp } from './config'; // Use config to initialize auth
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const auth = getAuth(firebaseApp);  // Initialize auth with the Firebase app

// Sign in function with error handling
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error; // Handle or display error
  }
};
