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

// Nested Components
import AddCategorySettings from "./Views/AddCategorySettings"; 
import AddSubcategorySettings from "./Views/AddSubcategorySettings";
export default function CategorySettingsPage() {
  const [activeTable, setActiveTable] = useState("addCategorySettings");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Category Settings
      </Typography> */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "addCategorySettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("addCategorySettings")}
          >
            Add Category
          </Button>
          <Button 
            variant={activeTable === "addSubcategorySettings" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("addSubcategorySettings")}
          >
            Add Subcategory
          </Button>
        </Stack>
        {activeTable === "addCategorySettings" && <AddCategorySettings />}
        {activeTable === "addSubcategorySettings" && <AddSubcategorySettings />}
      </Stack>
    </Box>
  );
};