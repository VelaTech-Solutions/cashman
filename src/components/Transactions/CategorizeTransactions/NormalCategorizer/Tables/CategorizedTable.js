import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { LoadClientData } from "components/Common";

// MUI Imports
import { 
  Grid, 
  Box, 
  CircularProgress,
  Typography, 
  Button,
  Stack, 
  Chip, 
  Divider  
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";


const CategorizedTable = ({ clientId }) => {
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

      console.log("Reset all Cat and Subcat");
    } catch (error) {
      console.error("Error updating transactions:", error);
    }
  };

  const isCategorized = (txn) => txn.category && txn.subcategory;

  const filteredTransactions = transactions.filter(isCategorized);


  const rows = filteredTransactions.map((tx) => ({
    id: tx.uid,
    ...tx,
  }));

  const columns = [
    { field: "date1", headerName: "Date 1", width: 120, },
    { field: "date2", headerName: "Date 2", width: 120, },
    { field: "description", type: "string", headerName: "Description", width: 400, },
    { field: "description2", type: "string", headerName: "Description +", width: 300, },
    { field: "credit_amount", type: "number", headerName: "Credit Amount", width: 130, },
    { field: "debit_amount", type: "number", headerName: "Debit Amount", width: 130, },
    { field: "balance_amount", type: "number", headerName: "Balance Amount", width: 130, },
    { field: "category", type: "string", headerName: "Category", width: 100, },
    { field: "subcategory", type: "string", headerName: "Subcategory", width: 100, },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
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


  if (error) return <div>{error}</div>;

  const metricsSx = {
    backgroundColor: "#424242",
    color: 'white',
  };

  return (
    <div>
      <Grid container spacing={2} sx={{ mt: 4 }}>

        <Grid size={12}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              <Chip label={`Categorized: ${Math.round(progress)}%`} size="small" sx={metricsSx} />
              <Chip label={`Categorized: ${filteredTransactions.length}/${transactions.length}`} size="small" sx={metricsSx} />
              <Chip label={`Total: ${transactions.length}`} size="small" sx={metricsSx} />
            </Stack>
            <Divider sx={{ borderColor: "#555" }} />
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {Object.entries(categoryTotals)
                .filter(([_, total]) => !isNaN(total) && total !== 0)
                .map(([name, total]) => (
                  <Chip
                    key={name}
                    label={`${name}: ${total.toFixed(2)}`}
                    size="small"
                    sx={metricsSx}
                  />
                ))}
            </Stack>
          </Stack>
        </Grid>
        
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

        <Grid size={12}>
        {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            <Typography sx={{ mt: 4 }} align="center">
              No categorized transactions found.
            </Typography>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
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
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default CategorizedTable;
