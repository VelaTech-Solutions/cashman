// src/components/Transactions/ExtractTransactions/ExtractAutomatic/ExtractAutomatically.js
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
 

// Firebase Imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Component Imports
import { LoadClientData } from 'components/Common';
import OverView from "./OverViews/OverView";
import ProgressView from "./Views/ProgressView";
import AutomaticActions from "./Actions/AutomaticActions";

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
    const fetchProgress = async () => {
      try {
        const clientRef = doc(db, "clients", clientId);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
          const data = clientSnap.data();
          const progress = data.extractProgress || {};
          setProgressData(progress);
        }
      } catch (error) {
        console.error("🔥 Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [clientId]);

  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>

        <OverView 
          transactions={transactions}
          bankName={bankName} 
        />

        <AutomaticActions
          clientId={clientId}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
        />

        <ProgressView 
          progressData={progressData}
          setProgressData={setProgressData}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          extractionStatus={extractionStatus}
          setExtractionStatus={setExtractionStatus}
        />
      </Stack>
    </Box>
  );
};
