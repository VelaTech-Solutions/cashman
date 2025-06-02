import React, { useState, useEffect } from "react";


// Firebase Imports
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Common Components Import
import { loadCategories, loadSubcategories } from "components/Common";

// MUI Imports
import { 
  Grid, 
  Box, 
  Chip, 
  Divider,
  Stack,
  CircularProgress, 
  InputAdornment, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Checkbox, 
  TextField, 
  Paper,
  Table,
  Tabs,
  Tab,

  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableContainer,
  FormControlLabel,
  Switch
} from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";


// settings cat  and subcat excel row placement


export default function CategoryCellPlacement() {
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryEnabled, setCategoryEnabled] = useState(false);
  const [subCategoryEnabled, setSubCategoryEnabled] = useState(false);
  const [categoryPlacements, setCategoryPlacements] = useState([]);
  const [subCategoryPlacements, setSubCategoryPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(new Set());
  const [rowModesModel, setRowModesModel] = useState({});
  const [newCell, setNewCell] = useState("");
  const [subCellInputs, setSubCellInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const configDoc = () => doc(db, "settings", "budget", "config", "main");

  useEffect(() => {
    const fetchConfig = async () => {
      const ref = configDoc();
      const snap = await getDoc(ref);
      if (snap.exists()) {
          const data = snap.data();
          setCategoryEnabled(data.categoryEnabled ?? false);
          setSubCategoryPlacements(data.subCategoryPlacements || {});
      }
    };
    fetchConfig();
  }, []);
  
  
  // Load categories and subcategories
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);  // default to first category
      }
    };
    fetchCats();
  }, []);


  // Load subcategories when category changes
  useEffect(() => {
      const fetchSubs = async () => {
          if (!selectedCategory) return;
          const subs = await loadSubcategories(selectedCategory);
          setSubcategories(subs);
      };
      fetchSubs();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchPlacements = async () => {
      const ref = configDoc();
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
          const data = snap.data();
          const updates = {};
  
          if (!("categoryEnabled" in data)) updates.categoryEnabled = false;
          if (!("subCategoryEnabled" in data)) updates.subCategoryEnabled = false;
          if (!("categoryPlacements" in data)) updates.categoryPlacements = [];
          if (!("subCategoryPlacements" in data)) updates.subCategoryPlacements = [];
  
          // Update document with any missing fields
          if (Object.keys(updates).length > 0) {
          await setDoc(ref, updates, { merge: true });
          }
  
          setCategoryEnabled(data.categoryEnabled ?? false);
          setSubCategoryEnabled(data.subCategoryEnabled ?? false);
          setCategoryPlacements(data.categoryPlacements || []);
          setSubCategoryPlacements(data.subCategoryPlacements || []);
      } else {
          const defaultData = {
          categoryEnabled: false,
          subCategoryEnabled: false,
          categoryPlacements: [],
          subCategoryPlacements: [],
          };
          await setDoc(ref, defaultData);
          setCategoryEnabled(defaultData.categoryEnabled);
          setSubCategoryEnabled(defaultData.subCategoryEnabled);
          setCategoryPlacements(defaultData.categoryPlacements);
          setSubCategoryPlacements(defaultData.subCategoryPlacements);
      }
  
      setSelectedPlacement(new Set());
      };
  
    fetchPlacements();
  }, []);

  // Handle category tab change
  const handleTabChange = (e, newId) => {
    setSelectedCategory(newId);  // use newId directly
    setSubcategory("");
    const cat = categories.find(c => c.id === newId);
    setCategory(cat?.name || "");
  };


  const processRowUpdate = (newRow) => {
    const updated = [...categoryPlacements];
    updated[newRow.id] = { subcategory: newRow.cell, row: newRow.row };
    setCategoryPlacements(updated);
    return newRow;
  };
  // Add new row placement
  const handleAddPlacement = async () => {
    if (subcategory && newCell.trim()) {
      const updated = [...subCategoryPlacements, { subcategory, row: newCell.trim() }];
      setSubCategoryPlacements(updated);
      setNewCell("");

      const ref = configDoc();
      await updateDoc(ref, { subCategoryPlacements: updated });
    }
  };

  // const rows = subCategoryPlacements.map((item, index) => ({
  //   id: index,
  //   subcategory: item.subcategory,
  //   row: item.row,
  // }));

  const filteredRows = subCategoryPlacements
    .filter(item => subcategories.some(sub => sub.name === item.subcategory))
    .map((item, index) => ({
      id: index,
      subcategory: item.subcategory,
      row: item.row,
    }));

  const columns = [
    { field: "subcategory", headerName: "Subcategory", flex: 1 },
    { field: "row", headerName: "Row", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 1,
      getActions: (params) => [
      <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={async () => {
            const updated = subCategoryPlacements.filter((_, i) => i !== params.id);
            setSubCategoryPlacements(updated);
            try {
              await updateDoc(configDoc(), {
                subCategoryPlacements: updated,
              });
            } catch (err) {
              setError("Failed to delete row");
              console.error(err);
            }
          }}

      />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Category Cell Placement Settings</Typography>

        <Tabs
          value={selectedCategory}
          onChange={handleTabChange}
        >
          {categories.map((cat) => (
            <Tab
              key={cat.id}
              label={cat.name}
              value={cat.id}
            />
          ))}
        </Tabs>

        {/* Category Details and Cell Placement */}
        {selectedCategory && (
          <Box>
            <Typography variant="h6">
              {categories.find(c => c.id === selectedCategory)?.name || ""}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                fullWidth
                variant="outlined"
                displayEmpty
                size="small"
                renderValue={(selected) => selected || "Select Subcategory"}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
                  "& .MuiSvgIcon-root": { color: "white" },
                }}
              >
                {subcategories.map((sub) => (
                  <MenuItem key={sub.id} value={sub.name}>{sub.name}</MenuItem>
                ))}
              </Select>
              <TextField
                label="Row"
                value={newCell}
                onChange={(e) => setNewCell(e.target.value)}
                size="small"
              />
              <Button variant="contained" size="small" onClick={handleAddPlacement}>
                Add
              </Button>
            </Stack>
          </Box>
        )}
        {/* display when a selection from tab is made */}
        {/* display the selected subcat this is not displaying the correct thing */}
        {selectedCategory ? (
          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <DataGrid
                rows={filteredRows}
                columns={columns}
                editMode="row"
                getRowId={(row) => row.id}
                rowModesModel={rowModesModel}
                onRowModesModelChange={setRowModesModel}
                processRowUpdate={processRowUpdate}
                getRowClassName={(params) =>
                  params.id === Object.keys(rowModesModel)[0] ? "editing-row" : ""
                }
                sx={{ height: 400, width: "100%" }}
              />
            )}
          </Box>

        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Please select a category tab to view cell placements.
          </Typography>
        )}
        
      </Stack>
    </Box>
  );
};