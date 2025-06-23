import React, { useState, useEffect } from "react";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";

// Compon
import { 
  LoadClientData, 
  loadCategories, 
  loadSubcategories,
  loadTransactionDatebase,
  addTransactionDatabase
} from "components/Common";

// MUI Imports
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Grid,
  Stack,
  Divider,
  InputLabel, 
  FormControl, 
  LinearProgress,
  CircularProgress,
  Switch 
} from "@mui/material";


export default function UncategorizedTable({ clientId }) {
  const [clientData, setClientData] = useState({});
  const [bankName, setBankName] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [transactionDb, setTransactionDb] = useState([]);
  const [error, setError] = useState("");
  // const [sortModel, setSortModel] = React.useState([
  //   {
  //     field: 'description',
  //     sort: 'asc',
  //   },
  // ]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [categoryWarning, setCategoryWarning] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);


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
    { field: "date1", headerName: "Date 1", width: 100 },
    { field: "description", type: "string", headerName: "Description", width: 350 },
    { field: "description2", type: "string", headerName: "Description +", width: 200 },
    { field: "credit_amount", type: "number", headerName: "Credit Amount", flex:1 },
    { field: "debit_amount", type: "number", headerName: "Debit Amount", flex:1 },
    { field: "balance_amount", type: "number", headerName: "Balance Amount", flex:1 },
    { field: "category", type: "string", id: "category", headerName: "Category", flex:1 },
    { field: "subcategory", type: "string", id: "subcategory", headerName: "Subcategory", flex:1 },
    { field: "mcategory", type: "string", id: "mcategory", headerName: "Matching Category", flex:1 },
    { field: "msubcategory", type: "string", id: "msubcategory", headerName: "Matching Subcategory", flex:1 },
  ];

  const handleSaveClick = async () => {
    const selectedTxns = transactions.filter(txn => selectedTransactions.includes(txn.uid));
    if (selectedTxns.length === 0) return;

    const selectedCategoryObj = categories.find(cat => cat.id === category);
    const selectedCategoryName = selectedCategoryObj?.name || "";

    // Warning check
    const hasIncomeMismatch = selectedCategoryName === "Income" && selectedTxns.some(txn => parseFloat(txn.debit_amount) > 0);

    if (hasIncomeMismatch) {
      setCategoryWarning("⚠️ You're assigning an 'Income' category to a debit transaction. Please double-check.");
      return;
    } else {
      setCategoryWarning("");
    }

    const selectedSubcategory = subcategories.find(sub => sub.id === subcategory)?.name || "";

    const payload = {
      category: selectedCategoryName,
      subcategory: selectedSubcategory,
      description: selectedTxns[0].description || "",
      createdAt: new Date().toISOString(),
    };

    try {
      await addTransactionDatabase(bankName, payload);
      // rest of the code...


    const updated = transactions.map(txn => {
      const isSelected = selectedTransactions.includes(txn.uid);
      const isSameDescription = isSelected || selectedTxns.some(sel =>
        sel.description?.trim().toLowerCase() === txn.description?.trim().toLowerCase()
      );

      return isSameDescription
        ? { ...txn, category: selectedCategory, subcategory: selectedSubcategory }
        : txn;
    });

    setTransactions(updated);
    setTransactionDb(updated);

    const categorizedCount = updated.filter(txn => txn.category && txn.subcategory).length;
    const percentage = Math.round((categorizedCount / updated.length) * 100);

    await updateDoc(doc(db, "clients", clientId), {
      transactions: updated,
      categorized: percentage,
    });

    console.log("Updated selected transactions with:", payload);
  } catch (error) {
    console.error("Error updating transactions:", error);
  }
};

  const handleMatchClick = async () => {
    try {
      // 1. For each client transaction, check if any item in transactionDb has the same description
      const updated = transactions.map(txn => {
        const match = transactionDb.find(dbTxn =>
          dbTxn.description?.trim().toLowerCase() === txn.description?.trim().toLowerCase()
        );

        if (match && match.category && match.subcategory) {
          return {
            ...txn,
            category: match.category,
            subcategory: match.subcategory,
          };
        }

        return txn;
      });

      setTransactions(updated);

      // 2. Write updates to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });

      // 3. Recalculate % categorized
      const total = updated.length;
      const categorizedCount = updated.filter(txn => txn.category && txn.subcategory).length;
      const percentage = Math.round((categorizedCount / total) * 100);

      await updateDoc(doc(db, "clients", clientId), {
        categorized: percentage,
      });

      console.log("Applied matches to client transactions.");
    } catch (error) {
      console.error("Error applying matches:", error);
    }
  };

  // Calculate progress
  const categorizedCount = transactions.filter(transaction => transaction.category).length;
  const totalTransactions = transactions.length;
  const progress = (categorizedCount / totalTransactions) * 100;
  
  // Calculate Cateory
  const categoryTotals = {};
  transactions.forEach(txn => {
    const category = txn.category;
    if (!category) return; 
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += parseFloat(txn.debit_amount) || parseFloat(txn.credit_amount) || 0;
  });

  // Calculate the incorrectly categorized transactions
  function isIncorrectlyCategorized(txn) {
    if (!txn || !txn.category) return false;

      const isIncome = txn.category === "Income";
      const hasDebit = parseFloat(txn.debit_amount) > 0;
      const hasCredit = parseFloat(txn.credit_amount) > 0;

      // Income should only have credit
      if (isIncome) return hasDebit;

      // All other categories should only have debit
      return hasCredit;
    }

  const incorrectlyCategorized = transactions.filter(txn => isIncorrectlyCategorized(txn));

  if (error) return <p className="text-red-500">{error}</p>;

  const selectSx = {
    backgroundColor: '#333', // Dark background for the select input
    color: 'white', // White text color
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }, // Darker border for the input outline
    '&:hover': { backgroundColor: '#444' }, // Darker background on hover
    '&.Mui-focused': { backgroundColor: '#444', borderColor: '#6cace4' }, // Focused state: dark background with a light blue border
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <Chip label={`Categorized: ${Math.round(progress)}%`} size="small" />
          <Chip label={`Uncategorized: ${uncategorizedTransactions.length}/${transactions.length}`} size="small" />
          <Chip label={`Total: ${transactions.length}`} size="small" />
          <Chip label={`Incorrect: ${incorrectlyCategorized.length}`} size="small" color="error" />
          {Object.entries(categoryTotals)
            .filter(([_, total]) => !isNaN(total) && total !== 0)
            .map(([name, total]) => (
              <Chip
                key={name}
                label={`${name}: ${total.toFixed(2)}`}
                size="small"
              />
            ))}
        </Stack>
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

          <Button variant="contained" onClick={handleSaveClick}>
            Categorize
          </Button>
          <Button variant="contained" onClick={handleMatchClick}>
            Match
          </Button>
        </Box>
        {categoryWarning && (
          <Typography color="error" sx={{ mt: 1 }}>
            {categoryWarning}
          </Typography>
        )}

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
        <Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography variant="body1">No transactions found.</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(selectionModel) => {
                const ids = Array.from(selectionModel?.ids || []);
                setSelectedTransactions(ids);
              }}
              // sortModel={sortModel}
              pageSizeOptions={[20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20, page: 0 } },
              }}
              sx={{
                height: 500,
                width: "100%",
              }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};