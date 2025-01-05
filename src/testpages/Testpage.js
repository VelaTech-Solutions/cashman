// src/pages/TestPage.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";


// firebase imports
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 


const TestPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus(""); // Reset status
  };

  // Upload file to Firebase Storage
  const handleUploadFile = () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const storageRef = ref(storage, `bank_statements/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatus(`Upload is ${progress.toFixed(2)}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadStatus(`Upload failed: ${error.message}`);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadStatus(`Upload complete! File URL: ${downloadURL}`);
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Firebase Storage</h1>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="fileUpload">Select Bank Statement:</label>
        <input
          type="file"
          id="fileUpload"
          onChange={handleFileChange}
          style={{ marginLeft: "10px", padding: "5px" }}
        />
        <button
          onClick={handleUploadFile}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Upload File
        </button>
      </div>
      {uploadStatus && (
        <div
          style={{
            marginTop: "20px",
            color: uploadStatus.includes("failed") ? "red" : "green",
          }}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default TestPage;
