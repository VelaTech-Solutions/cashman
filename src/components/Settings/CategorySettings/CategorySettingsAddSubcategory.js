import React, { useEffect, useState } from "react";
import Sidebar from "components/Sidebar";
import { db } from "../../../firebase/firebase";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

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
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Existing Subcategories</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-lg font-bold text-blue-300">{category.name}</p>
                <ul className="mt-2">
                  {(category.subcategories || []).map((subcat) => (
                    <li
                      key={subcat.id}
                      className="text-gray-300 flex justify-between items-center py-1"
                    >
                      <span>{subcat.name}</span>
                      <button
                        onClick={() => handleDeleteSubcategory(category.id, subcat)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsAddSubcategory;
