import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, Button, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MonthToColumnSettings() {
  const [monthToColumn, setMonthToColumn] = useState({});
  const [newMonth, setNewMonth] = useState("");
  const [newColumn, setNewColumn] = useState("");

  const ref = doc(db, "settings", "budget", "config", "months");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data().monthToColumn || {} : {};
      setMonthToColumn(data);
    })();
  }, []);

  const saveToFirestore = async (updated) => {
    await setDoc(ref, { monthToColumn: updated });
    setMonthToColumn(updated);
  };

  const handleAdd = async () => {
    if (!newMonth || !newColumn) return;
    const updated = { ...monthToColumn, [newMonth]: newColumn };
    await saveToFirestore(updated);
    setNewMonth("");
    setNewColumn("");
  };

  const handleChange = (month, newCol) => {
    const updated = { ...monthToColumn, [month]: newCol };
    saveToFirestore(updated);
  };

  const handleDelete = async (month) => {
    const updated = { ...monthToColumn };
    delete updated[month];
    await saveToFirestore(updated);
  };

  return (
    <Box p={2}>
        <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
        Month → Excel Column Map
        </Typography>

        <Box display="flex" gap={1} mb={2}>
        <TextField
            label="Month (e.g. Jan)"
            value={newMonth}
            onChange={(e) => setNewMonth(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{ style: { color: "white" } }}
        />
        <TextField
            label="Column (e.g. C)"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{ style: { color: "white" } }}
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>

        <Table size="small">
        <TableHead>
            <TableRow>
            <TableCell sx={{ color: "white" }}>Month</TableCell>
            <TableCell sx={{ color: "white" }}>Excel Column</TableCell>
            <TableCell />
            </TableRow>
        </TableHead>
        <TableBody>
            {Object.entries(monthToColumn).map(([month, col]) => (
            <TableRow key={month}>
                <TableCell sx={{ color: "white" }}>{month}</TableCell>
                <TableCell>
                <TextField
                    size="small"
                    value={col}
                    onChange={(e) => handleChange(month, e.target.value)}
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "white" } }}
                />
                </TableCell>
                <TableCell>
                <IconButton sx={{ color: "white" }} onClick={() => handleDelete(month)}>
                    <DeleteIcon />
                </IconButton>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </Box>
  );
}
