import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress
} from "@mui/material";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebase/firebase";
import { extractionController } from '../Utils/';

export default function AutomaticActions({
  clientId,
  bankName,
  clientData,
  setClientData,
  setIsProcessing,
  setExtractionStatus,
}) {
  const [processing, setProcessing] = useState(false);
  const [processingMethod, setProcessingMethod] = useState("pdfparser");
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!clientId) return;
    const clientRef = doc(db, "clients", clientId);
    const unsubscribe = onSnapshot(clientRef, (docSnap) => {
      if (docSnap.exists() && typeof setClientData === "function") {
        setClientData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [clientId]);

  const handlereset = () => {
    if (!clientId) return;
    const clientRef = doc(db, "clients", clientId);
    updateDoc(clientRef, {
      transactions: [],
      filteredData: [],
      extractProgress: {},
      archive: [],
      progress: {},
      number_of_transactions: 0,
    });
    setCountdown(2);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          window.location.reload();
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
      <FormControlLabel
        control={
          <Switch
            checked={processingMethod === "ocr"}
            onChange={(e) =>
              setProcessingMethod(e.target.checked ? "ocr" : "pdfparser")
            }
          />
        }
        label={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography>PDF Parser</Typography>
            <Typography>OCR</Typography>
          </Box>
        }
        labelPlacement="start"
      />

      <Button
        variant="contained"
        color="success"
        disabled={processing}
        onClick={() =>
          extractionController({
            clientId,
            bankName,
            clientData,
            setClientData,
            setProcessing,
            setIsProcessing,
            setExtractionStatus,
          })
        }
      >
        {processing ? <CircularProgress size={20} color="inherit" /> : "Extract"}
      </Button>

      <Button variant="contained" color="error" onClick={handlereset}>
        Reset
      </Button>

      {countdown !== null && (
        <Typography color="error" fontWeight="bold">
          Resetting in {countdown} second{countdown !== 1 && "s"}...
        </Typography>
      )}
    </Box>
  );
}
