import React, { useEffect, useState } from "react";

// Firebase Imports
import { db } from "../../../../firebase/firebase";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Component Imports
import { Sidebar } from 'components/Common';


const CategorySettingsAddSubcategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  const links = [{ path: "javascript:void(0)", label: "Back", icon: "ph-arrow-left" }];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) {
      alert("Select a category and enter subcategory name.");
      return;
    }

    const subcategory = {
      id: Date.now().toString(),
      name: newSubcategoryName,
    };

    try {
      const categoryRef = doc(db, "categories", selectedCategoryId);
      await updateDoc(categoryRef, {
        subcategories: arrayUnion(subcategory),
      });

      setNewSubcategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategory) => {
    if (!window.confirm(`Delete subcategory "${subcategory.name}"?`)) return;

    try {
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        subcategories: arrayRemove(subcategory),
      });

      fetchCategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Manage Subcategories</h1>

        {/* Add Subcategory */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400">Add Subcategory</h2>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-3 mt-2 rounded-lg bg-gray-700 text-white"
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            placeholder="Subcategory Name"
            className="w-full p-3 mt-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            onClick={handleAddSubcategory}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Add Subcategory
          </button>
        </div>

        {/* List Subcategories by Category */}
{/* Organized Subcategories by Category */}
<div className="space-y-6">
  <h2 className="text-2xl font-bold text-sky-500 mb-6 border-b border-sky-800/50 pb-3">
    Manage Subcategories
  </h2>
  
  {loading ? (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
    </div>
  ) : categories.length === 0 ? (
    <div className="text-center p-8 bg-gray-850 rounded-xl border border-dashed border-gray-700">
      <p className="text-gray-400 font-medium">No categories available</p>
      <p className="text-sm text-gray-600 mt-1">Create your first category to get started</p>
    </div>
  ) : (
    <div className="grid gap-4">
      {categories.map((category) => (
        <section 
          key={category.id}
          className="bg-gray-850 rounded-xl shadow-lg overflow-hidden"
        >
          <header className="bg-gradient-to-r from-sky-900/50 to-sky-800/30 px-5 py-3">
            <h3 className="text-lg font-semibold text-sky-300 tracking-wide">
              {category.name}
            </h3>
          </header>
          
          <div className="p-4">
            {category.subcategories?.length ? (
              <ul className="divide-y divide-gray-700/50">
                {category.subcategories.map((subcat) => (
                  <li
                    key={subcat.id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-gray-800/30 transition-colors"
                  >
                    <span className="text-gray-200 font-medium">{subcat.name}</span>
                    <button
                      onClick={() => handleDeleteSubcategory(category.id, subcat)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-md hover:bg-red-900/20"
                      title="Delete subcategory"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No subcategories in this category
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )}
</div>


      </div>
    </div>
  );
};

export default CategorySettingsAddSubcategory;
