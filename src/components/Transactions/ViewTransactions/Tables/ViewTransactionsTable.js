import React, { useState, useEffect } from "react";

// Common Components Import
import { LoadClientData } from "components/Common";

// uuid import
import { v4 as uuidv4 } from "uuid";

// MUI Imports
import { Box, Stack, CircularProgress, Typography, TextField } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';


export default function ViewTransactionsTable({ clientId }) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const searchQueryTransactions = transactions.filter((transaction) => {
    const desc = transaction.description?.toLowerCase() || "";
    const date = transaction.date1?.toLowerCase() || "";
    return desc.includes(searchQuery.toLowerCase()) || date.includes(searchQuery.toLowerCase());
  });


  const rows = searchQueryTransactions.map((tx) => ({
    id: tx.uid || uuidv4(),
    ...tx,
  }));

  const columns = [
    { field: "date1", headerName: "Date 1", width: 120 },
    { field: "description", headerName: "Description", type: "string", width: 350 },
    { field: "description2", headerName: "Description +", type: "string", width: 200 },
    { field: "fees_type", headerName: "Fees Type", type: "string", flex:1 },
    { field: "fees_amount", headerName: "Fees Amount", type: "number", flex:1 },
    { field: "credit_debit_amount", headerName: "Credit/Debit Amount", type: "number", flex:1 },
    { field: "credit_amount", headerName: "Credit Amount", type: "number", flex:1 },
    { field: "debit_amount", headerName: "Debit Amount", type: "number", flex:1 },
    { field: "balance_amount", headerName: "Balance Amount", type: "number", flex:1 },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>

        {/* Search Bar */}
        <TextField
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
          value={searchQuery}
          fullWidth
          variant="outlined"
          label="Search by date or description"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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