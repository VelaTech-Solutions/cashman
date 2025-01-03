// src/firebase/auth.js

import { auth } from './firebase'; // Import the initialized auth instance

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
