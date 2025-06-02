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
export default function ExtractDatesView() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [rowModesModel, setRowModesModel] = useState({});
  const [dateSettings, setDateSettings] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bankRef = (bank) => doc(db, "settings", "dates", bank, "config");

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
      setDateSettings(allSettings);
      if (bankNames.length > 0) setSelectedBank(bankNames[0]);
    };

    fetchAll();
  }, []);

  const sanitizeKey = (label) =>
    label.replace(/\//g, "_slash_")
         .replace(/\[/g, "_open_")
         .replace(/\]/g, "_close_")
         .replace(/\./g, "_dot_");

  const handleRegexChange = async (label, newPattern) => {
    const updated = {
      ...dateSettings,
      [selectedBank]: {
        ...dateSettings[selectedBank],
        [label]: {
          ...dateSettings[selectedBank][label],
          pattern: newPattern,
        },
      },
    };
    setDateSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[selectedBank][label],
    });
  };

  const handleAddSetting = async () => {
    if (!newLabel || !newRegex) return;

    const safeLabelKey = sanitizeKey(newLabel);
    const newEntry = { label: newLabel, pattern: newRegex };

    const updated = {
      ...dateSettings,
      [selectedBank]: {
        ...dateSettings[selectedBank],
        [safeLabelKey]: newEntry,
      },
    };

    setDateSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [safeLabelKey]: newEntry,
    });

    setNewLabel("");
    setNewRegex("");
  };

  const handleDeleteEntry = async (labelKey, bank) => {
    const updatedBank = { ...dateSettings[bank] };
    delete updatedBank[labelKey];

    const updated = {
      ...dateSettings,
      [bank]: updatedBank,
    };
    setDateSettings(updated);

    await updateDoc(bankRef(bank), {
      [labelKey]: deleteField(),
    });
  };

  const rows = selectedBank && dateSettings[selectedBank]
    ? Object.entries(dateSettings[selectedBank]).map(([key, val]) => ({
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
        {/* <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          Manage the date extraction rules per bank to ensure accurate transaction matching.
        </Typography> */}
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
        <TextField
          id="transactionDateInput"
          label="Label (e.g., Transaction Date)"
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

