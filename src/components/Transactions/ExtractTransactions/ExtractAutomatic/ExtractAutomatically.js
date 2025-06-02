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
//import AutomaticActions from "./Actions/AutomaticActions";
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

// lets create the selector here to which bank we want to extract

const extractors = {
  "Absa Bank": extractAbsaData,
  "Capitec Bank": extractCapitecData,
  "Fnb Bank": extractFnbData,
  "Ned Bank": extractNedData,
  "Standard Bank": extractStandardData,
  "Tyme Bank": extractTymeData,
};


  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>

        <OverView 
          transactions={transactions}
          bankName={bankName} 
        />

        {/* <AutomaticActions
          clientId={clientId}
          bankName={bankName}
          clientData={clientData}
          setClientData={setClientData}
          setIsProcessing={setIsProcessing}
          setExtractionStatus={setExtractionStatus}
        /> */}

        <Button
          variant="contained"
          color="success"
          onClick={async () => {
            setIsProcessing(true);
            const extractorFn = extractors[bankName] || null;
            let success = false;

            if (extractorFn) {
              success = await extractorFn(clientId, clientData, bankName, 'pdfparser');
            }

            setIsProcessing(false);
            setExtractionStatus(success 
              ? { success: 'Extraction started' } 
              : { error: 'Extraction failed or unsupported bank' });
          }}
        >
          Extract
        </Button>


        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            setIsProcessing(true);
            const success = await resetClientDb(clientId);
            setIsProcessing(false);
            if (!success) {
              setExtractionStatus({ error: 'Reset failed' });
            } else {
              setExtractionStatus({ success: 'Reset started' });
            }
          }}
        >
          Reset
        </Button>


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
