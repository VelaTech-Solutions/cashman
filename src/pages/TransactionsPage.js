import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Paper, Stack, Typography, Grid} from "@mui/material";
// Component Imports
import { LoadClientData, OverView } from 'components/Common';

export default function TransactionsPage({clientId}) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Manage Transactions
        </Typography>
          <OverView transactions={transactions}/> */}
      </Stack>
    </Box>
  );
};

