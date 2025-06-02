import React, { useState, useEffect } from 'react';
// Mui Imports
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Stack, 
  Typography, 
  Grid, 
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Firebase Imports
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebase";

export default function BankSettings() {

  const [bankName, setBankName] = useState(""); // State to store the bank name
  const [banks, setBanks] = useState([]); // State to store the list of banks
  const [error, setError] = useState(""); // For error handling

  const handleInputChange = (e) => {
    setBankName(e.target.value); // Update state when the input changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (bankName.trim() === "") {
      setError("Bank name cannot be empty");
      return;
    }

    try {
      // Reference to the 'banks' collection inside the 'settings' document
      const settingsRef = doc(db, "settings", "banks");

      // Check if the 'banks' field exists in the settings document
      const docSnap = await getDoc(settingsRef);
      
      if (!docSnap.exists()) {
        // If the collection doesn't exist, create it and add the first bank name
        await setDoc(settingsRef, {
          banks: [bankName], // Create the 'banks' field as an array and add the first bank
        });

        alert("Bank added successfully!");
      } 
      
      else {
        // If the collection exists, just add the bank name to the existing list
        const existingBanks = docSnap.data().banks || [];
        existingBanks.push(bankName);

        // Update the 'banks' field with the new bank name
        await setDoc(settingsRef, { banks: existingBanks });


        // Update the state
        setBanks([...existingBanks]); 
        alert("Bank added successfully!");
      }

      setBankName(""); // Clear the input field
      setError(""); // Clear error message

    } catch (error) {
      console.error("Error adding bank: ", error);
      setError("Error adding bank");
    }
  };

  const handleDelete = async (bankNameToDelete) => {
    try {
      // Reference to the 'banks' collection inside the 'settings' document
      const settingsRef = doc(db, "settings", "banks");

      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const existingBanks = docSnap.data().banks || [];

        // Remove the bank from the list
        const updatedBanks = existingBanks.filter((bank) => bank !== bankNameToDelete);

        // Update Firestore with the new list of banks
        await setDoc(settingsRef, { banks: updatedBanks });

        // Update the state with the new list of banks
        setBanks(updatedBanks);
        

        alert("Bank deleted successfully!");
      } else {
        alert("No banks found to delete");
      }

    } catch (error) {
      console.error("Error deleting bank: ", error);
      alert("Error deleting bank");
    }
  };

  // Fetch the bank names from Firestore when the component mounts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        // Reference to the 'settings' document
        const settingsRef = doc(db, "settings", "banks");
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const bankList = docSnap.data().banks || []; // Retrieve the banks array
          setBanks(bankList); // Store the bank names in the state
        }
      } catch (error) {
        console.error("Error fetching banks: ", error);
      }
    };

    fetchBanks(); // Call the fetch function
  }, []); // The empty dependency array ensures this effect only runs once when the component mounts

  return (
     <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
       {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
         Bank Settings
       </Typography> */}
        <Stack spacing={2}>
          <form onSubmit={handleSubmit}>
            <TextField
              name="bankName"
              label="Bank Name"
              value={bankName}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              sx={{ mb: 2 }}
            >
              Add Bank
            </Button>
            
            {/* List of Banks */}
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
                      }}
                    >
                      <Typography>{bank}</Typography>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(bank)}
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
          </form>
        </Stack>
      </Box>
  );
};

