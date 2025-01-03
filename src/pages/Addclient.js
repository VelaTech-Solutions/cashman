// src/pages/Addclient.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

// firebase imports
import { storage } from "../firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 

const Addclient = () => {
  const [clientDetails, setClientDetails] = useState({
    idNumber: "",
    clientName: "",
    clientSurname: "",
    bankName: "",
  });
  const [bankStatements, setBankStatements] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleFileChange = (e) => {
    setBankStatements(Array.from(e.target.files));
    setUploadCompleted(false);
  };

  const handleSubmit = async () => {
    const { idNumber, clientName, clientSurname, bankName } = clientDetails;

    if (!idNumber || !clientName || !clientSurname || !bankName || bankStatements.length === 0) {
      alert("Please fill in all required fields and upload files.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(new Array(bankStatements.length).fill(0));
    const uploadedFiles = [];

    try {
      const clientDocRef = doc(db, "clients", idNumber);
      await setDoc(
        clientDocRef,
        {
          clientName,
          clientSurname,
          bankName,
          timestamp: new Date(),
        },
        { merge: true }
      );

      for (const [index, file] of bankStatements.entries()) {
        const fileRef = ref(storage, `bank_statements/${idNumber}/${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const newProgress = [...uploadProgress];
              newProgress[index] = Math.round(progress);
              setUploadProgress(newProgress);
            },
            (error) => {
              console.error("File upload error:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFiles.push({
                fileName: file.name,
                downloadURL,
              });
              resolve();
            }
          );
        });
      }

      await updateDoc(clientDocRef, { bankStatements: uploadedFiles });

      alert("All data and files successfully uploaded.");
      setUploadCompleted(true);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while saving data.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <motion.div
        className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg transition-all duration-300`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4">
          <h1 className="text-xl font-semibold text-white">Add Client</h1>
        </div>
        <nav className="space-y-4">
          <Link to="/dashboard" className="hover:text-white transition">
            Back to Dashboard
          </Link>
        </nav>
      </motion.div>

      <div className="flex-1 p-8">
        <motion.div
          className="space-y-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              Capture Clients
            </h2>
            <motion.input
              type="text"
              name="idNumber"
              placeholder="ID Number"
              value={clientDetails.idNumber}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <motion.input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={clientDetails.clientName}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <motion.input
              type="text"
              name="clientSurname"
              placeholder="Client Surname"
              value={clientDetails.clientSurname}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <select
              name="bankName"
              value={clientDetails.bankName}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            >
              <option value="">Select Bank</option>
              <option value="Absa Bank">Absa Bank</option>
              <option value="Capitec Bank">Capitec Bank</option>
              <option value="FNB Bank">FNB Bank</option>
              <option value="Ned Bank">Ned Bank</option>
              <option value="Standard Bank">Standard Bank</option>
              <option value="Tyme Bank">Tyme Bank</option>
            </select>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <motion.button
              onClick={handleSubmit}
              className={`w-full p-2 rounded ${
                isUploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isUploading}
              whileHover={{ scale: isUploading ? 1 : 1.02 }}
            >
              {isUploading ? "Uploading..." : "Submit Bank Statements"}
            </motion.button>
            {uploadProgress.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadProgress.map((progress, index) => (
                  <motion.div
                    key={index}
                    className="bg-green-600 rounded h-2 w-full mb-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                ))}
              </div>
            )}
            {uploadCompleted && (
              <motion.p
                className="text-green-400 text-lg mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                🎉 All files uploaded successfully!
              </motion.p>
            )}
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Addclient;
