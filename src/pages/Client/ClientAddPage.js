// src/pages/AddClient.js
import React, { useState, useEffect } from "react";
import "styles/tailwind.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { TextField, Button, Stack, Typography } from "@mui/material";

// Firebase
import { db, storage, auth } from "../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

// ✅ Hardcoded types per bank
const hardcodedBankOptions = {
  "Absa Bank": ["Type A", "Type B"],
  "Capitec Bank": ["Type A", "Type B"],
  "Fnb Bank": ["Type A"],
  "Ned Bank": ["Type A"],
  "Standard Bank": ["Type A"],
  "Tyme Bank": ["Type A"],
};

export default function ClientAddPage() {
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
  const [imageURL, setImageURL] = useState("");

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
          setBankNames(docSnap.data().banks || []);
        }
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };
    fetchBanks();
  }, []);

  const formatBankTypeKey = (rawType) => {
  const noSpaces = rawType.replace(/\s+/g, '');
  // Convert "Type A" -> "typeA"
  if (noSpaces.toLowerCase().startsWith('type') && noSpaces.length > 4) {
    return 'type' + noSpaces[4].toUpperCase() + noSpaces.slice(5);
  }
  return noSpaces;
};

useEffect(() => {
  const fetchImageURL = async () => {
    if (clientDetails.bankName && clientDetails.bankType) {
      const typeKey = formatBankTypeKey(clientDetails.bankType);

      try {
        const configDocRef = doc(
          db,
          "settings",
          "bankOptions",
          clientDetails.bankName,
          "config"
        );
        const configSnap = await getDoc(configDocRef);

        if (configSnap.exists()) {
          const data = configSnap.data();
          const selectedType = data[typeKey];

          if (selectedType?.imageURL) {
            setImageURL(selectedType.imageURL);
          } else {
            setImageURL("");
          }
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        setImageURL("");
      }
    } else {
      setImageURL("");
    }
  };

  fetchImageURL();
}, [clientDetails.bankName, clientDetails.bankType]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "bankName" ? { bankType: "" } : {}),
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file to upload.");
      return null;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus("Invalid file type. Only PDF, JPEG, PNG allowed.");
      return null;
    }

    if (selectedFile.size > maxSize) {
      setUploadStatus("File size exceeds 10MB limit.");
      return null;
    }

    const ext = selectedFile.name.split(".").pop();
    const fileName = `statement_${Date.now()}.${ext}`;
    const storageRef = ref(storage, `bank_statements/${clientDetails.idNumber}/${fileName}`);

    setUploadStatus("Uploading...");

    try {
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      return await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snap) => {
            const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
            setUploadStatus(`Upload is ${progress.toFixed(2)}% done`);
          },
          (err) => {
            console.error("Upload failed:", err);
            setUploadStatus(`Upload failed: ${err.message}`);
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadStatus("Upload complete!");
            resolve(downloadURL);
          }
        );
      });
    } catch (err) {
      setUploadStatus(`Upload error: ${err.message}`);
      return null;
    }
  };

  const handleSubmit = async () => {
    const { idNumber, clientName, clientSurname, bankName } = clientDetails;
    if (!currentUser) return alert("You must be logged in.");
    if (!idNumber || !clientName || !clientSurname || !bankName) {
      return alert("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      const fileURL = await handleUploadFile();
      if (!fileURL) return setIsSubmitting(false);

      const clientDocRef = doc(db, "clients", idNumber);
      await setDoc(
        clientDocRef,
        {
          ...clientDetails,
          bankStatementURL: fileURL,
          userEmail,
          timestamp: new Date(),
          dateCreated: new Date(),
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
      alert("Client details and bank statement uploaded!");
    } catch (err) {
      console.error("Error saving client:", err);
      alert("Error saving data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1700px", mx: "auto" }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6">
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

        {/* Bank Name Dropdown */}
        <FormControl fullWidth>
          <InputLabel id="bank-label">Bank Name</InputLabel>
          <Select
            labelId="bank-label"
            name="bankName"
            value={clientDetails.bankName}
            onChange={handleInputChange}
            input={<OutlinedInput label="Bank Name" />}
          >
            {bankNames.map((bank, idx) => (
              <MenuItem key={idx} value={bank}>
                {bank}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bank Type Dropdown */}
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
              {(hardcodedBankOptions[clientDetails.bankName] || []).map((type, idx) => (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Display image if available */}
        {imageURL && (
          <Box sx={{ mt: 2 }}>
            <img
              src={imageURL}
              alt={`${clientDetails.bankName} ${clientDetails.bankType}`}
              style={{ width: 120, height: 120, objectFit: "contain" }}
            />
          </Box>
        )}

        <Button variant="outlined" component="label">
          Upload Bank Statement
          <input
            type="file"
            hidden
            name="bankStatement"
            accept=".pdf,.jpg,.jpeg,.png"
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
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Note: Please Select the Type of Bank Statement</Typography>
      </Stack>
    </Box>
  );
}
