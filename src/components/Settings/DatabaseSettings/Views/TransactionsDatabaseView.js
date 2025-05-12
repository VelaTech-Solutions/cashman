import React, { useState, useEffect, use } from "react";


// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Common Components Import
import { 
  loadTransactionDatebase,
  addTransactionDatabase,
  deleteTransactionDatabase,
  BulkDeleteTransactionDatabase,
  clearTransactionDatabase } from "components/Common";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import { 
  Grid, 
  Box, 
  Chip, 
  Divider,
  Stack,
  CircularProgress, 
  InputAdornment, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Checkbox, 
  TextField, 
  FormControlLabel,
  Switch
} from "@mui/material";

import {
  DataGrid,
  Toolbar,
  ToolbarButton,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';


import { v4 as uuidv4 } from 'uuid';

const TransactionsDatabaseView = () => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [transactionDb, setTransactionDb] = useState([]);
  const [allTransactionDb, setAllTransactionDb] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);

  useEffect(() => {
    const fetchBanks = async () => {
      const snap = await getDoc(doc(db, "settings", "banks"));
      if (snap.exists()) setBanks(snap.data().banks || []);
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (!selectedBank) return;
    const fetchTransactionDb = async () => {
      setLoading(true);
      try {
        const transactionsData = await loadTransactionDatebase(selectedBank);
        setTransactionDb(transactionsData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionDb();
  }, [selectedBank]);


  const fetchAllTransactions = async () => {
    try {
      const promises = banks.map(async (bank) => {
        const txs = await loadTransactionDatebase(bank);
        return txs.map(tx => ({ ...tx, bank }));
      });

      const allDataNested = await Promise.all(promises);
      const allData = allDataNested.flat();
      setAllTransactionDb(allData);
    } catch (err) {
      console.error("Error loading all transactions:", err);
    }
  };

useEffect(() => {
  if (banks.length > 0) fetchAllTransactions();
}, [banks]);


  const rows = transactionDb.map((tx) => ({
    id: tx.uid || uuidv4(),
    ...tx,
  }));

  const columns = [
    {
      field: "category",
      headerName: "Category",
      width: 120,
      editable: true,
    },
    {
      field: "subcategory",
      headerName: "Subcategory",
      width: 120,
      editable: true,
    },
    {
      field: "description",
      headerName: "Description",
      width: 400,
      editable: true,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        return isInEditMode
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={() => setRowModesModel({ [params.id]: { mode: GridRowModes.View } })}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                onClick={() =>
                  setRowModesModel({
                    [params.id]: { mode: GridRowModes.View, ignoreModifications: true },
                  })
                }
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => {
                  setRowModesModel({ [params.id]: { mode: GridRowModes.Edit } });
                  setEditingRowId(params.id);
                }}
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={async () => {
                  const transactionId = params.id;
                  await deleteTransactionDatabase(selectedBank, transactionId);
                  const updated = await loadTransactionDatebase(selectedBank);
                  setTransactionDb(updated);
                  fetchAllTransactions(); // Also update chip counts
                }}

              />,

            ];
      },
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Transactions Database
      </Typography>

      {/* count the number of transactions in the db for each bank and display the number */}
      <Box sx={{ width: '100%', mb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {banks.map((bank) => (
            <Chip
              key={bank}
              label={`${bank}: ${allTransactionDb.filter(tx => tx.bank === bank).length}`}
              size="small"
              sx={{ color: "white", backgroundColor: "#424242" }}
            />
          ))}
        </Stack>
      </Box>

      <Select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
        fullWidth
        displayEmpty
        sx={{
          mb: 2,
          color: "white",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
          "& .MuiSvgIcon-root": { color: "white" },
        }}
        renderValue={(selected) => selected || "Select Bank"}
      >
        {banks.map((bank) => (
          <MenuItem key={bank} value={bank}>{bank}</MenuItem>
        ))}
      </Select>



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
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          sx={{ height: 600, width: "100%" }}

          
        />

      )}
      {selectedBank && (
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            const confirmDelete = window.confirm(`Are you sure you want to delete ALL transactions for ${selectedBank}?`);
            if (confirmDelete) {
              await BulkDeleteTransactionDatabase(selectedBank);
              await fetchAllTransactions(); // Soft reload
              setSelectedBank("");
            }
          }}
          sx={{ mt: 2 }}
        >
          Clear All in {selectedBank}
        </Button>
      )}

    </Box>
  );
};

export default TransactionsDatabaseView;