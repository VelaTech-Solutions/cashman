import React, { useState, useEffect } from "react";

// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Select,
  MenuItem,
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
// Common Components Import
import { loadCategories, loadSubcategories } from "components/Common";
// Firebase Imports
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";


export default function BudgetRangeSettings() {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [categoryRange, setCategoryRange] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedRange, setSelectedRange] = useState(new Set());
    const [rowModesModel, setRowModesModel] = useState({});
    const [newRange, setNewRange] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const configDoc = () => doc(db, "settings", "budget", "config", "RangeSettings");

    useEffect(() => {
        const fetchConfig = async () => {
        const ref = configDoc();
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            setCategoryRange(data.categoryRange || {});
        }
        };
        fetchConfig();
    }, []);
    

    useEffect(() => {
        const fetchRange = async () => {
        const ref = configDoc();
        const snap = await getDoc(ref);
    
        if (snap.exists()) {
            const data = snap.data();
            const updates = {};
            if (!("categoryRange" in data)) updates.categoryRange = [];
  
    
            // Update document with any missing fields
            if (Object.keys(updates).length > 0) {
            await setDoc(ref, updates, { merge: true });
            }
            setCategoryRange(data.categoryRange || []);

        } else {
            const defaultData = {
            categoryRange: [],

            };
            await setDoc(ref, defaultData);
            setCategoryRange(defaultData.categoryRange);

        }
    
        setSelectedRange(new Set());
        };
    
        fetchRange();
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


const handleTabChange = (newId) => {
  setSelectedCategory(newId); 
  const cat = categories.find(c => c.id === newId);
  setCategory(cat?.name || "");
};

    
    const processRowUpdate = (newRow) => {
        const updated = [...categoryRange];
        updated[newRow.id] = { category: newRow.cell, range: newRow.range };
        setCategoryRange(updated);
        return newRow;
    };
    // Add new 
    const handleAddRange = async () => {
        if (category && newRange.trim()) {
        const updated = [...categoryRange, { category, range: newRange.trim() }];
        setCategoryRange(updated);
        setNewRange("");

        const ref = configDoc();
        await updateDoc(ref, { categoryRange: updated });
        }
    };




    const rows = categoryRange.map((item, index) => ({
      id: index,
      category: item.category,
      range: item.range,
    }));


    const columns = [
        {   field: "category", headerName: "Category", flex: 1 },
        {   field: "range", headerName: "Range %", type:"number", flex: 1 },
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
                        const updated = categoryRange.filter((_, i) => i !== params.id);
                        setCategoryRange(updated);
                        try {
                        await updateDoc(configDoc(), {
                            categoryRange: updated,
                        });
                        } catch (err) {
                        setError("Failed to delete range");
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
                    <Typography variant="h6">Category Range Settings</Typography>

                    <Box>       
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Select
                            // the .id of the cat is showing instead onthe .name
                                value={selectedCategory}
                                onChange={(e) => handleTabChange(e.target.value)}
                                fullWidth
                                variant="outlined"
                                size="small"
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
                                {categories.map((cat) => (
                                    <MenuItem 
                                        key={cat.id} 
                                        value={cat.id}
                                    >
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField
                                label="Range"
                                value={newRange}
                                onChange={(e) => setNewRange(e.target.value)}
                                size="small"
                                />
                            <Button variant="contained" size="small" onClick={handleAddRange}>
                                Add
                            </Button>
                        </Stack>
                    </Box>


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

                </Stack>
            </Box>
        );
    };
