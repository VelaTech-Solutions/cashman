// src/index.js - Entry point for your app

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { firebaseApp } from './firebase/config'; // Correct import for the Firebase app
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

console.log('Firebase App initialized:', firebaseApp);
console.log('Auth service initialized:', auth);
console.log('Firestore service initialized:', db);

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

