// src/index.js - Entry point for your app

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { auth, db } from './firebase/firebase'; // Import initialized services

console.log('Auth service initialized:', auth);
console.log('Firestore service initialized:', db);

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

