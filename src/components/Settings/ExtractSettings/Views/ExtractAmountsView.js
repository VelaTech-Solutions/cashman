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
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
// Firebase Imports
import { db } from "../../../../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  getDocs,
  collection,
} from "firebase/firestore";

export default function ExtractAmountsView() {
  const [banks, setBanks] = useState([]);
  const [bankType, setBankType] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedBankType, setSelectedBankType] = useState("");
  const [availableBankTypes, setAvailableBankTypes] = useState([]);

  const [selectedBank, setSelectedBank] = useState("");
  const [rowModesModel, setRowModesModel] = useState({});
  const [amountSettings, setAmountSettings] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const bankRef = (bank) => doc(db, "settings", "amounts", bank, "config");

  useEffect(() => {
    setNewLabel("");
    setNewRegex("");
  }, [selectedBank]);


  useEffect(() => {
    const fetchAll = async () => {
      const bankSnapshot = await getDocs(collection(db, "banks"));
      const bankNames = bankSnapshot.docs.map((doc) => doc.id);

      const settingsPromises = bankNames.map(async (bank) => {
        const snap = await getDoc(bankRef(bank));
        return { bank, data: snap.exists() ? snap.data() : {} };
      });

      const settingsResults = await Promise.all(settingsPromises);
      const allSettings = {};
      settingsResults.forEach(({ bank, data }) => {
        allSettings[bank] = data;
      });

      setBanks(bankNames);
      setAmountSettings(allSettings);
      if (bankNames.length > 0) setSelectedBank(bankNames[0]);
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const settingsRef = doc(db, "settings", "bankOptions");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBankOptions(data.banks || []);
        }
      } catch (error) {
        console.error("Error fetching bankOptions: ", error);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (selectedBank && bankOptions.length > 0) {
      const matchedBanks = bankOptions.filter(b => b.name === selectedBank);
      setAvailableBankTypes(matchedBanks.map(b => b.type));

      if (matchedBanks.length === 1) {
        setSelectedBankType(matchedBanks[0].type);
      } else {
        setSelectedBankType(""); // let user choose
      }
    }
  }, [selectedBank, bankOptions]);


  const sanitizeKey = (label) =>
    label.replace(/\//g, "_slash_")
         .replace(/\[/g, "_open_")
         .replace(/\]/g, "_close_")
         .replace(/\./g, "_dot_");

  const handleRegexChange = async (label, newPattern) => {
    const updated = {
      ...amountSettings,
      [selectedBank]: {
        ...amountSettings[selectedBank],
        [label]: {
          ...amountSettings[selectedBank][label],
          pattern: newPattern,
        },
      },
    };
    setAmountSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[selectedBank][label],
    });
  };

  const handleAddSetting = async () => {
    if (!newLabel || !newRegex) return;

    const safeLabelKey = sanitizeKey(newLabel);
    const newEntry = { label: newLabel, pattern: newRegex };

    const updated = {
      ...amountSettings,
      [selectedBank]: {
        ...amountSettings[selectedBank],
        [safeLabelKey]: newEntry,
      },
    };

    setAmountSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [safeLabelKey]: newEntry,
    });

    setNewLabel("");
    setNewRegex("");
  };

  const handleDeleteEntry = async (labelKey, bank) => {
    const updatedBank = { ...amountSettings[bank] };
    delete updatedBank[labelKey];

    const updated = {
      ...amountSettings,
      [bank]: updatedBank,
    };
    setAmountSettings(updated);

    await updateDoc(bankRef(bank), {
      [labelKey]: deleteField(),
    });
  };

  const rows = selectedBank && amountSettings[selectedBank]
    ? Object.entries(amountSettings[selectedBank]).map(([key, val]) => ({
        id: key,
        label: val.label || key,
        pattern: val.pattern || "",
      }))
    : [];

  const columns = [
    { field: "label", headerName: "To Find", flex: 1 },
    { field: "pattern", headerName: "Regex Pattern", flex: 2 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteEntry(params.id, selectedBank)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2} >

        <Select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          fullWidth
          variant="outlined"
          displayEmpty
          renderValue={(selected) => selected || "Select Bank"}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "& .MuiSvgIcon-root": { color: "white" },
          }}
        >
          {banks.map((bank) => (
            <MenuItem key={bank} value={bank}>{bank}</MenuItem>
          ))}
        </Select>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="bank-type-label">Bank Type</InputLabel>
          <Select
            labelId="bank-type-label"
            name="bankType"
            value={selectedBankType}
            onChange={(e) => setSelectedBankType(e.target.value)}
            input={<OutlinedInput label="Bank Type" />}
          >
            {availableBankTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          id="transactionAmountInput"
          label="Label (e.g., Transaction Amount)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            mb: 2,
              "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
        <TextField
          id="regexPatternInput"
          label="Regex Pattern"
          value={newRegex}
          onChange={(e) => setNewRegex(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            mb: 2,
              "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
        <Button 
          onClick={handleAddSetting}
          variant="contained" 
          color="success" 
          sx={{ flex: 1 }}
          >
          Add Setting
        </Button>
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              sx={{ height: 300, width: "100%" }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

