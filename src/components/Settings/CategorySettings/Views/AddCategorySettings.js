import React, { useState, useEffect } from "react";
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { loadCategories, addCategory, deleteCategory } from "components/Common";

export default function AddCategorySettings() {
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
    alert("Category Saved");
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    alert("Category Deleted");
  };

  useEffect(() => {
    fetchCategories();
  },[]); 

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Manage Categories
      </Typography> */}
      <Stack spacing={2}>
        <TextField
          label="Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          fullWidth
          sx={{
            mb: 2,
            color: "white",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
        />
        <Button
          disabled={!newCategory.trim()}
          onClick={handleAddCategory}
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{ mb: 2 }}
        >
          Add Category
        </Button>
        {/* List of Categories */}
        <Box>
          {categories.length > 0 ? (
            <Stack spacing={1}>
              {categories.map((cat) => (
                <Paper
                  key={cat.id}
                  sx={{
                    border: '1px solid',
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{cat.name}</Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(cat.id)}
                  >
                    Delete
                  </Button>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography>No categories found.</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
};