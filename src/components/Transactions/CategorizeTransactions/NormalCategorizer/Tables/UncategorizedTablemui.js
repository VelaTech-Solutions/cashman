import React, { useState, useMemo, useEffect } from "react";

import { doc, setDoc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Compon
import { 
  LoadClientData, 
  CategoryColor, 
  Loader,
  loadCategories, 
  loadSubcategories,
  loadTransactionDatebase } from "components/Common";
import { addTransactionDatabase } from "components/Common";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Stack,
  List,
  ListItemText
} from "@mui/material";
import { Select, MenuItem, InputLabel, FormControl, LinearProgress, Button, } from '@mui/material';
const UncategorizedTablemui = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [groupBy, setGroupBy] = useState("category");
  const [currentTab, setCurrentTab] = useState("table1");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 12;

  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [transactionDb, setTransactionDb] = useState([]);

  // Fetch client data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LoadClientData(clientId);
        if (!data) {
          setError("Client not found.");
        } else {
          setClientData(data);
          setBankName(data.bankName);

          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        }
      } catch (err) {
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // load transaction database
  useEffect(() => {
    const fetchTransactionDb = async () => {
      try {
        const transactionsData = await loadTransactionDatebase(bankName);
        setTransactionDb(transactionsData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
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

  const checkPotentialMatches = () => {
    const potentialMatches = transactions.filter((txn) =>
      transactionDb.some((dbTxn) => dbTxn.description === txn.description)
    );
    return potentialMatches;
  };
  

  // Filter by Uncategorized Transactions
  const filterUncategorizedTransactions = (transactions) =>{
    return transactions.filter(txn => {
      return !txn.category || !txn.subcategory;
    });
  };

  const uncategorizedTransactions = filterUncategorizedTransactions(transactions);

  // Group and flatten transactions
  const groupedAndFlattened = useMemo(() => {
    const grouped = uncategorizedTransactions.reduce((acc, txn) => {
      const key = groupBy === "description"
        ? txn.description || "No Description"
        : txn.category || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {});

    let flat = [];
    Object.entries(grouped).forEach(([groupKey, txns]) => {
      flat.push({ isHeader: true, groupKey });
      flat.push(...txns);
    });

    return flat;
  }, [uncategorizedTransactions, groupBy]);

  // Pagination
  const totalPages = Math.ceil(groupedAndFlattened.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = groupedAndFlattened.slice(startIndex, startIndex + rowsPerPage);

  // Calculate progress
  const categorizedCount = transactions.filter(transaction => transaction.category).length;
  const totalTransactions = transactions.length;
  const progress = (categorizedCount / totalTransactions) * 100;
  const [categoryTotals, setCategoryTotals] = useState({});

  useEffect(() => {
    const totals = {};
  
    transactions.forEach(({ category, credit_amount, debit_amount }) => {
      if (category) {
        // Ensure that credit_amount and debit_amount are valid numbers before adding
        const credit = isNaN(credit_amount) ? 0 : parseFloat(credit_amount);
        const debit = isNaN(debit_amount) ? 0 : parseFloat(debit_amount);
  
        const amount = credit + debit;
  
        totals[category] = (totals[category] || 0) + amount;
      }
    });
  
    console.log(totals);  // Check the totals before formatting
  
    const formattedTotals = Object.keys(totals).reduce((acc, key) => {
      const total = totals[key];
      // Only add to acc if total is a valid number
      if (!isNaN(total)) {
        acc[key] = total.toFixed(2);  // Ensure it's a number and format
      }
      return acc;
    }, {});
  
    console.log(formattedTotals);  // Check the formatted totals
    setCategoryTotals(formattedTotals);
  }, [transactions]);
  
  // my oldway
  const handleCheckboxChange = (uid) => {
    if (!uid) return;
    setSelectedTransactions(prev => {
      const newSelected = prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid];
      
      // Full transaction objects
      const selectedObjects = currentItems.filter(item => newSelected.includes(item.uid));
      console.log("Selected Transactions (full):", selectedObjects);
      
      return newSelected;
    });
  };
  

  const [selectedRows, setSelectedRows] = useState([]);
  const handleSelectionChange = (newSelection) => {
    setSelectedRows(Array.isArray(newSelection) ? newSelection : Array.from(newSelection));
  };
  
  const handleCategorizeClick = async () => {
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
      const updated = transactions.map(txn => {
        if (selectedTransactions.includes(txn.uid)) {
          return { ...txn, category: payload.category, subcategory: payload.subcategory };
        }
        return txn;
      });
      setTransactions(updated);
  
      // 3. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });
  
      console.log("Updated selected transactions with:", payload);
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };

  const handleClearCategorized = async () => {
    try {
      const updated = transactions.map(txn => ({
        ...txn,
        category: "",
        subcategory: ""
      }));

      setTransactions(updated);

      // 3. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });

      console.log("Reset all Cat and Subcat");
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };

  // Custom select input styles for Select Cat and Subcat
  const selectSx = {
    backgroundColor: '#333', // Dark background for the select input
    color: 'white', // White text color
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, // Darker border for the input outline
    '&:hover': { backgroundColor: '#444' }, // Darker background on hover
    '&.Mui-focused': { backgroundColor: '#444', borderColor: '#6cace4' }, // Focused state: dark background with a light blue border
  };
 
  const columns = [
    { field: "date1", headerName: "Date", width: 150 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "description2", headerName: "Description2", width: 250 },
    { field: "credit_amount", headerName: "Credit", width: 120 },
    { field: "debit_amount", headerName: "Debit", width: 120 },
    { field: "balance_amount", headerName: "Balance", width: 120 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "subcategory", headerName: "Subcategory", width: 150 },
  ];
  
  const rows = uncategorizedTransactions.map((txn) => ({
    id: txn.uid,
    date1: txn.date,
    description: txn.description,
    description2: txn.description2,
    credit_amount: txn.credit_amount,
    debit_amount: txn.debit_amount,
    balance_amount: txn.balance_amount,
    category: txn.category,
    subcategory: txn.subcategory,
  }));
  
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
      <span className="text-sm text-gray-400">
        {groupedAndFlattened.length} transactions, {checkPotentialMatches().length} potential matches , {Math.round(progress)}% Categorized
      </span>

      {/* Selection and Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #374151", // gray-700
          mb: 2,
          pb: 1,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" mt={2}>
          {/* Category Select */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                setCategory(selectedCategoryId);
                const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
                setSubcategory("");
              }}
              sx={selectSx}
            >
              <MenuItem value="">Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subcategory Select */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'white' }}>Subcategory</InputLabel>
            <Select
              label="Subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              sx={selectSx}
            >
              <MenuItem value="">Subcategory</MenuItem>
              {subcategories.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Categorize Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCategorizeClick}
            // disabled={selectedTransactions.length === 0}
            startIcon={<span>📂</span>}
          >
            Categorize MUI
          </Button>
          {/* Match All Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            //onClick={}
            startIcon={<span>📂</span>}
          >
            Match All
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleClearCategorized}
            startIcon={<span>📂</span>}
          >
            Clear All
          </Button>
        </Stack>
      </Box>



      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: '12px',           // Custom height for better visibility
          borderRadius: '4px',      // Rounded edges
          my: 2                     // Vertical margin (theme spacing)
        }}
      />
      
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          // onRowSelectionModelChange={(newSelection) => { // dont know how to link this with the handleCheckboxChange
          //   setSelectedRows(newSelection.ids);  // Update selected rows
          // }}
          // rowSelectionModel={selectedRows}  // Control row selection via state
          showToolbar
        />
      </div>
      {/* Category Totals */}
      <List dense sx={{ width: 200 }}>
        {Object.entries(categoryTotals)
          .filter(([_, total]) => !isNaN(total) && total !== 0)
          .map(([name, total]) => (
            <ListItemText 
              key={name} 
              primary={`${name}: ${total}`} 
              primaryTypographyProps={{ fontSize: 14 }}
            />
          ))}
      </List>
    </div>
  );
};

export default UncategorizedTablemui;

