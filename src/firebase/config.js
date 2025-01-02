// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyBFd6YsOf1BS21_rshs854lw6COwOcKn7w',
  authDomain: 'cashman-790ad.firebaseapp.com',
  projectId: 'cashman-790ad',
  storageBucket: 'cashman-790ad.firebasestorage.app',
  messagingSenderId: '106033459495',
  appId: '1:106033459495:web:084cd32213e7fd820ef902',
  measurementId: 'G-ZEZ8YPPMP3'
};

const firebaseApp = initializeApp(firebaseConfig);

export { firebaseApp };  // Export the initialized app


const db = getFirestore(firebaseApp);

export { db };