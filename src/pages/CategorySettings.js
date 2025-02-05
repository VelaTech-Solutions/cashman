import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Component Imports
import Sidebar from "components/Sidebar";

// Firebase imports
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const CategorySettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const links = [
    { path: "javascript:void(0)", label: "Back", icon: "ph-arrow-left" },
  ];

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      const categoryCollection = collection(db, "categories");
      await addDoc(categoryCollection, {
        name: newCategory,
        subcategories: [],
      });
      setNewCategory("");
      alert("Category added successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Add a new subcategory
  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim() || !selectedCategoryId) {
      alert("Subcategory name or category selection is missing.");
      return;
    }

    try {
      const categoryRef = doc(db, "categories", selectedCategoryId);
      await updateDoc(categoryRef, {
        subcategories: arrayUnion({
          id: Date.now().toString(),
          name: newSubcategory,
        }),
      });
      setNewSubcategory("");
      alert("Subcategory added successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const categoryDocRef = doc(db, "categories", categoryId); // Reference to the category document
        await deleteDoc(categoryDocRef); // Delete the category
        alert("Category deleted successfully!");
        // Refresh data
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryId),
        );
      } catch (err) {
        console.error("Failed to delete category:", err);
        alert("An error occurred while deleting the category.");
      }
    }
  };

  // Delete a subcategory
  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const subcategoryDocRef = doc(db, "subcategories", subcategoryId); // Reference to the subcategory document
        await deleteDoc(subcategoryDocRef); // Delete the subcategory
        alert("Subcategory deleted successfully!");
        // Refresh data
        setSubcategories((prevSubcategories) =>
          prevSubcategories.filter(
            (subcategory) => subcategory.id !== subcategoryId,
          ),
        );
      } catch (err) {
        console.error("Failed to delete subcategory:", err);
        alert("An error occurred while deleting the subcategory.");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Category Settings" links={links} />

      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">
          Manage Categories & Subcategories
        </h1>

        {/* Add Category */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400">
            Add New Category
          </h2>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 mt-2"
          />
          <button
            onClick={handleAddCategory}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Add Category
          </button>
        </div>

        {/* Add Subcategory */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400">
            Add New Subcategory
          </h2>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white mt-2"
          >
            <option value="">Select a Category</option>
            {(categories || []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="Subcategory Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 mt-2"
          />
          <button
            onClick={handleAddSubcategory}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Add Subcategory
          </button>
        </div>

        {/* List Categories and Subcategories */}
        <div>
          <h2 className="text-xl font-semibold text-blue-400">
            Existing Categories
          </h2>
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-lg font-bold text-blue-400">{category.name}</p>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2"
              >
                Delete Category
              </button>
              <ul className="mt-4 space-y-2">
                {(category.subcategories || []).map((subcategory) => (
                  <li key={subcategory.id} className="text-gray-400">
                    {subcategory.name}{" "}
                    <button
                      onClick={() =>
                        handleDeleteSubcategory(category.id, subcategory)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded ml-2"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySettings;
