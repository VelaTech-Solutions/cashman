// src/components/LoadCategories.js

// this needs to Read and Write to the categories collection in Firestore db root
import { db } from "../../firebase/firebase";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
  } from "firebase/firestore";
  
  // Fetch all categories
  export const loadCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  };
  
  // Add a new category
  export const addCategory = async (name) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, "categories"), { name });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };
  
  // Delete category by ID
  export const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };