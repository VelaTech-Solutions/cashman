import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";
import Sidebar from "../components/Sidebar";

// Firebase imports
import { db, storage } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "/viewclient", label: "View Client", icon: "ph-file-text" },
];

const AddClient = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [clientDetails, setClientDetails] = useState({
    idNumber: "",
    clientName: "",
    clientSurname: "",
    bankName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Fetch authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || "");
    });
    return unsubscribe;
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
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus(
        "Invalid file type. Please upload a PDF, JPEG, or PNG file.",
      );
      return null;
    }

    if (selectedFile.size > maxFileSize) {
      setUploadStatus("File size exceeds the limit of 5MB.");
      return null;
    }

    setUploadStatus("Uploading file...");
    const storageRef = ref(
      storage,
      `bank_statements/${clientDetails.idNumber}/${selectedFile.name}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    return new Promise((resolve, reject) => {
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
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadStatus("Upload complete!");
          resolve(downloadURL);
        },
      );
    });
  };

  const handleSubmit = async () => {
    const { idNumber, clientName, clientSurname, bankName } = clientDetails;

    if (!idNumber || !clientName || !clientSurname || !bankName) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileURL = await handleUploadFile();
      if (!fileURL) return;

      const clientDocRef = doc(db, "clients", idNumber);
      await setDoc(
        clientDocRef,
        {
          idNumber,
          clientName,
          clientSurname,
          bankName,
          bankStatementURL: fileURL,
          timestamp: new Date(),
          userEmail,
        },
        { merge: true },
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Add Client" links={links} />

      {/* Main content */}
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
              <option value="Fnb Bank">Fnb Bank</option>
              <option value="Ned Bank">Ned Bank</option>
              <option value="Standard Bank">Standard Bank</option>
              <option value="Tyme Bank">Tyme Bank</option>
            </select>

            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              Upload Bank Statements
            </h2>
            <motion.input
              type="file"
              name="bankStatement"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />

            <motion.button
              onClick={handleSubmit}
              className={`w-full p-2 rounded ${
                isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </motion.button>

            {submitSuccess && (
              <motion.p
                className="text-green-400 text-lg mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                🎉 Client details saved successfully!
              </motion.p>
            )}
            <p className="text-sm text-gray-400 italic mt-2">
              Note: This feature currently supports processing a single PDF file
              at a time.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default AddClient;
