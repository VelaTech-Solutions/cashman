import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/tailwind.css";
import { motion } from "framer-motion";

// Firebase imports
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const CategorySettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  

  // Fetch categories and subcategories
  const fetchCategoriesAndSubcategories = async () => {
    try {
      const categoryCollection = collection(db, "categories");
      const subcategoryCollection = collection(db, "subcategories");

      const [categorySnapshot, subcategorySnapshot] = await Promise.all([
        getDocs(categoryCollection),
        getDocs(subcategoryCollection),
      ]);

      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const subcategoryList = subcategorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(categoryList);
      setSubcategories(subcategoryList);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Error fetching categories or subcategories.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and subcategories on mount
  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      const categoryCollection = collection(db, "categories");
      await addDoc(categoryCollection, { name: newCategory });
      setNewCategory("");
      alert("Category added successfully!");
      fetchCategoriesAndSubcategories(); // Refresh data
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  // Add a new subcategory
  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim()) {
      alert("Subcategory name cannot be empty.");
      return;
    }

    try {
      const subcategoryCollection = collection(db, "subcategories");
      await addDoc(subcategoryCollection, {
        name: newSubcategory,
        parentCategory: selectedCategory || null,
      });
      setNewSubcategory("");
      setSelectedCategory("");
      alert("Subcategory added successfully!");
      fetchCategoriesAndSubcategories(); // Refresh data
    } catch (err) {
      console.error("Failed to add subcategory:", err);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, "categories", categoryId));
        alert("Category deleted successfully!");
        fetchCategoriesAndSubcategories(); // Refresh data
      } catch (err) {
        console.error("Failed to delete category.", err);
      }
    }
  };

  // Delete a subcategory
  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await deleteDoc(doc(db, "subcategories", subcategoryId));
        alert("Subcategory deleted successfully!");
        fetchCategoriesAndSubcategories(); // Refresh data
      } catch (err) {
        console.error("Failed to delete subcategory.", err);
      }
    }
  };

  // Check for loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-gray-400">Loading categories...</p>
      </div>
    );
  }

  // Check for errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
    {/* Sidebar */}
    <motion.div
      className="lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg hidden lg:block"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
    >
      <div className="flex items-center space-x-3 pb-4 pt-4">
        <h1 className="text-2xl font-bold text-blue-400">Cash Flow Manager</h1>
      </div>

      <nav className="space-y-4 border-t border-gray-700 pt-4">
        <button
          onClick={() => navigate(-1)} // Navigate back to the previous page
          className="flex items-center space-x-3 text-white hover:text-blue-400 transition"
        >
          <i className="ph-arrow-left text-xl"></i> Back
        </button>

        <Link
          to="/dashboard"
          className="flex items-center space-x-3 hover:text-white transition"
        >
          Back to Dashboard
          <i className="ph-check-square text-xl"></i>
        </Link>
        
      </nav>
    </motion.div>

      {/* Main Content */}
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Category Settings</h1>

        {/* Toggle Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings
            ? "Hide Categories & Subcategories"
            : "Manage Categories & Subcategories"}
        </button>

        {showSettings && (
          <div className="space-y-8">
            {/* Categories Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">Manage Categories</h2>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name..."
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 mt-2"
              />
              <button
                onClick={handleAddCategory}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
              >
                Add Category
              </button>
              {/* List of Categories */}
              <div className="mt-6">
                {categories.length === 0 ? (
                  <p className="text-gray-400">No categories available.</p>
                ) : (
                  <ul className="space-y-4">
                    {categories.map((category) => (
                      <li
                        key={category.id}
                        className="bg-gray-800 p-4 rounded-lg shadow-md"
                      >
                        <p className="text-blue-400 font-semibold">
                          {category.name}
                        </p>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2"
                        >
                          Delete Category
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Subcategories Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">Manage Subcategories</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white mt-2"
              >
                <option value="">No Parent (Standalone Subcategory)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="Enter subcategory name..."
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 mt-2"
              />
              <button
                onClick={handleAddSubcategory}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
              >
                Add Subcategory
              </button>
              {/* List of Subcategories */}
              <div className="mt-6">
                {subcategories.length === 0 ? (
                  <p className="text-gray-400">No subcategories available.</p>
                ) : (
                  <ul className="space-y-4">
                    {subcategories.map((subcategory) => (
                      <li
                        key={subcategory.id}
                        className="bg-gray-800 p-4 rounded-lg shadow-md"
                      >
                        <p className="text-blue-400 font-semibold">
                          {subcategory.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Parent: {subcategory.parentCategory || "None"}
                        </p>
                        <button
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2"
                        >
                          Delete Subcategory
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySettings;
