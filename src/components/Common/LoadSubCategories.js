// src/components/LoadSubCategories.js

// this needs to Read and Write to the categories collection in Firestore db root
import { db } from "../../firebase/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc } from "firebase/firestore";

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

// Delete a subcategory from Firestore using deleteDoc

// Delete a subcategory from a category
export const deleteSubcategory = async (categoryId, subcategoryId) => {
  if (!categoryId || !subcategoryId) {
    console.error("Invalid categoryId or subcategoryId:", categoryId, subcategoryId);
    return;
  }

  try {
    // Fetch the category document to get current subcategories
    const categoryRef = doc(db, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      console.error("Category does not exist");
      return;
    }

    const categoryData = categorySnap.data();

    // Check if subcategories exist
    if (!categoryData.subcategories || categoryData.subcategories.length === 0) {
      console.error("No subcategories to delete");
      return;
    }

    // Ensure you're passing the correct structure (ensure subcategory is an object)
    const subcategoryToDelete = categoryData.subcategories.find(
      (subcat) => subcat.id === subcategoryId
    );

    if (!subcategoryToDelete) {
      console.error("Subcategory not found");
      return;
    }

    // Use arrayRemove to remove the subcategory
    await updateDoc(categoryRef, {
      subcategories: arrayRemove(subcategoryToDelete),
    });

    console.log("Subcategory deleted successfully");
  } catch (error) {
    console.error("Error deleting subcategory:", error);
  }
};