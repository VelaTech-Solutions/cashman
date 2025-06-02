import React, { useState, useEffect } from "react";
// Mui Imports
import { 
  Box, 
  Select, 
  TextField, 
  Button, 
  MenuItem, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  CircularProgress, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  DataGrid,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
import { loadCategories, loadSubcategories, addSubcategory, deleteSubcategory } from "components/Common"; // assuming the modular functions are in the Common folder
export default function AddSubcategorySettings() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [rowModesModel, setRowModesModel] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    setCategoryName([])
    setNewSubcategoryName("");
    // Refresh subcategories after adding a new one
    const subcategoriesData = await loadSubcategories(selectedCategoryId);
    setSubcategories(subcategoriesData);
    alert("Subcategory Saved");
  };

  // Delete subcategory
  const handleDeleteSubcategory = async () => {
    if (!window.confirm("Delete this Subcategory?")) return;
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
      alert("Subcategory Deleted")
    };

    const rows = subcategories.map((subcat) => ({
      id: subcat.id,
      name: subcat.name,
    }));

    const columns = [
      { field: "name",  type:"" , headerName: "Subcategory", flex: 1 },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: (params) => {
          return [
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={async () => {
                const subcat = subcategories.find((s) => s.id === params.id);
                if (subcat && window.confirm("Delete this Subcategory?")) {
                  await deleteSubcategory(selectedCategoryId, subcat.id);
                  const updatedSubcategories = await loadSubcategories(selectedCategoryId);
                  setSubcategories(updatedSubcategories);
                  alert("Subcategory Deleted");
                }
              }}

            />
          ];
        },
      },
    ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Manage Subcategories
      </Typography> */}
      <Stack spacing={2} >
        <Select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          fullWidth
          displayEmpty
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
          renderValue={(selected) => {
            const cat = categories.find((c) => c.id === selected);
            return cat ? cat.name : "Select Category";
          }}
        >
          {categories.map((category) => (
            <MenuItem key={category.name} value={category.id} >{category.name}</MenuItem>
          ))}
        </Select>
        <TextField
          disabled={!selectedCategoryId.trim()}
          label="New Subcategory"
          value={newSubcategoryName}
          onChange={(e) => setNewSubcategoryName(e.target.value)}
          fullWidth
          sx={{
            mb: 2,
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
        />
        <Button
          disabled={!newSubcategoryName.trim()}
          onClick={handleAddSubcategory}
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{
            mb: 2,
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
        >
          Add Subcategory
        </Button>
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              rowModesModel={rowModesModel}
              onSelectionModelChange={(ids) => setSelectedRows(new Set(ids))}
              sx={{ height: 500,width: "100%"  }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};