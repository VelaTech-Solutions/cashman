import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { LoadClientData } from "components/Common";

// MUI Imports
import { 
  Box, 
  CircularProgress,
  Typography, 
  Button,
  Stack, 
  Chip 
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";

export default function CategorizedIssuesTable({ clientId }) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  const handleSingleResetClick = async (uid) => {
    try {
      const updated = transactions.map(txn =>
        txn.uid === uid ? { ...txn, category: "", subcategory: "" } : txn
      );

      setTransactions(updated);

      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
      });
      const categorizedCount = updated.filter(txn => txn.category && txn.subcategory).length;
      const percentage = Math.round((categorizedCount / updated.length) * 100);

      await updateDoc(doc(db, "clients", clientId), {
        categorized: percentage,
      });

      console.log("Reset category and subcategory for one transaction");
    } catch (error) {
      console.error("Error updating transaction:", error);
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

          // need to reset the % categorized too 
      const categorizedCount = updated.filter(txn => txn.category && txn.subcategory).length;
      const percentage = Math.round((categorizedCount / updated.length) * 100);

      await updateDoc(doc(db, "clients", clientId), {
        transactions: updated,
        categorized: percentage,
      });

      

      console.log("Reset all Cat and Subcat");
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };


  // we need to change the filter here 
  // so we need to fileter like this now
  // Icome should only be credit_amount
  // all other categroies should be debit_amount
  // so this sript will point out the transactions that are incorrectly categroiesed
  const isIncorrectlyCategorized = (txn) => {
    if (!txn.category || !txn.subcategory) return false;

    const isIncome = txn.category === "Income";
    const hasDebit = parseFloat(txn.debit_amount) > 0;
    const hasCredit = parseFloat(txn.credit_amount) > 0;

    // Income should only have credit
    if (isIncome) return hasDebit;

    // All other categories should only have debit
    return hasCredit;
  };

  const filteredTransactions = transactions.filter(isIncorrectlyCategorized);


  const rows = filteredTransactions.map((tx) => ({
    id: tx.uid,
    ...tx,
  }));

  const columns = [
    { field: "date1", headerName: "Date 1", width: 100 },
    { field: "description", type: "string", headerName: "Description", width: 350 },
    { field: "description2", type: "string", headerName: "Description +", width: 200 },
    { field: "credit_amount", type: "number", headerName: "Credit Amount", flex:1 },
    { field: "debit_amount", type: "number", headerName: "Debit Amount", flex:1 },
    { field: "balance_amount", type: "number", headerName: "Balance Amount", flex:1 },
    { field: "category", type: "string", id: "category", headerName: "Category", flex:1 },
    { field: "subcategory", type: "string", id: "subcategory", headerName: "Subcategory", flex:1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex:1,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Reset"
          onClick={() => handleSingleResetClick(params.id)}
        />
      ],
    },
  ];
  
   // Calculate progress
  const categorizedCount = transactions.filter(transaction => transaction.category).length;
  const totalTransactions = transactions.length;
  const progress = (categorizedCount / totalTransactions) * 100;
  
  // Calculate category totals
  const categoryTotals = {};
  transactions.forEach(txn => {
    const category = txn.category;
    if (!category) return; // skip empty or undefined categories
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += parseFloat(txn.debit_amount) || parseFloat(txn.credit_amount) || 0;
  });

  const incorrectlyCategorized = transactions.filter(txn => isIncorrectlyCategorized(txn));


  if (error) return <div>{error}</div>;

  return (

    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Chip label={`Categorized: ${Math.round(progress)}%`} size="small" />
            <Chip label={`Categorized: ${filteredTransactions.length}/${transactions.length}`} size="small" />
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
            <Button 
              variant="contained" 
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all categorized transactions?")) {
                  handleClearCategorized();
                }
              }} 
              sx={{ backgroundColor: 'error.main', color: 'white' }}
            >
              Clear All
            </Button>
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
