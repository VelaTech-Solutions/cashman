import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const CategorySettingsAddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const links = [{ path: "javascript:void(0)", label: "Back", icon: "ph-arrow-left" }];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory,
      });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteDoc(doc(db, "categories", categoryId));
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Manage Categories</h1>

        {/* Add Category */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400">Add New Category</h2>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Name"
            className="w-full p-3 mt-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            onClick={handleAddCategory}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Add Category
          </button>
        </div>

        {/* List Categories */}
        <div>
          <h2 className="text-xl font-semibold text-blue-400">Existing Categories</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-blue-300">{cat.name}</p>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsAddCategory;
//             