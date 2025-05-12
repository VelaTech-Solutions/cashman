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
  Chip,
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


  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedTransactions, setSelectedTransactions] = useState([]);
  //console.log("Transactions", selectedTransactions)
  const [selectedCategory, setSelectedCategory] = useState('');
  //console.log("Cat", selectedCategory)
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  //console.log("SubCat", selectedSubcategory)
  const [selectedRows, setSelectedRows] = useState([]);



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

  // Match function
  function findBestMatch(transaction, transactionDb) {
    const desc = transaction.description?.toLowerCase().trim();
    if (!desc) return { mcategory: "", msubcategory: "" };

    for (const past of transactionDb) {
      const pastDesc = past.description?.toLowerCase().trim();
      if (pastDesc && desc === pastDesc && past.category && past.subcategory) {
        return { mcategory: past.category, msubcategory: past.subcategory };
      }
    }

    return { mcategory: "", msubcategory: "" };
  }

  // Filter uncategorized
  const filterUncategorizedTransactions = (transactions) =>
    transactions.filter(txn => !txn.category || !txn.subcategory);

  // Compute rows with matches
  const uncategorizedTransactions = filterUncategorizedTransactions(transactions);
  const rows = uncategorizedTransactions.map((tx, index) => {
    const match = findBestMatch(tx, transactionDb);
    return {
      ...tx,
      id: tx.uid || index,
      mcategory: match.mcategory,
      msubcategory: match.msubcategory,
    };
  });

  const columns = [
    { field: "date1", headerName: "Date 1", width: 120, },
    { field: "date2", headerName: "Date 2", width: 120, },
    { field: "description", type: "string", headerName: "Description", width: 400, },
    { field: "description2", type: "string", headerName: "Description +", width: 300, },
    { field: "credit_amount", type: "number", headerName: "Credit Amount", width: 130, },
    { field: "debit_amount", type: "number", headerName: "Debit Amount", width: 130, },
    { field: "balance_amount", type: "number", headerName: "Balance Amount", width: 130, },
    { field: "category", type: "string", id: "category", headerName: "Category", width: 100, },
    { field: "subcategory", type: "string", id: "subcategory", headerName: "Subcategory", width: 100, },
    // Matchs
    { field: "mcategory", type: "string", id: "mcategory", headerName: "Matching Category", width: 100, },
    { field: "msubcategory", type: "string", id: "msubcategory", headerName: "Matching Subcategory", width: 100, },
  ];


  const handleSaveClick = async () => {
    const selectedTxns = transactions.filter(txn => selectedTransactions.includes(txn.uid));
    if (selectedTxns.length === 0) return;
  
    // Get category and subcategory names from selected ID
    const selectedCategory = categories.find(cat => cat.id === category);
    const selectedSubcategory = subcategories.find(sub => sub.id === subcategory);
  
    const payload = {
      category: selectedCategory ? selectedCategory.name : "",  // Use name instead of id
      subcategory: selectedSubcategory ? selectedSubcategory.name : "",  // Use name instead of id
      description: selectedTxns[0].description || "",
      createdAt: new Date().toISOString(),
    };
  
    try {
      // 1. Add to transaction database
      await addTransactionDatabase(bankName, payload);
  
      // 2. Update client data locally
      // can we if the same transaction exsits then just mark it as well with the same cat and subcat
      const updated = transactions.map(txn => {
        if (selectedTransactions.includes(txn.uid)) {
          return { ...txn, category: payload.category, subcategory: payload.subcategory };
        }
        return txn;
      });
      setTransactions(updated);
  
      // 3. Update transactionDb (local or fetch from Firestore)
      setTransactionDb(updated); // Ensure transactionDb is updated
  
      // 4. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });

      // Reload metrics after updating transactions
      // reloadMetrics();
      
      // 5. Calculate % categorized and update client document
      const total = updated.length;
      const categorizedCount = updated.filter(txn => txn.category && txn.subcategory).length;
      const percentage = Math.round((categorizedCount / total) * 100);

      await updateDoc(doc(db, "clients", clientId), {
        categorized: percentage,
      });


      console.log("Updated selected transactions with:", payload);
      
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };

  // Calculate progress
  const categorizedCount = transactions.filter(transaction => transaction.category).length;
  const totalTransactions = transactions.length;
  const progress = (categorizedCount / totalTransactions) * 100;

  // Calculate category totals
  const categoryTotals = {};
  transactions.forEach(txn => {
    const category = txn.category;
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += parseFloat(txn.debit_amount) || parseFloat(txn.credit_debit_amount) || 0;
  });



  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  const selectSx = {
    backgroundColor: '#333', // Dark background for the select input
    color: 'white', // White text color
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, // Darker border for the input outline
    '&:hover': { backgroundColor: '#444' }, // Darker background on hover
    '&.Mui-focused': { backgroundColor: '#444', borderColor: '#6cace4' }, // Focused state: dark background with a light blue border
  };

const metricsSx = {
  backgroundColor: "#424242",
  color: 'white',
};

  return (
    <div>
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {/* <Grid item xs={12}>
          <Typography variant="h6"> Uncategorized Transactions</Typography>
        </Grid> */}

<Grid item xs={12}>
  <Stack spacing={1}>
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      <Chip label={`Categorized: % ${Math.round(progress)}`} size="small" sx={metricsSx} />
      <Chip label={`Uncategorized: ${uncategorizedTransactions.length}/${transactions.length}`} size="small" sx={metricsSx} />
      <Chip label={`Total: ${transactions.length}`} size="small" sx={metricsSx} />
    </Stack>
      <Divider sx={{ borderColor: "#555" }} />
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      <Chip label={`Matching: ${categorizedCount}`} size="small" sx={metricsSx} />
    </Stack>
      <Divider sx={{ borderColor: "#555" }} />
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {Object.entries(categoryTotals)
        .filter(([_, total]) => !isNaN(total) && total !== 0)
        .map(([name, total]) => (
          <Chip
            key={name}
            label={`${name}: ${total}`}
            size="small"
            sx={metricsSx}
          />
        ))}
    </Stack>
  </Stack>
</Grid>

        <Box sx={{ display: "flex", justifyContent: "flex", alignItems: "center", width: "100%", gap: 1 }}>
        {/* Category Selection */}
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
        {/* Subcategory Selection */}
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
          onClick={handleSaveClick}
        >
          Categorize
        </Button>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 4,
            backgroundColor: '#333',
            '& .MuiLinearProgress-bar': { backgroundColor: '#90caf9' }
          }}
        />
      </Box>




        <Grid size={12}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(selectionModel) => {
            const ids = Array.from(selectionModel?.ids || []);
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
