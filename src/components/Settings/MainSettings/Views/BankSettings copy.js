import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Stack,
  Typography,
  MenuItem,
} from "@mui/material";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/firebase";
import { v4 as uuidv4 } from "uuid";

export default function BankSettings() {
  const [bankName, setBankName] = useState("");
  const [statementType, setStatementType] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bankName || !statementType || !imageFile) {
      setError("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const settingsRef = doc(db, "settings", "banks");
      const docSnap = await getDoc(settingsRef);
      const existingBanks = docSnap.exists() ? docSnap.data().banks || [] : [];

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `bankImages/${uuidv4()}_${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // Add new bank entry
      const newBank = {
        name: bankName,
        type: statementType,
        imageUrl,
      };

      const updatedBanks = [...existingBanks, newBank];
      await setDoc(settingsRef, { banks: updatedBanks });

      // Reset form
      setBanks(updatedBanks);
      setBankName("");
      setStatementType("");
      setImageFile(null);
      setError("");
      alert("Bank added successfully!");
    } catch (error) {
      console.error("Error adding bank: ", error);
      setError("Failed to add bank.");
    }
  };

  const handleDelete = async (bankNameToDelete) => {
    try {
      const settingsRef = doc(db, "settings", "banks");
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        const existingBanks = docSnap.data().banks || [];
        const updatedBanks = existingBanks.filter(
          (bank) => bank.name !== bankNameToDelete
        );
        await setDoc(settingsRef, { banks: updatedBanks });
        setBanks(updatedBanks);
        alert("Bank deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting bank: ", error);
      alert("Error deleting bank.");
    }
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const settingsRef = doc(db, "settings", "banks");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const bankList = docSnap.data().banks || [];
          setBanks(bankList);
        }
      } catch (error) {
        console.error("Error fetching banks: ", error);
      }
    };
    fetchBanks();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Statement Type"
            value={statementType}
            onChange={(e) => setStatementType(e.target.value)}
            select
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Type A">Type A</MenuItem>
            <MenuItem value="Type B">Type B</MenuItem>
            <MenuItem value="Type C">Type C</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Bank Statement Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </Button>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
          >
            Add Bank
          </Button>
        </form>

        <Box>
          {banks.length > 0 ? (
            <Stack spacing={1}>
              {banks.map((bank, index) => (
                <Paper
                  key={index}
                  sx={{
                    border: '1px solid',
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2
                  }}
                >
                  <Box sx={{ minWidth: 200 }}>
                    <Typography><strong>{bank.name}</strong></Typography>
                    <Typography variant="body2">Type: {bank.type}</Typography>
                  </Box>
                  {bank.imageUrl && (
                    <img
                      src={bank.imageUrl}
                      alt={bank.name}
                      style={{ width: 100, height: 'auto', objectFit: 'contain' }}
                    />
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(bank.name)}
                  >
                    Delete
                  </Button>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography>No banks available</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

// i want to add type, like i want add a bank but also the type of statement and a img of it 
// absa type A  type B

// i see that banks have different types formats

//im importing the firestorage