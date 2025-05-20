import React, { useState, useEffect } from "react";


// Firebase Imports
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Common Components Import
import { loadCategories, loadSubcategories } from "components/Common";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
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
  Toolbar,
  ToolbarButton,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [cateoryPlacements, setCateoryPlacements] = useState([]);
  const [subCateoryPlacements, setSubCateoryPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(new Set());

  const [newCell, setNewCell] = useState("");
  const [subCellInputs, setSubCellInputs] = useState({});

  const configDoc = () => doc(db, "settings", "budget", "config", "main");




  useEffect(() => {
      const fetchConfig = async () => {
      const ref = configDoc();
      const snap = await getDoc(ref);
      if (snap.exists()) {
          const data = snap.data();
          setCategoryEnabled(data.categoryEnabled ?? false);
          setSubCateoryPlacements(data.subCateoryPlacements || {});
      }
      };
      fetchConfig();
  }, []);
  
  
  // Load categories and subcategories
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);


      // the is is also use to see the subcat,the id looks like this DPmGHKjrkDkaa6tQ5dFl = categoryId
      // the name looks like this Savings = category

      // lets load the data correctly and use it correctly
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
          if (!("cateoryPlacements" in data)) updates.cateoryPlacements = [];
          if (!("subCateoryPlacements" in data)) updates.subCateoryPlacements = [];
  
          // Update document with any missing fields
          if (Object.keys(updates).length > 0) {
          await setDoc(ref, updates, { merge: true });
          }
  
          setCategoryEnabled(data.categoryEnabled ?? false);
          setSubCategoryEnabled(data.subCategoryEnabled ?? false);
          setCateoryPlacements(data.cateoryPlacements || []);
          setSubCateoryPlacements(data.subCateoryPlacements || []);
      } else {
          const defaultData = {
          categoryEnabled: false,
          subCategoryEnabled: false,
          cateoryPlacements: [],
          subCateoryPlacements: [],
          };
          await setDoc(ref, defaultData);
          setCategoryEnabled(defaultData.categoryEnabled);
          setSubCategoryEnabled(defaultData.subCategoryEnabled);
          setCateoryPlacements(defaultData.cateoryPlacements);
          setSubCateoryPlacements(defaultData.subCateoryPlacements);
      }
  
      setSelectedPlacement(new Set());
      };
  
      fetchPlacements();
  }, []);

  // Handle category tab change
  const handleTabChange = (e, newId) => {
    const cat = categories.find(c => c.id === newId);
    setSelectedCategory(newId);      // still use for loading
    setCategory(cat?.name || "");    // used in saved placements
  };

  // Add new row placement
  const handleAddPlacement = async () => {
    if (newCell.trim()) {
      const updated = [...cateoryPlacements, { category: category, row: newCell.trim() }];
      setCateoryPlacements(updated);
      setNewCell("");

      const ref = configDoc();
      await updateDoc(ref, { cateoryPlacements: updated });
    }
  };


  return (
    <Box p={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Category Cell Placement Settings
      </Typography>

      <Tabs
        value={selectedCategory}
        onChange={handleTabChange}
        aria-label="category tabs"
        textColor="inherit"
        sx={{ color: "white" }}
      >
        {categories.map((cat) => (
          <Tab
            key={cat.id}
            label={cat.name}
            value={cat.id}
            sx={{ color: "white" }}
          />
        ))}
      </Tabs>

      {/* Category Details and Cell Placement */}
      {selectedCategory && (
        <Box  sx={{ bgcolor: "#1e1e1e", p: 1, mb: 1, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>
            {categories.find(c => c.id === selectedCategory)?.name || ""}
          </Typography>

          <Box mt={1} display="flex" alignItems="center" gap={1}>
            <TextField
              label="Cell"
              value={newCell}
              onChange={(e) => setNewCell(e.target.value)}
              size="small"
              sx={{
                width: 100,
                input: { color: "white" },
                label: { color: "white" }
              }}
            />
            <Button variant="contained" size="small" onClick={handleAddPlacement}>
              Add
            </Button>
          </Box>

          <Table size="small" sx={{ mt: 1, backgroundColor: "#1e1e1e", borderRadius: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "white", fontSize: 12 }}>Cell</TableCell>
                <TableCell sx={{ color: "white", fontSize: 12 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cateoryPlacements
                .filter((p) => p.category === category)
                .map((placement, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "white", fontSize: 13 }}>{placement.row}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        onClick={async () => {
                          const updated = cateoryPlacements.filter(
                            (p) => !(p.category === category && p.row === placement.row)
                          );
                          setCateoryPlacements(updated);
                          await updateDoc(configDoc(), { cateoryPlacements: updated });
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      )}


        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
        Subcategories → Excel Row Map
        </Typography>

        <Table size="small" sx={{ backgroundColor: "#1e1e1e", borderRadius: 1 }}>
        <TableHead>
            <TableRow>
            <TableCell sx={{ color: "white" }}>Subcategory</TableCell>
            <TableCell sx={{ color: "white" }}>Excel Row</TableCell>
            <TableCell sx={{ color: "white" }}>Mapped Row</TableCell>
            <TableCell />
            <TableCell />
            </TableRow>
        </TableHead>
        <TableBody>
            {subcategories.map((sub) => {
            const currentPlacement = subCateoryPlacements.find(p => p.subcategory === sub.name);
            return (
                <TableRow key={sub.id}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>{sub.name}</TableCell>
                <TableCell>
                    <TextField
                    size="small"
                    value={subCellInputs[sub.id] ?? ""}
                    onChange={(e) =>
                        setSubCellInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                    }
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 1
                    }}
                    InputProps={{ style: { color: "black" } }}
                    InputLabelProps={{ style: { color: "black" } }}
                    />

                </TableCell>
                <TableCell sx={{ color: "white" }}>
                    {currentPlacement?.row ?? "-"}
                </TableCell>
                <TableCell>
                    <Button
                    size="small"
                    variant="contained"
                    onClick={async () => {
                        const row = (subCellInputs[sub.id] || "").trim();
                        if (!row) return;
                        // can save the cat name too?
                        const filtered = subCateoryPlacements.filter(p => p.subcategory !== sub.name);
                        const categoryName = categories.find(c => c.id === selectedCategory)?.name || "";
                        const updated = [...filtered, { category: categoryName, subcategory: sub.name, row }];
                        setSubCateoryPlacements(updated);
                        setSubCellInputs((prev) => ({ ...prev, [sub.id]: "" }));
                        await updateDoc(configDoc(), { subCateoryPlacements: updated });
                    }}
                    >
                    {currentPlacement ? "Update" : "Add"}
                    </Button>
                </TableCell>
                <TableCell>
                    {currentPlacement && (
                    <IconButton
                        size="small"
                        sx={{ color: "white" }}
                        onClick={async () => {
                        const updated = subCateoryPlacements.filter(
                            (p) => !(p.subcategory === sub.name)
                        );
                        setSubCateoryPlacements(updated);
                        await updateDoc(configDoc(), { subCateoryPlacements: updated });
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                    )}
                </TableCell>
                </TableRow>
            );
            })}
        </TableBody>
        </Table>

    </Box>
  );
};