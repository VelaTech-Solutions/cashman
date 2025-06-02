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
import { LoadClientData } from "components/Common";
import OverView from "./OverViews/OverView";
import EditTableOriginal from "./Tables/EditTableOriginal";
import EditTableInvalid from "./Tables/EditTableInvalid";
import EditTableMissingDescriptions from "./Tables/EditTableMissingDescriptions";
import EditTableMissingDates from "./Tables/EditTableMissingDates";
import EditTableMissingCreditDebitAmounts from "./Tables/EditTableMissingCreditDebitAmounts";
import EditTableMissingBalanceAmounts from "./Tables/EditTableMissingBalanceAmounts";
import EditTableMissingAllAmounts from "./Tables/EditTableMissingAllAmounts";

export default function EditTransactions({ clientId }) {
  const [activeTable, setActiveTable] = useState("tableOriginal");
  const [clientData, setClientData] = useState(null);
  const [bankName, setBankName] = useState("Unknown");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

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

  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Edit Transactions
        </Typography>
        <OverView transactions={transactions} />
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant={activeTable === "tableOriginal" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableOriginal")}>
              Original
          </Button>
          <Button variant={activeTable === "tableInvalid" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableInvalid")}>
              Invalid
          </Button>
          <Button variant={activeTable === "tableMissingDescriptions" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableMissingDescriptions")}>
            Missing Descriptions
          </Button>
          <Button variant={activeTable === "tableMissingDates" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableMissingDates")}>
              Missing Dates
          </Button>
          <Button variant={activeTable === "tableMissingCreditDebitAmounts" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableMissingCreditDebitAmounts")}>
              Missing Credit/Debit
          </Button>
          <Button variant={activeTable === "tableMissingBalanceAmounts" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableMissingBalanceAmounts")}>
              Missing Balance
          </Button>
          <Button variant={activeTable === "tableMissingAllAmounts" ? "contained" : "outlined"} 
            onClick={() => setActiveTable("tableMissingAllAmounts")}>
              Missing All Amounts
          </Button>
        </Stack>
        {activeTable === "tableOriginal" && <EditTableOriginal clientId={clientId} />}
        {activeTable === "tableInvalid" && <EditTableInvalid clientId={clientId} />}
        {activeTable === "tableMissingDescriptions" && <EditTableMissingDescriptions clientId={clientId} />}
        {activeTable === "tableMissingDates" && <EditTableMissingDates clientId={clientId} />}
        {activeTable === "tableMissingCreditDebitAmounts" && <EditTableMissingCreditDebitAmounts clientId={clientId} />}
        {activeTable === "tableMissingBalanceAmounts" && <EditTableMissingBalanceAmounts clientId={clientId} />}
        {activeTable === "tableMissingAllAmounts" && <EditTableMissingAllAmounts clientId={clientId} />}
      </Stack>
    </Box>
  );
};
