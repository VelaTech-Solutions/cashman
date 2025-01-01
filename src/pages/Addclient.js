// src/pages/Addclient.js
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/storage";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

const Addclient = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    idNumber: "",
    clientName: "",
    clientSurname: "",
    bankName: "",
  });
  const [bankStatements, setBankStatements] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessages, setUploadMessages] = useState([]);
  const [uploadCompleted, setUploadCompleted] = useState(false); // Track upload completion
  const auth = getAuth();

  // Track authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("Not logged in");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setBankStatements(Array.from(e.target.files));
    setUploadCompleted(false); // Reset upload completion status on new file selection
  };

  // Handle form submission
  const handleSubmit = async () => {
    const { idNumber, bankName } = clientDetails;

    if (bankStatements.length === 0 || !idNumber || !bankName) {
      setUploadMessages(["Please fill in all required fields and upload files."]);
      return;
    }

    setIsUploading(true);
    setUploadProgress(new Array(bankStatements.length).fill(0));
    setUploadCompleted(false); // Reset upload completion status

    const newUploadMessages = [];
    const newUploadProgress = [...uploadProgress];

    for (const [index, file] of bankStatements.entries()) {
      const fileNumber = String(index + 1).padStart(3, "0");

      try {
        const fileRef = ref(
          storage,
          `bank_statements/${idNumber}/${fileNumber}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            newUploadProgress[index] = Math.round(progress);
            setUploadProgress([...newUploadProgress]);
          },
          (error) => {
            console.error(`Failed to upload ${file.name}`, error);
            newUploadMessages.push(`Failed to upload ${file.name}.`);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            newUploadMessages.push(`Uploaded ${file.name}: ${downloadURL}`);
            if (index === bankStatements.length - 1) {
              setUploadCompleted(true); // Mark upload as completed
            }
          }
        );
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        newUploadMessages.push(`Error uploading ${file.name}.`);
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadMessages(newUploadMessages);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <motion.div
        className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg transition-all duration-300 ${
          sidebarOpen ? "block" : "hidden lg:block"
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4">
          <img
            src="https://assets.codepen.io/285131/almeria-logo.svg"
            alt="Logo"
            className="w-8 h-8"
          />
          <h1 className="text-xl font-semibold text-white">Add Client</h1>
        </div>
        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 hover:text-white transition"
          >
            <i className="ph-check-square text-xl"></i>
            <span>Back to Dashboard</span>
          </Link>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>{userEmail}</span>
              <img
                src="https://img.icons8.com/pastel-glyph/100/person-male--v1.png"
                alt="User Avatar"
                className="w-10 h-10 rounded-full shadow-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Section */}
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
            <div className="space-y-4">
              <motion.input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={clientDetails.idNumber}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white shadow-inner focus:ring-2 focus:ring-green-400"
              />
              <motion.input
                type="text"
                name="clientName"
                placeholder="Client Name"
                value={clientDetails.clientName}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white shadow-inner focus:ring-2 focus:ring-green-400"
              />
              <motion.input
                type="text"
                name="clientSurname"
                placeholder="Client Surname"
                value={clientDetails.clientSurname}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 text-white shadow-inner focus:ring-2 focus:ring-green-400"
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
                  isUploading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
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
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Addclient;
