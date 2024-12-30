// src/firebase/auth.js - Handles Firebase authentication logic

import { firebase } from './firebase';

// Sign in function with error handling
const signIn = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
      console.error("Error signing in: ", error);
      throw error; // You can also throw an error to be handled by the calling component
    });
};

// Sign out function
const signOut = () => {
  return firebase.auth().signOut()
    .catch(error => {
      console.error("Error signing out: ", error);
      throw error; // Handle or display error
    });
};

export { signIn, signOut };
