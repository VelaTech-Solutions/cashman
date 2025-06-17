// src/pages/AddClient.js
import React, { useState, useEffect } from "react";
import "styles/tailwind.css";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { TextField, Button, Stack, Typography } from "@mui/material";

// Firebase Imports
import { db, storage, auth } from "../../firebase/firebase";
import { doc, setDoc, Doc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";


export default function ClientAddPage(props) {

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [clientDetails, setClientDetails] = useState({
    idNumber: "",
    clientName: "",
    clientSurname: "",
    bankName: "",
    bankType: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [bankNames, setBankNames] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserEmail(user?.email || "");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const docRef = doc(db, "settings", "banks"); // Reference to the 'banks' document
        const docSnap = await getDoc(docRef); // Fetch the document snapshot
  
        if (docSnap.exists()) {
          const bankData = docSnap.data().banks; // Retrieve the 'banks' array
          setBankNames(bankData); // Store the array of bank names in state
        } else {
          console.log("No bank data found!");
        }
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };
  
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchBankOptions = async () => {
      try {
        const docRef = doc(db, "settings", "bankOptions");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const bankData = docSnap.data().banks;
          setBankOptions(bankData);
        }
      } catch (error) {
        console.error("Error fetching bank options:", error);
      }
    };

    fetchBankOptions();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "bankName" ? { bankType: "" } : {})  // Reset type if bank changes
    }));
  };


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file to upload.");
      return null;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxFileSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus("Invalid file type. Please upload a PDF, JPEG, or PNG file.");
      return null;
    }
    if (selectedFile.size > maxFileSize) {
      setUploadStatus("File size exceeds the limit of 5MB.");
      return null;
    }

    const timestamp = Date.now();
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf("."));
    const safeName = `statement_${timestamp}${fileExt}`;
    const storageRef = ref(storage, `bank_statements/${clientDetails.idNumber}/${safeName}`);

    setUploadStatus("Uploading file...");

    try {
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      return await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadStatus(`Upload is ${progress.toFixed(2)}% done`);
          },
          (error) => {
            console.error("Upload failed:", error);
            setUploadStatus(`Upload failed: ${error.message}`);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadStatus("Upload complete!");
            resolve(downloadURL);
          }
        );
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus(`Upload error: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    const { idNumber, clientName, clientSurname, bankName } = clientDetails;

    if (!currentUser) {
      alert("You must be logged in to upload.");
      return;
    }

    if (!idNumber || !clientName || !clientSurname || !bankName) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileURL = await handleUploadFile();
      if (!fileURL) {
        setIsSubmitting(false);
        return;
      }

      const clientDocRef = doc(db, "clients", idNumber);

      await setDoc(
        clientDocRef,
        {
          idNumber,
          clientName,
          clientSurname,
          bankName,
          bankType: clientDetails.bankType, // ✅ Add this line
          bankStatementURL: fileURL,
          userEmail,
          timestamp: new Date(),
          dateCreated: new Date(),

          // ✅ Progress field initialized
          progress: {
            captured: true,
            extracted: false,
            categorized: false,
            completed: false,
          },
        },
        { merge: true }
      );

      setSubmitSuccess(true);
      alert("Client details and bank statement uploaded successfully!");
    } catch (error) {
      console.error("Error saving client data:", error);
      alert("An error occurred while saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Client Details
        </Typography>

        <TextField
          name="idNumber"
          label="ID Number"
          value={clientDetails.idNumber}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          name="clientName"
          label="Client Name"
          value={clientDetails.clientName}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          name="clientSurname"
          label="Client Surname"
          value={clientDetails.clientSurname}
          onChange={handleInputChange}
          fullWidth
        />

        {/* Bank Dropdown - from settings/banks */}
        <FormControl fullWidth>
          <InputLabel id="bank-label">Bank Name</InputLabel>
            <Select
              labelId="bank-label"
              name="bankName"
              value={clientDetails.bankName}
              onChange={handleInputChange}
              input={<OutlinedInput label="Bank Name" />}
            >
              {bankNames.map((bank, index) => (
                <MenuItem key={index} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
        </FormControl>

        {/* Type Dropdown - from settings/bankOptions (filtered by selected bank) */}
        {clientDetails.bankName && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="bank-type-label">Bank Type</InputLabel>
              <Select
                labelId="bank-type-label"
                name="bankType"
                value={clientDetails.bankType}
                onChange={handleInputChange}
                input={<OutlinedInput label="Bank Type" />}
              >
                {bankOptions
                  .filter(opt => opt.name.toLowerCase().trim() === clientDetails.bankName.toLowerCase().trim())
                  .map(opt => opt.type) // Get only the type field
                  .filter((type, index, self) => self.indexOf(type) === index) // Remove duplicates
                  .map((type, idx) => (
                    <MenuItem key={idx} value={type}>
                      {type}
                    </MenuItem>
                  ))}
              </Select>
          </FormControl>
        )}

        {clientDetails.bankName && clientDetails.bankType && (
          <Box sx={{ mt: 2 }}>
            <img
              src={
                bankOptions.find(
                  (b) =>
                    b.name.toLowerCase().trim() === clientDetails.bankName.toLowerCase().trim() &&
                    b.type === clientDetails.bankType
                )?.imageUrl
              }
              alt={`${clientDetails.bankName} ${clientDetails.bankType}`}
              style={{ width: 100, height: 100, objectFit: "contain" }}
            />
          </Box>
        )}
        <Button variant="outlined" component="label">
          Upload Bank Statement
          <input
            type="file"
            hidden
            name="bankStatement"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={handleFileChange}
          />
        </Button>

        {uploadStatus && (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            {uploadStatus}
          </Typography>
        )}

        <Button
          onClick={handleSubmit}
          type="submit"
          variant="contained"
          color="success"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </Button>

        {submitSuccess && (
          <Typography color="success.main" variant="body1">
            🎉 Client details saved successfully!
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Note: This feature currently supports processing a single PDF/image file at a time.
        </Typography>
      </Stack>
    </Box>

  );
};