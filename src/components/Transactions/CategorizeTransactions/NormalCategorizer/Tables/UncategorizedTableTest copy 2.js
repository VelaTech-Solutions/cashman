import React, { useState, useMemo, useEffect } from "react";

import { doc, setDoc, getDoc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Compon
import { 
  LoadClientData, 
  CategoryColor, 
  Loader,
  loadCategories, 
  loadSubcategories,
  loadTransactionDatebase,
  addTransactionDatabase,
  deleteTransactionDatabase,
  BulkDeleteTransactionDatabase,
  clearTransactionDatabase  
} from "components/Common";
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
} from "@mui/x-data-grid";
// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Grid,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Container,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputLabel, 
  // FormControl, 
  LinearProgress,   
  InputAdornment,  
  Checkbox, 
  TextField, 
  CircularProgress,
  rowModesModel ,
  FormControlLabel,
  Switch 
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';

const UncategorizedTableTest = ({ clientId }) => {
  const [clientData, setClientData] = useState({});
  const [bankName, setBankName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionDb, setTransactionDb] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = React.useState([
    {
      field: 'description',
      sort: 'asc',
    },
  ]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  // console.log("Transactions", selectedTransactions)


  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);



  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setBankName(clientData.bankName || "Unknown");
        setTransactions(clientData.transactions || []);

      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  // load transaction database
  useEffect(() => {
    if (!bankName) return;
    const fetchTransactionDb = async () => {
      setLoading(true);
      try {
        const transactionsData = await loadTransactionDatebase(bankName);
        setTransactionDb(transactionsData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionDb();
  }, [bankName]);

  // Load categories once on mount
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await loadCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!category) return;
      const subs = await loadSubcategories(category);
      setSubcategories(subs);
    };
    fetchSubs();
  }, [category]);


  const rows = transactions.map((tx, index) => ({
    id: tx.uid || index,
    ...tx,
  }));

  const columns = [
    {
      field: "date1",
      headerName: "Date 1",
      width: 120,
    },
    {
      field: "date2",
      headerName: "Date 2",
      width: 120,
    },
    {
      field: "description",
      type: "string",
      headerName: "Description",
      width: 400,
    },
    {
      field: "description2",
      type: "string",
      headerName: "Description +",
      width: 300,
    },
    {
      field: "credit_amount",
      type: "number",
      headerName: "Credit Amount",
      width: 130,
    },
    {
      field: "debit_amount",
      type: "number",
      headerName: "Debit Amount",
      width: 130,
    },
    {
      field: "balance_amount",
      type: "number",
      headerName: "Balance Amount",
      width: 130,
    },
    {
      field: "category",
      type: "string",
      id: "category",
      headerName: "Category",
      width: 100,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "subcategory",
      type: "string",
      id: "subcategory",
      headerName: "Subcategory",
      width: 100,
      editable: (params) => params.row.id === editingRowId,
    },
  ];


const handleSaveClick = async () => {
  if (!selectedCategory || !selectedSubcategory || selectedRows.length === 0) return;

  const updates = [];
  const clientTransactionMap = {};

  // Loop through selectedRows, which contains selected row IDs
  for (const rowIndex of selectedRows) {
    const tx = transactions[rowIndex];
    const { id, bankName, clientId, description } = tx;
    if (!id || !bankName || !clientId) continue;

    // Save to transaction_database
    const transactionRef = doc(
      db,
      "transaction_database",
      bankName,
      "transactions",
      id
    );
    const data = {
      category: selectedCategory,
      subcategory: selectedSubcategory,
      description: description || "",
      createdAt: new Date().toISOString(),
    };
    updates.push(setDoc(transactionRef, data, { merge: true }));

    // Group for clientdata update
    if (!clientTransactionMap[clientId]) {
      clientTransactionMap[clientId] = [];
    }
    clientTransactionMap[clientId].push(id);
  }

  // Update clientdata per client in one go
  for (const clientId in clientTransactionMap) {
    const ids = clientTransactionMap[clientId];
    for (const txId of ids) {
      const clientRef = doc(db, "clientdata", clientId, "transactions", txId);
      updates.push(updateDoc(clientRef, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
      }));
    }
  }

  await Promise.all(updates);
  setSelectedRows([]);  // Clear the selection after saving
  console.log("Saved all selected transactions.");
};
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <Grid container spacing={2} sx={{ mt: 4 }}>
      <Grid item xs={12}>
        <Typography variant="h6"> Uncategorized Transactions</Typography>
        {/* list transaction selected handleRowSelectionModelChange*/}
        <List>
          {selectedTransactions.map((id) => (
            <ListItem key={id}>
              <ListItemText primary={id} />
            </ListItem>
          ))}
        </List>
      </Grid>
              <Grid item xs={12}>
      
                <Box sx={{ display: "flex", justifyContent: "flex", alignItems: "center", width: "100%", gap: 1 }}>
                  {/* Category and Subcategory Selection */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => {
                      const selectedCategoryId = e.target.value;
                      setCategory(selectedCategoryId);
                      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                      setSelectedCategory(selectedCategory?.name || "");
                    }}
                    sx={selectSx}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
      
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: 'white' }}>Subcategory</InputLabel>
                  <Select
                    label="Subcategory"
                    value={subcategory}
                    onChange={(e) => {
                      const selectedSubcategoryId = e.target.value;
                      setSubcategory(selectedSubcategoryId);
                      const selectedSub = subcategories.find(sub => sub.id === selectedSubcategoryId);
                      setSelectedSubcategory(selectedSub?.name || "");
                    }}
                    sx={selectSx}
                  >
                    {subcategories.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
      
                <Button
                  variant="contained"
                  onClick={handleCategorizeClick}
                  disabled={!category || !subcategory || selectedTransactions.length === 0}
                >
                  Categorize
                </Button>
              </Box>
            </Grid>
      
      <Grid item xs={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(selectionModel) => {
            const ids = Array.from(selectionModel?.ids || []);
            console.log("Selected IDs:", ids);
            setSelectedTransactions(ids);
          }}
          sortModel={sortModel}
          pageSizeOptions={[20, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
          }}
          sx={{
            height: 690,
            width: "100%",
            overflow: "auto",
          }}
        />
      </Grid>
    </Grid>
  </div>
  );
};

export default UncategorizedTableTest;
