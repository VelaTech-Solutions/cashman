// src/pages/DevelopPage.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  List,
  ListItem,
  Stack,
  Paper,
} from "@mui/material";
import { doc, getDoc, setDoc  } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // ✅ correct

import { db, auth  } from "../firebase/firebase";
// Component Imports
import { Sidebar } from 'components/Common';

const configDoc = () => doc(db, "settings", "developnote");

export default function DevelopPage() {
  const [notesLines, setNotesLines] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [userEmail, setUserEmail] = useState("Unknown");
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
  });
  return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchLines = async () => {
      const ref = configDoc();
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const updates = {};
        if (!("notesLines" in data)) updates.notesLines = [];
        if (Object.keys(updates).length > 0) await setDoc(ref, updates, { merge: true });
        setNotesLines(data.notesLines || []);
      } else {
        const defaultData = { notesLines: [] };
        await setDoc(ref, defaultData);
        setNotesLines(defaultData.notesLines);
      }
      setSelectedNotes(new Set());
    };
    fetchLines();
  }, []);

  const addNoteLine = async () => {
    const input = document.querySelector("#notesLineInput");
    const value = input.value.trim();
    if (!value) return;
    const newNote = { text: value, user: userEmail, timestamp: Date.now() };
    const updated = [...notesLines, newNote];
    await setDoc(configDoc(), { notesLines: updated }, { merge: true });
    setNotesLines(updated);
    input.value = "";
  };
  
  const deleteSelectedLines = async () => {
    const updated = notesLines.filter((_, i) => !selectedNotes.has(i));
    await setDoc(configDoc(), { notesLines: updated }, { merge: true });
    setNotesLines(updated);
    setSelectedNotes(new Set());
  };

  const toggleSelection = (index) => {
    const newSet = new Set(selectedNotes);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setSelectedNotes(newSet);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h4" gutterBottom>Development Notes</Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField id="notesLineInput" label="New Note" fullWidth />
            <Button variant="contained" color="success" onClick={addNoteLine}>Send</Button>
            <Button variant="contained" color="error" onClick={deleteSelectedLines}>Delete</Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
          <List>
            {[...notesLines].reverse().map((note, index) => (
              <ListItem key={index} disableGutters>
                <Checkbox
                  sx={{ mr: 1 }}
                  checked={selectedNotes.has(index)}
                  onChange={() => toggleSelection(index)}
                />
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    maxWidth: "80%",
                  }}
                >
                  <Typography variant="body1">
                    {typeof note === "string" ? note : note.text}
                  </Typography>
                  <Typography variant="caption" >
                    {note.user || "Unknown"}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Stack>
    </Box>
  );
};