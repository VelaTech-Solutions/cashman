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
    bankType: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [bankNames, setBankNames] = useState([]);
  const [bankType, setBankType] = useState([]);

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
      const docRef = doc(db, "settings", "banks");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const banks = docSnap.data().banks || [];
        const types = docSnap.data().bankTypes || [];

        // Group bank types by name
        const bankMap = {};
        banks.forEach((bank) => {
          bankMap[bank] = {
            name: bank,
            types: [],
          };
        });

        types.forEach((item) => {
          if (item.name && item.type && item.imageUrl) {
            if (!bankMap[item.name]) {
              bankMap[item.name] = { name: item.name, types: [] };
            }
            bankMap[item.name].types.push({
              type: item.type,
              imageUrl: item.imageUrl,
            });
          }
        });

        setBankNames(Object.values(bankMap));
      } else {
        console.log("No bank data found!");
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
    }
  };

  fetchBanks();
}, []);


  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
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
          bankType: clientDetails.bankType, // ✅ add this
          // bankType, // <-- Save the type
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
        {/* want to keep this basic */}
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
  <MenuItem key={index} value={bank.name}>
    {bank.name}
  </MenuItem>
))}

          </Select>
        </FormControl>
{/* getting this error when selecting now */}
        {/* Uncaught runtime errors:
×
ERROR
Objects are not valid as a React child (found: object with keys {name, imageUrl, type}). If you meant to render a collection of children, use an array instead.
    at throwOnInvalidObjectType (http://localhost:3000/static/js/bundle.js:268586:11)
    at createChild (http://localhost:3000/static/js/bundle.js:268679:9)
    at reconcileChildrenArray (http://localhost:3000/static/js/bundle.js:268779:66)
    at reconcileChildFibersImpl (http://localhost:3000/static/js/bundle.js:268886:109)
    at http://localhost:3000/static/js/bundle.js:268913:31
    at reconcileChildren (http://localhost:3000/static/js/bundle.js:269175:47)
    at beginWork (http://localhost:3000/static/js/bundle.js:269930:1565)
    at runWithFiberInDEV (http://localhost:3000/static/js/bundle.js:265356:68)
    at performUnitOfWork (http://localhost:3000/static/js/bundle.js:271937:93)
    at workLoopSync (http://localhost:3000/static/js/bundle.js:271830:38) */}

        {/* under here we can display the types plus then user must chose the type display the types with small img */}
{clientDetails.bankName && (
  <>
    <Typography variant="subtitle1" sx={{ mt: 2 }}>
      Select Statement Type:
    </Typography>

    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", mt: 1 }}>
      {bankNames
        .find((bank) => bank === clientDetails.bankName || bank.name === clientDetails.bankName)
        ?.types?.map((typeObj, index) => (
          <Button
            key={index}
            variant={
              clientDetails.bankType === typeObj.type ? "contained" : "outlined"
            }
            onClick={() =>
              setClientDetails((prev) => ({ ...prev, bankType: typeObj.type }))
            }
            sx={{ display: "flex", flexDirection: "column", p: 1, minWidth: 100 }}
          >
            <img
              src={typeObj.imageUrl}
              alt={typeObj.type}
              style={{ maxHeight: 40, marginBottom: 4 }}
            />
            {typeObj.type}
          </Button>
        ))}
    </Stack>
  </>
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

        {/* select type here */}




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