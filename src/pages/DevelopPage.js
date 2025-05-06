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
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from "@mui/material";
import { doc, getDoc, setDoc  } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // ✅ correct

import { db, auth  } from "../firebase/firebase";
// Component Imports
import { Sidebar } from 'components/Common';

const configDoc = () => doc(db, "settings", "developnote");


const DevelopPage = () => {
  const [notesLines, setNotesLines] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(new Set());

  const [userEmail, setUserEmail] = useState("Unknown");
  const links = [
    { path: "goBack", label: "Back", icon: "ph-arrow-left" },
    { path: "/Help", label: "Help", icon: "ph-question" },
  ];
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
        <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
          <Sidebar title="Category Settings" links={links} />
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Development Notes</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField id="notesLineInput" label="New Note" fullWidth />
          <Button variant="contained" onClick={addNoteLine}>Add</Button>
          <Button color="error" onClick={deleteSelectedLines}>Delete Selected</Button>
        </Box>
      </Paper>

      <Paper>
        <List>
        {notesLines.map((note, index) => (
  <ListItem key={index} divider>
    <Checkbox
      edge="start"
      checked={selectedNotes.has(index)}
      onChange={() => toggleSelection(index)}
    />
    <ListItemText
      primary={typeof note === "string" ? note : note.text}
      secondary={note.user || "Unknown"}
    />
  </ListItem>
))}

        </List>
      </Paper>
    </Box>

        </div>
  );
};

export default DevelopPage;
