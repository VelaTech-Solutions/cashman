// src/components/LoadSubCategories.js

// this needs to Read and Write to the categories collection in Firestore db root


import { db } from "../../firebase/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

  

// Load only subcategories for a specific category
export const loadSubcategories = async (categoryId) => {
    if (!categoryId) return [];
  
    try {
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      if (categoryDoc.exists()) {
        const data = categoryDoc.data();
        return data.subcategories || [];
      }
    } catch (err) {
      console.error("Error loading subcategories:", err);
    }
  
    return [];
  };


// Add a subcategory to a category
export const addSubcategory = async (categoryId, subcategoryName) => {
    if (!categoryId || !subcategoryName.trim()) return;
  
    const subcategory = {
      id: Date.now().toString(),
      name: subcategoryName,
    };
  
    try {
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        subcategories: arrayUnion(subcategory),
      });
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };
  
// Delete a subcategory from a category
export const deleteSubcategory = async (categoryId, subcategory) => {
    if (!categoryId || !subcategory) return;
  
    try {
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        subcategories: arrayRemove(subcategory),
      });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };