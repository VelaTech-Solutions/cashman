// src/pages/Teststorage.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

// firebase imports
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 

const Teststorage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

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
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">Upload File to Firebase Storage</h1>
            <input
                type="file"
                onChange={handleFileChange}
                className="mb-4"
            />
            <button
                onClick={handleUploadFile}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                Upload File
            </button>
            <p className="mt-4">{uploadStatus}</p>
            <Link to="/dashboard">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    Back to Dashboard
                </motion.button>
            </Link>
        </div>
    );
};

export default Teststorage;