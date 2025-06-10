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
  CircularProgress,
} from "@mui/material";
import { doc, getDoc, setDoc  } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; 
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, auth, storage  } from "../firebase/firebase";

const configDoc = () => doc(db, "settings", "developnote");

export default function DevelopPage() {
  const [notesLines, setNotesLines] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [userEmail, setUserEmail] = useState("Unknown");
  const [imageFile, setImageFile] = useState(null); 
  const [loading, setLoading] = useState(false);

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

  // inside addNoteLine()
  const addNoteLine = async () => {
    const input = document.querySelector("#notesLineInput");
    const value = input.value.trim();
    if (!value && !imageFile) return;

    setLoading(true); 
    let imageUrl = null;

      
    try {
      if (imageFile) {
        const imgRef = ref(storage, `notesImages/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }

      const newNote = {
        text: value,
        user: userEmail,
        timestamp: Date.now(),
        imageUrl: imageUrl,
      };

      const updated = [...notesLines, newNote];
      await setDoc(configDoc(), { notesLines: updated }, { merge: true });
      setNotesLines(updated);
      input.value = "";
      setImageFile(null);

    } catch (err) {
      
      console.error("Failed to add note:", err);
    
    } finally {
      setLoading(false); // stop loading
    
    }
  };

  const extractStoragePath = (url) => {
    try {
      const base = "https://firebasestorage.googleapis.com/v0/b/";
      const pathStart = url.indexOf("/o/") + 3;
      const pathEnd = url.indexOf("?");
      const encodedPath = url.substring(pathStart, pathEnd);
      return decodeURIComponent(encodedPath); // turns %2F into /
    } catch (e) {
      console.error("Failed to extract storage path from imageUrl", e);
      return null;
    }
  };

  const deleteSelectedLines = async () => {
    const notesToDelete = notesLines.filter((_, i) => selectedNotes.has(i));

    const deletePromises = notesToDelete
      .filter(note => note.imageUrl)
      .map(async (note) => {
        try {
          const path = extractStoragePath(note.imageUrl);
          if (path) {
            const imageRef = ref(storage, path);
            await deleteObject(imageRef);
          }
        } catch (error) {
          console.error("Error deleting image from storage:", error);
        }
      });

    await Promise.all(deletePromises);

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
            <Button 
              variant="contained" 
              color="success" 
              onClick={addNoteLine} 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Sending" : "Send"}
            </Button>
            <Button variant="contained" color="error" onClick={deleteSelectedLines}>Delete</Button>
            <Button variant="contained" component="label">
              Upload
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Button>
          </Box>
          {imageFile && (
            <Typography variant="caption" sx={{ mt: 1 }}>
              Selected Image: {imageFile.name}
            </Typography>
          )}
        </Paper>
        <Paper sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
          <List>
            {notesLines
              .map((note, index) => ({ note, index }))
              .reverse()
              .map(({ note, index }) => (
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
                    {note.imageUrl && (
                      <img
                        src={note.imageUrl}
                        alt="note"
                        style={{ maxWidth: "100%", borderRadius: 4, marginBottom: 8 }}
                      />
                    )}
                    <Typography variant="body1">
                      {typeof note === "string" ? note : note.text}
                    </Typography>
                    <Typography variant="caption">
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