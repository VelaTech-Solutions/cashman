import React, { useState, useEffect } from "react";
// Mui Imports
import { 
  Box, 
  Select, 
  TextField, 
  Button, 
  MenuItem, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  CircularProgress, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
} from "@mui/material";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
export default function ExtractAlignmentView() {
  const [alignmentSettings, setAlignmentSettings] = useState({});
  const [orderedBanks, setOrderedBanks] = useState([]);

  useEffect(() => {
    const fetchOrCreateSettings = async () => {
      try {
        // Step 1: Get all bank IDs
        const bankSnapshot = await getDocs(collection(db, "banks"));
        const bankNames = bankSnapshot.docs.map((doc) => doc.id);
        setOrderedBanks(bankNames);

        // Step 2: Check if alignment settings exist
        const ref = doc(db, "settings", "alignment");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // Step 3: Create with all banks set to false
          const defaultSettings = {};
          bankNames.forEach((name) => {
            defaultSettings[name] = false;
          });
          await setDoc(ref, defaultSettings);
          setAlignmentSettings(defaultSettings);
        } else {
          setAlignmentSettings(snap.data());
        }
      } catch (err) {
        console.error("Error loading alignment settings:", err.message);
      }
    };

    fetchOrCreateSettings();
  }, []);

  const handleToggle = async (bank) => {
    const updated = {
      ...alignmentSettings,
      [bank]: !alignmentSettings[bank],
    };

    setAlignmentSettings(updated);
    await updateDoc(doc(db, "settings", "alignment"), updated);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2} >
      <div className="space-y-3">
        {orderedBanks.map((bank) => (
          <div
            key={bank}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
            <span>{bank}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={alignmentSettings[bank] || false}
                onChange={() => handleToggle(bank)}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 relative after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
      </Stack>
    </Box>
  );
};
