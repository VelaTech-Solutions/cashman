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
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../../../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  getDocs,
  collection,
} from "firebase/firestore";
export default function ExtractDescriptionView() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [rowModesModel, setRowModesModel] = useState({});
  const [descriptionSettings, setDescriptionSettings] = useState({});
  const [newLabel, setNewLabel] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bankRef = (bank) => doc(db, "settings", "description", bank, "config");

  useEffect(() => {
    const fetchBanks = async () => {
      const bankSnapshot = await getDocs(collection(db, "banks"));
      const bankNames = bankSnapshot.docs.map((doc) => doc.id);
      setBanks(bankNames);
      if (bankNames.length > 0) setSelectedBank(bankNames[0]);
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedBank) return;
      const ref = bankRef(selectedBank);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setDescriptionSettings(snap.data());
      } else {
        await setDoc(ref, {});
        setDescriptionSettings({});
      }
    };

    fetchSettings();
  }, [selectedBank]);

  const handleToggleRemoval = async (label) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        enabled: !descriptionSettings[label]?.enabled,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleToggleDeletion = async (label) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        deletion: !descriptionSettings[label]?.deletion,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleRegexChange = async (label, newPattern) => {
    const updated = {
      ...descriptionSettings,
      [label]: {
        ...descriptionSettings[label],
        pattern: newPattern,
      },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [label]: updated[label],
    });
  };

  const handleAddSetting = async () => {
    if (!newLabel || !newRegex) return;
    const updated = {
      ...descriptionSettings,
      [newLabel]: { enabled: false, deletion: false, pattern: newRegex },
    };
    setDescriptionSettings(updated);
    await updateDoc(bankRef(selectedBank), {
      [newLabel]: { enabled: false, deletion: false, pattern: newRegex },
    });
    setNewLabel("");
    setNewRegex("");
  };

  // DELETES THE LINE ADDED 🗑️
  const handleDeleteEntry = async (label) => {
    const updated = { ...descriptionSettings };
    delete updated[label];
    setDescriptionSettings(updated);

    const ref = bankRef(selectedBank);
    await updateDoc(ref, {
      [label]: deleteField(),
    });
  };

  const rows = Object.entries(descriptionSettings).map(([key, val]) => ({
    id: key,
    label: key,
    pattern: val.pattern || "",
    enabled: !!val.enabled,
    deletion: !!val.deletion,
  }));

  const columns = [
    { field: "label", headerName: "To Find", flex: 1 },
    { field: "pattern", headerName: "Regex Pattern", flex: 2 },
    {
      field: "actions",
      headerName: "Actions", 
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              color="error"
              onClick={() => handleDeleteEntry(params.id, selectedBank)}
            >
              <DeleteIcon />
            </IconButton>
            <Switch
              checked={!!row.enabled}
              onChange={() => handleToggleRemoval(row.label)}
              color="success"
            />
            <Switch
              checked={!!row.deletion}
              onChange={() => handleToggleDeletion(row.label)}
              color="error"
            />
          </Stack>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2} >
      {/* <h3 className="text-lg font-semibold mb-4">Description Extraction Settings</h3> */}

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
          id="descriptionInput"
          label="Add New Description"
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
              disableRowSelectionOnClick
              sx={{ height: 400, width: "100%" }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};