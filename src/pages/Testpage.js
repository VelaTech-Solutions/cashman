import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firestore"; // Firestore instance
import { doc, setDoc } from "firebase/firestore"; // Firestore modular imports
import { storage } from "../firebase/storage"; // Firebase Storage instance
import { motion } from "framer-motion";
import "../styles/tailwind.css";

const Testpage = () => {
  const [clientDetails, setClientDetails] = useState({
    idNumber: "",
    bankName: "",
  });
  const [bankStatements, setBankStatements] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setBankStatements(Array.from(e.target.files));
  };

  // Submit ID number and bank name to Firestore
  const handleSubmitID = async () => {
    const { idNumber, bankName } = clientDetails;

    if (!idNumber || !bankName) {
      alert("Please fill in the ID Number and select a Bank.");
      return;
    }

    try {
      const clientDocRef = doc(db, "clients", idNumber);
      await setDoc(clientDocRef, {
        idNumber,
        bankName,
        timestamp: new Date(),
      });
      alert("✅ ID Number and Bank Name submitted successfully!");
    } catch (error) {
      console.error("Error submitting ID Number:", error);
      alert("❌ Failed to submit ID Number.");
    }
  };

  // Submit bank statements to Firebase Storage
  const handleSubmitStatements = async () => {
    const { idNumber } = clientDetails;

    if (!idNumber || bankStatements.length === 0) {
      alert("Please fill in the ID Number and upload bank statements.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(new Array(bankStatements.length).fill(0));

    try {
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
              console.error("Error uploading file:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`File uploaded: ${file.name}, URL: ${downloadURL}`);
              resolve();
            }
          );
        });
      }

      alert("✅ All bank statements uploaded successfully!");
    } catch (error) {
      console.error("Error uploading bank statements:", error);
      alert("❌ Failed to upload bank statements.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <div className="flex-1 p-8">
        <motion.div
          className="space-y-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              Test Page
            </h2>

            {/* ID Number and Bank Name Submission */}
            <div className="space-y-4">
              <motion.input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={clientDetails.idNumber}
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
              <motion.button
                onClick={handleSubmitID}
                className="w-full p-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                Submit ID Number
              </motion.button>
            </div>

            {/* Bank Statements Submission */}
            <div className="space-y-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
              />
              <motion.button
                onClick={handleSubmitStatements}
                className={`w-full p-2 rounded ${
                  isUploading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={isUploading}
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
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Testpage;
