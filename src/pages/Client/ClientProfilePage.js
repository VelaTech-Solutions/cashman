import React, { useEffect, useState } from "react";

// Firebase imports
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, } from "firebase/firestore";

// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table, 
  InputLabel, 
  OutlinedInput,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";

// Component Imports
import { LoadClientData, OverView } from 'components/Common';


// import ClientActions1 from "components/Client/ClientProfile/Actions/ClientActions1";
// import CategorySettingsTransactions from "components/Settings/CategorySettings/Views/TransactionsDatabaseView";




export default function ClientProfilePage({clientId}) {
  const [clientData, setClientData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState(""); 
  const [notes, setNotes] = useState([]); 

  // Fetch client data, Fetch client notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        setClientData(clientData);
        setTransactions(clientData.transactions || []);
        setNotes(clientData.notes || []); 

      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
  
    fetchData();
  }, [clientId]);

  // Handle add client notes
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert("Note cannot be empty.");
      return;
    }

    try {
      const clientRef = doc(db, "clients", clientId);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        const updatedNotes = [
          ...existingNotes,
          {
            // User: userEmail,
            content: note,
            timestamp: new Date().toISOString(),
          }, // Add new note
        ];

        await updateDoc(clientRef, { notes: updatedNotes }); // Update Firestore document
        setNotes(updatedNotes); // Update local state
        setNote(""); // Clear the input
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note.");
    }
  };

  // Function to delete a note from a client's notes array
  const deleteNote = async (noteIndex) => {
    try {
      const clientRef = doc(db, "clients", clientId);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        existingNotes.splice(noteIndex, 1); // Remove note by index

        await updateDoc(clientRef, { notes: existingNotes }); // Update Firestore document
        setNotes(existingNotes); // Update local state
        alert("Note deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting note: ", error);
      alert("Failed to delete note.");
    }
  };

  // Function to delete all notes
  const deleteAllNotes = async () => {
    try {
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, { notes: [] });
      setNotes([]);
      alert("All notes deleted successfully!");
    } catch (error) {
      console.error("Error deleting all notes:", error);
      alert("Failed to delete all notes.");
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Client Profile
        </Typography>

        <OverView transactions={transactions} />

        {/* ID */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          ID: {clientData && clientData.idNumber}
        </Typography>
        {/* Name */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Name: {clientData && clientData.clientName}
        </Typography>
        {/* Surname */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Surname: {clientData && clientData.clientSurname}
        </Typography>
        {/* Email */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Email: {clientData && clientData.clientEmail}
        </Typography>
        {/* Bank Name */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Bank Name: {clientData && clientData.bankName}
        </Typography>
        {/* Bank Statment */}
        {clientData?.bankStatementURL && (
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Bank Statement:&nbsp;
            <a
              href={clientData.bankStatementURL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}
            >
              Download Statement
            </a>
          </Typography>
        )}
        {/* Bank Type */}
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Bank Type: {clientData && clientData?.bankType}
        </Typography>
        {/* Notes Box */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notes:
          </Typography>
          <TextField
            label="Add Note"
            variant="outlined"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddNote}>
            Add Note
          </Button>
        </Box>

        {/* just for now i need to add the field bankType to the clientData create a something for me to add an type the type */}
        {/* {clientData && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Bank Type: for Debug only
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="bank-type-label">Select Bank Type</InputLabel>
              <Select
                labelId="bank-type-label"
                value={clientData.bankType || ""}
                onChange={(e) =>
                  setClientData((prev) => ({
                    ...prev,
                    bankType: e.target.value,
                  }))
                }
                input={<OutlinedInput label="Select Bank Type" />}
              >
                <MenuItem value="Type A">Type A</MenuItem>
                <MenuItem value="Type B">Type B</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              sx={{ mt: 1 }}
              onClick={async () => {
                try {
                  const clientRef = doc(db, "clients", clientId);
                  await updateDoc(clientRef, { bankType: clientData.bankType });
                  alert("Bank type updated!");
                } catch (err) {
                  console.error("Failed to update bankType:", err);
                  alert("Error updating bank type.");
                }
              }}
            >
              Save Bank Type
            </Button>
          </Box>
        )} */}



      </Stack>
    </Box>
  );
};


