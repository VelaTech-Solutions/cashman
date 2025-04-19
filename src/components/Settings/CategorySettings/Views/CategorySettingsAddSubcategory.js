import React, { useEffect, useState } from "react";
import { loadCategories, loadSubcategories, addSubcategory, deleteSubcategory } from "components/Common"; // assuming the modular functions are in the Common folder
import { Button } from 'components/Common'; // Button component

const CategorySettingsAddSubcategory = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const categoriesData = await loadCategories();
      setCategories(categoriesData);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubcategories = async () => {
        setLoading(true);
        const subcategoriesData = await loadSubcategories(selectedCategoryId);
        setSubcategories(subcategoriesData);
        setLoading(false);
      };
      fetchSubcategories();
    }
  }, [selectedCategoryId]);

  // Handle row selection (checkbox toggle)
  const handleToggleRow = (index) => {
    setSelectedRows((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  // Add subcategory
  const handleAddSubcategory = async () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) {
      alert("Please select a category and enter a subcategory name.");
      return;
    }
    await addSubcategory(selectedCategoryId, newSubcategoryName);
    setNewSubcategoryName("");
    // Refresh subcategories after adding a new one
    const subcategoriesData = await loadSubcategories(selectedCategoryId);
    setSubcategories(subcategoriesData);
  };

  // Delete subcategory
  const handleDeleteSubcategory = async () => {
    // Get the subcategory IDs of the selected rows
    const subcategoryIdsToDelete = subcategories
      .filter((_, index) => selectedRows.has(index)) // Get subcategories where the checkbox is selected
      .map(subcat => subcat.id); // Extract the ID of each subcategory

    // If no subcategory IDs are selected, exit
    if (subcategoryIdsToDelete.length === 0) {
      console.log("No subcategories selected for deletion.");
      return;
    }

    // Call deleteSubcategory for each subcategory
    for (const subcategoryId of subcategoryIdsToDelete) {
      await deleteSubcategory(selectedCategoryId, subcategoryId);
    }

    // Refresh subcategories after deletion
    const subcategoriesData = await loadSubcategories(selectedCategoryId);
    setSubcategories(subcategoriesData);
    setSelectedRows(new Set());
  };


  return (
    <div className="p-4 bg-gray-900 rounded-md shadow text-white">
      <h3 className="text-lg font-semibold mb-4">Manage Subcategories</h3>

      {/* Select Category Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Select Category</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        >
          <option value="">Select a Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Subcategory Section */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Subcategory Name</label>
        <input
          type="text"
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
          placeholder="Enter new subcategory"
        />
      </div>

      <Button
        onClick={handleAddSubcategory}
        text="Add Subcategory"
        small
        className="bg-green-500 hover:bg-green-600 mb-4 mr-2"
        disabled={!selectedCategoryId || !newSubcategoryName}
      />

      {/* Delete Selected Subcategories */}
      <Button
        onClick={handleDeleteSubcategory}
        text="Delete Selected"
        small
        className="bg-red-500 hover:bg-red-600 mb-4"
        disabled={selectedRows.size === 0 || !selectedCategoryId}
      />

      {/* Subcategory Table Section */}
      <div className="max-h-[500px] overflow-y-auto border border-gray-700 rounded-lg p-2 mb-4">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 border border-gray-600 text-left w-[60px]">Select</th>
              <th className="p-2 border border-gray-600 text-left">Subcategory Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="text-center p-4">Loading...</td>
              </tr>
            ) : subcategories.length > 0 ? (
              subcategories.map((subcat, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleToggleRow(index)}
                    />
                  </td>
                  <td className="p-2">{subcat.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center p-4">No subcategories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategorySettingsAddSubcategory;
