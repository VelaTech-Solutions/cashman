// src/firebase/firestore.js
import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./config";

const db = getFirestore(firebaseApp);

export { db };