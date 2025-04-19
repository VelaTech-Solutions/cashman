// src/pages/CategorySettingsAddCategory.js

import React, { useEffect, useState } from "react";
import { loadCategories, addCategory, deleteCategory } from "components/Common";
import { Button } from "components/Common"; // use your modular Button

const CategorySettingsAddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const cats = await loadCategories();
    setCategories(cats);
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    await addCategory(newCategory);
    setNewCategory("");
    fetchCategories();
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>

      {/* Add Category Section */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Category Name</label>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
          placeholder="Enter new category"
        />
        <Button
          onClick={handleAddCategory}
          text="Add Category"
          small
          className="bg-blue-500 hover:bg-blue-600 mt-3"
          disabled={!newCategory.trim()}
        />
      </div>

      {/* List of Categories */}
      <div>
        <h4 className="text-md font-semibold mb-2">Existing Categories</h4>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-gray-800 px-4 py-2 rounded flex justify-between items-center"
              >
                <span>{cat.name}</span>
                <Button
                  text="Delete"
                  small
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="bg-red-500 hover:bg-red-600"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySettingsAddCategory;
