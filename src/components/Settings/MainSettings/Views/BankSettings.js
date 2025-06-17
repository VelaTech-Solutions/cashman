import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Paper, Stack, Typography
} from "@mui/material";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/firebase";

export default function BankSettings() {
  const [bankName, setBankName] = useState("");
  const [bankType, setBankType] = useState("");
  const [bankImage, setBankImage] = useState(null);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState("");

  // Fetch banks from bankOptions.banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const settingsRef = doc(db, "settings", "bankOptions");
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBanks(data.banks || []);
        }
      } catch (error) {
        console.error("Error fetching banks: ", error);
      }
    };
    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bankName || !bankType || !bankImage) {
      setError("All fields are required.");
      return;
    }

    try {
      const imageRef = ref(storage, `bankImages/${bankName}_${Date.now()}`);
      await uploadBytes(imageRef, bankImage);
      const imageUrl = await getDownloadURL(imageRef);

      const newBank = {
        name: bankName,
        type: bankType,
        imageUrl,
      };

      const settingsRef = doc(db, "settings", "bankOptions");
      const docSnap = await getDoc(settingsRef);
      const existingBanks = docSnap.exists() ? docSnap.data().banks || [] : [];

      // Check for duplicates
      if (existingBanks.some(b => b.name === bankName)) {
        alert("Bank already exists.");
        return;
      }

      const updatedBanks = [...existingBanks, newBank];
      await setDoc(settingsRef, { banks: updatedBanks });

      setBanks(updatedBanks);
      setBankName("");
      setBankType("");
      setBankImage(null);
      setError("");
      alert("Bank added successfully!");
    } catch (err) {
      console.error("Error adding bank:", err);
      setError("Failed to add bank.");
    }
  };

  const handleDelete = async (bankNameToDelete) => {
    try {
      const settingsRef = doc(db, "settings", "bankOptions");
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const existingBanks = docSnap.data().banks || [];
        const updatedBanks = existingBanks.filter(b => b.name !== bankNameToDelete);
        await setDoc(settingsRef, { banks: updatedBanks });
        setBanks(updatedBanks);
        alert("Bank deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting bank: ", error);
      alert("Failed to delete bank.");
    }
  };

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
            label="Bank Type"
            value={bankType}
            onChange={(e) => setBankType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setBankImage(e.target.files[0])}
            />
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
          >
            Add Bank
          </Button>
        </form>

        {/* Bank List */}
        <Box>
          <Typography variant="h6" sx={{ mt: 4 }}>Existing Banks</Typography>
          {banks.length > 0 ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {banks.map((bank, index) => (
                <Paper
                  key={index}
                  sx={{
                    border: '1px solid',
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography><strong>{bank.name}</strong> ({bank.type})</Typography>
                    {bank.imageUrl && (
                      <img
                        src={bank.imageUrl}
                        alt={`${bank.name} logo`}
                        style={{ height: 40, marginTop: 8 }}
                      />
                    )}
                  </Box>
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
