// src/components/Transactions/ExtractTransactions/ExtractTransactions.js
import React, { useEffect, useState } from "react";
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
 } from "@mui/material";

import ExtractAutomatically from "./ExtractAutomatic/ExtractAutomatically";
import ExtractManually from "./ExtractManual/ExtractManually";

export default function ExtractTransactions({clientId}) {
  const [activeTable, setActiveTable] = useState("Automatically");
  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Extract Transactions
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant={activeTable === "Automatically" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("Automatically")}
          >
            Automatically
          </Button>
          <Button 
            variant={activeTable === "Manually" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("Manually")}
          >
            Manually
          </Button>
        </Stack>

        {activeTable === "Automatically" && <ExtractAutomatically clientId={clientId} />}
        {activeTable === "Manually" && <ExtractManually clientId={clientId} />}
      </Stack>
    </Box>
  );
};

