import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/tailwind.css';

// firebase imports
import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSettings, setShowSettings] = useState(false); // Toggle for both sections

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const categoryCollection = collection(db, 'categories');
      const subcategoryCollection = collection(db, 'subcategories');

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
      console.error('Failed to fetch data:', err);
    }
  };

  // Fetch categories and subcategories on mount
  useEffect(() => {
    fetchCategoriesAndSubcategories();
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Category name cannot be empty.');
      return;
    }

    try {
      const categoryCollection = collection(db, 'categories');
      await addDoc(categoryCollection, { name: newCategory });
      setNewCategory('');
      alert('Category added successfully!');
      fetchCategoriesAndSubcategories(); // Refresh data
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  // Add a new subcategory
  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim()) {
      alert('Subcategory name cannot be empty.');
      return;
    }

    try {
      const subcategoryCollection = collection(db, 'subcategories');
      await addDoc(subcategoryCollection, {
        name: newSubcategory,
        parentCategory: selectedCategory || null,
      });
      setNewSubcategory('');
      setSelectedCategory('');
      alert('Subcategory added successfully!');
      fetchCategoriesAndSubcategories(); // Refresh data
    } catch (err) {
      console.error('Failed to add subcategory:', err);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        alert('Category deleted successfully!');
        fetchCategoriesAndSubcategories(); // Refresh data
      } catch (err) {
        console.error('Failed to delete category.', err);
      }
    }
  };

  // Delete a subcategory
  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteDoc(doc(db, 'subcategories', subcategoryId));
        alert('Subcategory deleted successfully!');
        fetchCategoriesAndSubcategories(); // Refresh data
      } catch (err) {
        console.error('Failed to delete subcategory.', err);
      }
    }
  };

  return (


    <div className="p-8 bg-gray-900 text-white min-h-screen">
    {/* Back to Dashboard Button */}
    <div className="mb-6">
      <Link
        to="/dashboard"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md"
      >
        Back to Dashboard
      </Link>
    </div>
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Settings</h1>

      {/* Toggle Button */}
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowSettings(!showSettings)}
      >
        {showSettings ? 'Hide Categories & Subcategories' : 'Manage Categories & Subcategories'}
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
                    <li key={category.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                      <p className="text-blue-400 font-semibold">{category.name}</p>
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
                    <li key={subcategory.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                      <p className="text-blue-400 font-semibold">{subcategory.name}</p>
                      <p className="text-gray-400 text-sm">
                        Parent: {subcategory.parentCategory || 'None'}
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
  );
};

export default Settings;
