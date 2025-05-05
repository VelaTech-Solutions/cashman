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
  loadTransactionDatebase,
  addTransactionDatabase,
  clearTransactionDatabase } from "components/Common";


import {
  Box,
  Stack,
  List,
  ListItemText,
  Select, MenuItem, 
  InputLabel, 
  FormControl, 
  LinearProgress, 
  Button,
  Chip,
  Divider,
  Typography 
} from "@mui/material";

const UncategorizedTable = ({ clientId }) => {
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
  
    // console.log(totals);  // Check the totals before formatting
  
    const formattedTotals = Object.keys(totals).reduce((acc, key) => {
      const total = totals[key];
      // Only add to acc if total is a valid number
      if (!isNaN(total)) {
        acc[key] = total.toFixed(2);  // Ensure it's a number and format
      }
      return acc;
    }, {});
  
    // console.log(formattedTotals);  // Check the formatted totals
    setCategoryTotals(formattedTotals);
  }, [transactions]);

  const potentialMatches = useMemo(() => {
    return transactions.filter((txn) =>
      transactionDb.some((dbTxn) => dbTxn.description === txn.description)
    );
  }, [transactions, transactionDb]);

  // const reloadMetrics = () => {
  //   // Recalculate metrics that need to be updated
  //   const potentialMatches = checkPotentialMatches();
  //   const uncategorizedTransactions = transactions.filter(txn => !txn.category);
  //   const groupedAndFlattened = groupTransactions(transactions);  // Replace with your actual grouping logic
  //   const progress = Math.round((groupedAndFlattened.length / transactions.length) * 100);
  //   const categoryTotals = calculateCategoryTotals(transactions);  // Replace with your actual category totals logic
  
  //   // Set updated state values
  //   setPotentialMatches(potentialMatches);
  //   setUncategorizedTransactions(uncategorizedTransactions);
  //   setGroupedAndFlattened(groupedAndFlattened);
  //   setProgress(progress);
  //   setCategoryTotals(categoryTotals);
  // };



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

  const handleCheckboxChange = (uid) => {
    if (!uid) return;
    setSelectedTransactions(prev => {
      const newSelected = prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid];
      
      // Full transaction objects
      const selectedObjects = currentItems.filter(item => newSelected.includes(item.uid));
      //console.log("Selected Transactions (full):", selectedObjects);
      
      return newSelected;
    });
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
  
      // 3. Update transactionDb (local or fetch from Firestore)
      setTransactionDb(updated); // Ensure transactionDb is updated
  
      // 4. Save to Firestore
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });

      // Reload metrics after updating transactions
      // reloadMetrics();

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

  // handleMatchAll =use the transactions in the trandactionDb then match them against the clients transctions we doing this now
  const handleMatchAll = async () => {
    if (!transactionDb.length) return;

    const toBeMatched = transactions.filter(txn =>
      transactionDb.some(dbTxn => dbTxn.description === txn.description)
    );
    console.log("Transactions to be matched:", toBeMatched);
    const updated = transactions.map(txn => {
      const match = transactionDb.find(dbTxn => dbTxn.description === txn.description);
      if (match) {
        return {
          ...txn,
          category: match.category,
          subcategory: match.subcategory,
        };
      }
      return txn;
    });
  
    setTransactions(updated);
  
    try {
      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });
      console.log("Matched and updated transactions.");
    } catch (error) {
      console.error("Error during match all update:", error);
    }
  };

  // handleClearTransactionDatabase
  const handleClearTransactionDatabase = async () => {
    try {
      await clearTransactionDatabase(bankName);
      console.log("Transaction database cleared.");
    } catch (error) {
      console.error("Error clearing transaction database:", error);
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

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;


  
  return (
    <div className="text-white">

      {/* after handleCategorizeClick this doesnt update the display data */}
      <Box sx={{ width: '100%', mb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`${groupedAndFlattened.length} Shown`} size="small" sx={{ color: "white", backgroundColor: "#424242" }} />
          <Chip label={`${potentialMatches.length} Matches`} size="small" sx={{ color: "white", backgroundColor: "#424242" }} />
          <Chip label={`${Math.round(progress)}% Done`} size="small" sx={{ color: "white", backgroundColor: "#424242" }} />
          <Chip label={`${uncategorizedTransactions.length} Uncategorized`} size="small" sx={{ color: "white", backgroundColor: "#424242" }} />
          <Chip label={`${transactions.length} Total`} size="small" sx={{ color: "white", backgroundColor: "#424242" }} />
        </Stack>
      </Box>
      {/* line or divier  thisupdate somehow do know how but it does */}
      <Divider sx={{ my: 1, borderColor: "#555" }} />
      <Box sx={{ width: '100%', mb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(categoryTotals)
            .filter(([_, total]) => !isNaN(total) && total !== 0)
            .map(([name, total]) => (
              <Chip
                key={name}
                label={`${name}: ${total}`}
                size="small"
                sx={{ color: "white", backgroundColor: "#424242" }}
              />
            ))}
        </Stack>
      </Box>
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
            Categorize
          </Button>

          {/* Match All Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleMatchAll}
            startIcon={<span>📂</span>}
          >
            Match All
          </Button>

          {/* clear all Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleClearCategorized}
            startIcon={<span>📂</span>}
          >
            Clear All
          </Button>

          {/* for debug transaction database clearer clearTransactionDatabase Button*/}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleClearTransactionDatabase}
            startIcon={<span>📂</span>}
          >
            Clear Transaction Database
          </Button>


        </Stack>
      </Box>
      {/* Progress Bar space under the bar */}
      <Box sx={{ width: '100%', mb: 1 }}>
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
      {/* Filtered and grouped table */}
      {currentTab === "table1" && (
        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-md">
          <table className="min-w-full bg-gray-800">
            <thead className="bg-gray-900 sticky top-0 z-10 text-sm text-left text-gray-300">
              <tr>
                <th className="px-2 py-2 w-[20px] border border-gray-700">
                </th>
                <th className="px-4 py-2 w-[60px] border border-gray-700">Date</th>
                <th className="px-4 py-2 w-[600px] border border-gray-700">Description</th>
                <th className="px-4 py-2 w-[200px] border border-gray-700">Description2</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Credit</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Debit</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Balance</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Category</th>
                <th className="px-4 py-2 w-[80px] border border-gray-700">Subcategory</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-200">
              {currentItems.map((item, idx) =>
                item.isHeader ? (
                  <tr key={`header-${item.groupKey}`} className="bg-gray-900 border-t border-gray-700">
                    <td colSpan={8} className=" w-[20px] border border-gray-700">
                      <div className="p-3 flex items-center gap-1 truncate">
                        <input
                          type="checkbox"
                          // checked={isGroupFullySelected(item.groupKey)}
                          // onChange={() => handleToggleGroup(item.groupKey)}
                        />
                        {groupBy === "description" && (
                          <span className="text-xs text-blue-400 block">{item.groupKey}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  
                <tr key={startIndex + idx} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(item.uid)}
                      onChange={() => handleCheckboxChange(item.uid)}
                    />
                  </td>
                  <td className="p-3 border border-gray-700 truncate">{item.date1 || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.description || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.description2 || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.credit_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.debit_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.balance_amount || "-"}</td>
                  <td className="p-3 border border-gray-700 truncate">{item.category || "-"}</td>
                  <td className={`p-3 border border-gray-700 truncate ${CategoryColor.getCategoryColor(item.category)}`}>
                    {item.subcategory || "-"}
                  </td>
                </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Container for Pagination and Progress */}
      <div className="flex flex-col items-center mt-4 px-2 w-full space-y-2">

        {/* Pagination Row */}
        <div className="flex justify-between items-center w-full">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="text-sm font-semibold text-white">
            Page <span>{currentPage}</span> of <span>{totalPages}</span>
          </span>

          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UncategorizedTable;
