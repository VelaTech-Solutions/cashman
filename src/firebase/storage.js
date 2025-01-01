// src/firebase/storage.js
import { getStorage } from "firebase/storage";
import { firebaseApp } from "./config";

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);

export { storage };
