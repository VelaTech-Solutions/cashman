import React, { useState, useEffect } from "react";
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
import TransactionsDatabase from "./Views/TransactionsDatabaseView";


export default function DatabaseSettingsPage() {
  const [activeTable, setActiveTable] = useState("TransactionsDatabase");

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Database Settings
          </Typography> */}
            <Button 
              variant={activeTable === "TransactionsDatabase" ? "contained" : "outlined"} 
              onClick={() => setActiveTable("TransactionsDatabase")}
            >
              Transaction Database
            </Button>
        </Stack>
        {activeTable === "TransactionsDatabase" && <TransactionsDatabase />}
      </Stack>
    </Box>
  );
};