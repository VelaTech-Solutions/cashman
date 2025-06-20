// src/components/Transactions/ExtractTransactions/ExtractAutomatic/ExtractAutomatically.js
import React, { useEffect, useState } from "react";
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Select, 
  MenuItem,
  CircularProgress,
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
 } from "@mui/material";
 

// Firebase Imports
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { LoadClientData } from 'components/Common';
import { resetClientDb } from "./Utils";
import { extractAbsaData } from './Banks/Absa/Controller';
import { extractCapitecData } from './Banks/Capitec/Controller'; // this is not ready
import { extractFnbData } from './Banks/Fnb/Controller'; // this is not ready
import { extractNedData } from './Banks/Ned/Controller'; // this is not ready
import { extractStandardData } from './Banks/Standard/Controller'; // this is not ready
import { extractTymeData } from './Banks/Tyme/Controller'; // this is not ready



export default function ExtractAutomatically({clientId}) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bankName, setBankName] = useState("");
  const [extractionStatus, setExtractionStatus] = useState({});
  const [progressData, setProgressData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
        setBankName(clientData.bankName || "Unknown");

      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  useEffect(() => {
  if (!clientId) return;

  const unsub = onSnapshot(doc(db, "clients", clientId), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      setProgressData(data.extractProgress || {});
      setTransactions(data.transactions || []); // 👈 Add this line
    }
  });

  return () => unsub(); // cleanup on unmount
}, [clientId]);

  // lets create the selector here to which bank we want to extract

  const extractors = {
    "Absa Bank": extractAbsaData,
    "Capitec Bank": extractCapitecData,
    "Fnb Bank": extractFnbData,
    "Ned Bank": extractNedData,
    "Standard Bank": extractStandardData,
    "Tyme Bank": extractTymeData,
  };

  const totalDebit = transactions.reduce(
    (sum, txn) => sum + (txn.debit_amount ? parseFloat(txn.debit_amount) : 0),
    0
  ).toFixed(2);

  const totalCredit = transactions.reduce(
    (sum, txn) => sum + (txn.credit_amount ? parseFloat(txn.credit_amount) : 0),
    0
  ).toFixed(2);

  const verifiedTransactions = transactions.filter(
    (txn) => txn.verified === "✓"
  ).length;

  const unverifiedTransactions = transactions.filter(
    (txn) => txn.verified === "✗"
  ).length;

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Box>
          <Paper sx={{ p: 2, width: "100%" }}>
            <Stack direction="row" flexWrap="wrap" spacing={3}>
              <Typography variant="body2">Total Debits: <strong>{totalDebit}</strong></Typography>
              <Typography variant="body2">Total Credits: <strong>{totalCredit}</strong></Typography>
              <Typography variant="body2">Total Verified: <strong>{verifiedTransactions}</strong></Typography>
              <Typography variant="body2">Total Unverified: <strong>{unverifiedTransactions}</strong></Typography>
              <Typography variant="body2">Bank Name: <strong>{bankName}</strong></Typography>
            </Stack>
          </Paper>
        </Box>
        {/* can you make its just give a small feedback like all metrics met */}

        <Button
          variant="contained"
          color="success"
          disabled={isProcessing}
          onClick={async () => {
            setIsProcessing(true);
            const extractorFn = extractors[bankName] || null;
            let success = false;

            if (extractorFn) {
              success = await extractorFn(
                clientId,
                clientData,
                bankName,
                'pdfparser'
              );
            }

            setIsProcessing(false);
            setExtractionStatus(
              success
                ? { success: '✅ All metrics met' }
                : { error: '❌ Extraction failed or unsupported bank' }
            );
          }}
        >
          {isProcessing ? <CircularProgress size={24} color="inherit" /> : "Extract"}
        </Button>
        
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            setIsProcessing(true);
            const success = await resetClientDb(clientId);
            if (!success) {
              setExtractionStatus({ error: 'Reset failed' });
              setIsProcessing(false);
              return;
            }

            setExtractionStatus({ success: 'Reset successful' });
            setClientData(null);
            setTransactions([]);
            setIsProcessing(false);
          }}
        >
          Reset
        </Button>
        <Box>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">Extraction Progress</Typography>
            <Stack spacing={1} mt={1}>
              {Object.entries(progressData).map(([step, status]) => (
                <Box key={step}>
                  <Typography variant="body2">{step}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={status === "done" ? 100 : status === "pending" ? 50 : 0}
                    color={status === "done" ? "success" : "primary"}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};
