import React, { useState, useEffect } from "react";

// Firebase Imports
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

// Common Components Import
import { LoadClientData } from "components/Common";

// uuid import
import { v4 as uuidv4 } from "uuid";

// MUI Imports
import Tooltip from '@mui/material/Tooltip';
import { Grid, Box, CircularProgress,TextField, InputAdornment, Typography } from "@mui/material";
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

const CustomToolbar = () => (
  <Toolbar>
    <Tooltip title="Columns">
      <IconButton sx={{ ml: 1, mr: 1 }}>
        <ViewColumnIcon fontSize="small" />
      </IconButton>
    </Tooltip>

    <Tooltip title="Filter">
      <IconButton sx={{ ml: 1, mr: 1 }}>
        <FilterListIcon fontSize="small" />
      </IconButton>
    </Tooltip>

    <QuickFilter>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1, width: 'auto' }}>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <IconButton
                {...triggerProps}
                color="default"
                aria-disabled={state.expanded}
                sx={{ ml: 1, mr: 1 }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <TextField
              {...controlProps} // spread other props
              inputRef={ref} // use inputRef for TextField
              aria-label="Search"
              placeholder="Search..."
              size="small"
              sx={{
                padding: '8px',
                borderRadius: '4px',
                width: '100%',
              }}
              InputProps={{
                startAdornment: state.value && (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: state.value ? (
                  <InputAdornment position="end">
                    <QuickFilterClear
                      edge="end"
                      size="small"
                      aria-label="Clear search"
                      sx={{ mr: -0.75 }}
                    >
                      <CancelIcon fontSize="small" />
                    </QuickFilterClear>
                  </InputAdornment>
                ) : null,
              }}
            />
          )}
        />
      </Box>
    </QuickFilter>
  </Toolbar>
);

const EditTableMissingAllAmounts = ({ clientId }) => {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [rowModesModel, setRowModesModel] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000); 
  }, []);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
      } catch (err) {
        console.error("🔥 Error fetching client data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
    fetchData();
  }, [clientId]);

  // Filter transactions with all zero amounts in debit, credit, and balance
  const filteredTransactions = transactions.filter(tx =>
    parseFloat(tx.debit_amount || 0) === 0 &&
    parseFloat(tx.credit_amount || 0) === 0 &&
    parseFloat(tx.balance_amount || 0) === 0
  );

  const rows = filteredTransactions.map((tx) => ({
    id: tx.uid || uuidv4(),
    ...tx,
  }));

  const columns = [
    {
      field: "date1",
      headerName: "Date 1",
      width: 120,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "date2",
      headerName: "Date 2",
      width: 120,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "description",
      type: "string",
      headerName: "Description",
      width: 400,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "description2",
      type: "string",
      headerName: "Description +",
      width: 300,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "credit_amount",
      type: "number",
      headerName: "Credit Amount",
      width: 130,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "debit_amount",
      type: "number",
      headerName: "Debit Amount",
      width: 130,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "balance_amount",
      type: "number",
      headerName: "Balance Amount",
      width: 130,
      editable: (params) => params.row.id === editingRowId,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
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
          ];
        }
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => setRowModesModel({ [params.id]: { mode: GridRowModes.Edit } })}
          />,
          <GridActionsCellItem
            icon={<AddIcon />}
            label="Add"
            onClick={() => handleCreateClick(params.id)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(params.id)}
          />,
        ];
      },
    },
  ];

  const processRowUpdate = async (newRow, oldRow) => {
    const updated = [...transactions];
    const index = transactions.findIndex((tx) => tx.uid === newRow.uid);

    if (index === -1) return oldRow;

    updated[index] = newRow;

    try {
      const ref = doc(db, "clients", clientId);
      await updateDoc(ref, { transactions: updated });
      setTransactions(updated);
      return newRow;
    } catch (error) {
      console.error("Save error:", error);
      return oldRow;
    }
  };

  const handleRemoveZeros = async () => {
    const confirm = window.confirm("Are you sure you want to remove all transactions with missing credit and debit amounts?");
    if (!confirm) return;

    const updatedTransactions = transactions.filter(
      (tx) => !(
        parseFloat(tx.credit_amount || 0) === 0 &&
        parseFloat(tx.debit_amount || 0) === 0
      )
    );

    const transactionRef = doc(db, "clients", clientId);
    await updateDoc(transactionRef, {
      transactions: updatedTransactions,
    });

    setTransactions(updatedTransactions);
    alert("Transactions with missing credit and debit amounts have been removed.");
  };
 
  const handleDeleteClick = async (index) => {
    const updated = [...transactions];
    const removed = updated.splice(index, 1);
    setTransactions(updated);

    try {
      const transactionRef = doc(db, "clients", clientId);

      const archiveEntries = removed.map((tx) => ({
        content: `${tx.description || ""} ${tx.description2 || ""} ${tx.credit_amount || ""} ${
          tx.debit_amount || ""
        } ${tx.balance_amount || ""}`.trim(),
        source: "EditTableMissingAllAmounts",
      }));

      const docSnap = await getDoc(transactionRef);
      const currentArchive = docSnap.exists() ? docSnap.data().archive || [] : [];

      await updateDoc(transactionRef, {
        transactions: updated,
        archive: [...currentArchive, ...archiveEntries],
      });

      console.log("Transaction deleted and archived successfully.");
    } catch (err) {
      console.error("Failed to delete and archive transaction:", err);
    }
  };

  const handleCreateClick = async (index) => {
    const createTx = {
      original: "",
      uid: uuidv4(),
      id: "",
      date1: "",
      date2: "",
      description: "",
      description2: "",
      fees_type: "",
      fees_amount: 0,
      credit_debit_amount: 0,
      credit_amount: 0,
      debit_amount: 0,
      balance_amount: 0,
      verified: "✗",
      category: "",
      subcategory: "",
    };
    createTx.id = createTx.uid;
    const updated = [...transactions];
    updated.splice(index + 1, 0, createTx);
    setTransactions(updated);

    try {
      const transactionRef = doc(db, "clients", clientId);
      await updateDoc(transactionRef, { transactions: updated });
      console.log("Transaction created successfully.");
    } catch (err) {
      console.error("Failed to create transaction:", err);
    }
  };

  return (
    <div>
      <Grid container spacing={2} sx={{ mt: 4 }}>

        <Grid size={12}>
          <Typography variant="h6"> Missing All Amounts Transactions</Typography>
        </Grid>
        
        <Grid size={12}>
        {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography variant="body1">No missing All Amounts found.</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              editMode="row"
              getRowId={(row) => row.id}
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              processRowUpdate={processRowUpdate}
              getRowClassName={(params) =>
                params.id === Object.keys(rowModesModel)[0] ? "editing-row" : ""
              }
              pageSizeOptions={[20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20, page: 0 } },
              }}
              slots={{ toolbar: CustomToolbar }}
              sx={{
                height: 690,
                width: "100%",
                overflow: "auto",
              }}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default EditTableMissingAllAmounts;
