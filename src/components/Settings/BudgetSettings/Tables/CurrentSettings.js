import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Stack, Typography, CircularProgress
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

export default function CurrentSettings() {
  const [currentEnabled, setCurrentEnabled] = useState(false);
  const [currentPlacements, setCurrentPlacements] = useState([]);
  const [sheetPlacements, setSheetPlacements] = useState([]);
  const [newInstitutionCell, setNewInstitutionCell] = useState("");
  const [subCellInputs, setSubCellInputs] = useState({});
  const [rowModesModel, setRowModesModel] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const configDoc = () => doc(db, "settings", "budget", "config", "CurrentSettings");

  useEffect(() => {
    const fetchPlacements = async () => {
      const ref = configDoc();
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const updates = {};
        if (!("currentEnabled" in data)) updates.currentEnabled = false;
        if (!("currentPlacements" in data)) updates.currentPlacements = [];
        if (!("sheetPlacements" in data)) updates.sheetPlacements = [];

        if (Object.keys(updates).length > 0) {
          await setDoc(ref, updates, { merge: true });
        }

        setCurrentEnabled(data.currentEnabled ?? false);
        setCurrentPlacements(data.currentPlacements || []);
        setSheetPlacements(data.sheetPlacements || []);
      } else {
        const defaultData = {
          currentEnabled: false,
          currentPlacements: [],
          sheetPlacements: [],
        };
        await setDoc(ref, defaultData);
        setCurrentEnabled(false);
        setCurrentPlacements([]);
        setSheetPlacements([]);
      }
    };
    fetchPlacements();
  }, []);

  const processRowUpdate = (newRow) => {
    const updated = [...currentPlacements];
    updated[newRow.id] = { cell: newRow.cell, sheet: newRow.sheet };
    setCurrentPlacements(updated);
    return newRow;
  };

    const rows = currentPlacements.map((item, index) => ({
    id: index,
    columnName: item.columnName,
    titleName: item.titleName,
    titleCell: item.titleCell,
    startRow: item.startRow,
    endRow: item.endRow,
    sheet: item.sheet,
    }));

    const columns = [
    { field: "columnName", headerName: "Column Name", flex: 1 },
    { field: "titleName", headerName: "Title Name", flex: 1 },
    { field: "titleCell", headerName: "Cell Title", flex: 1 },
    { field: "startRow", headerName: "Start Row", flex: 1 },
    { field: "endRow", headerName: "End Row", flex: 1 },
    { field: "sheet", headerName: "Sheet Name", flex: 1 },
    {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        flex: 1,
        getActions: (params) => [
        <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={async () => {
            const updated = currentPlacements.filter((_, i) => i !== params.id);
            setCurrentPlacements(updated);
            try {
                await updateDoc(configDoc(), {
                currentPlacements: updated,
                });
            } catch (err) {
                setError("Failed to delete row");
                console.error(err);
            }
            }}
        />,
        ],
    },
    ];

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Current Insurance Cell Placements Settings</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
                label="Column Name"
                size="small"
                value={subCellInputs.columnName || ""}
                onChange={(e) => setSubCellInputs((prev) => ({ ...prev, columnName: e.target.value }))}
            />
            <TextField
                label="Title Name"
                size="small"
                value={subCellInputs.titleName || ""}
                onChange={(e) => setSubCellInputs((prev) => ({ ...prev, titleName: e.target.value }))}
            />

            <TextField
                label="Title Cell Eg. A1"
                size="small"
                value={subCellInputs.titleCell || ""}
                onChange={(e) => setSubCellInputs((prev) => ({ ...prev, titleCell: e.target.value }))}
            />
            <TextField
                label="Start Row"
                size="small"
                type="number"
                value={subCellInputs.startRow || ""}
                onChange={(e) =>
                    setSubCellInputs((prev) => ({ ...prev, startRow: Number(e.target.value) }))
                }
            />
                <TextField
                label="End Row"
                size="small"
                type="number"
                value={subCellInputs.endRow || ""}
                onChange={(e) =>
                    setSubCellInputs((prev) => ({ ...prev, endRow: Number(e.target.value) }))
                }
            />
            <TextField
                label="Sheet"
                size="small"
                value={subCellInputs.sheet || ""}
                onChange={(e) => setSubCellInputs((prev) => ({ ...prev, sheet: e.target.value }))}
            />
            <Button
                variant="contained"
                onClick={async () => {
                if (!subCellInputs.columnName || !subCellInputs.titleName || !subCellInputs.titleCell || !subCellInputs.startRow || !subCellInputs.endRow || !subCellInputs.sheet ) return;

                const updated = [
                ...currentPlacements,
                {
                    columnName: subCellInputs.columnName,
                    titleName: subCellInputs.titleName,
                    titleCell: subCellInputs.titleCell, 
                    startRow: subCellInputs.startRow,    
                    endRow: subCellInputs.endRow,        
                    sheet: subCellInputs.sheet, 
                },
                ];

                setCurrentPlacements(updated);
                setNewInstitutionCell("");
                setSubCellInputs({});
                try {
                    await updateDoc(configDoc(), {
                    currentPlacements: updated,
                    });
                } catch (err) {
                    setError("Failed to save to Firestore");
                    console.error(err);
                }
                }}
            >
                Add
          </Button>
        </Stack>
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
            editMode="row"
            getRowId={(row) => row.id}
            rowModesModel={rowModesModel}
            onRowModesModelChange={setRowModesModel}
            processRowUpdate={processRowUpdate}
            getRowClassName={(params) =>
              params.id === Object.keys(rowModesModel)[0] ? "editing-row" : ""
            }
            sx={{ height: 400, width: "100%" }}
          />
        )}
        </Box>
      </Stack>
    </Box>
  );
}
