// src/pages/AddClient.js
import React, { useState, useEffect } from "react";

// Components Imports
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

// Firebase imports
import { db, storage, auth } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "/viewclient", label: "View Client", icon: "ph-file-text" },
];

const ClientAddPage = () => {
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
  const [currentUser, setCurrentUser] = useState(null); // optional

  // Fetch authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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

    // BASIC VALIDATIONS
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus(
        "Invalid file type. Please upload a PDF, JPEG, or PNG file."
      );
      return null;
    }
    if (selectedFile.size > maxFileSize) {
      setUploadStatus("File size exceeds the limit of 5MB.");
      return null;
    }

    // SANITIZE/RANDOMIZE THE FILE NAME
    const timestamp = Date.now();
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf("."));
    const safeName = `statement_${timestamp}${fileExt}`; 
      // e.g. "statement_1678231234567.pdf"

    // CREATE A REFERENCE
    const storageRef = ref(
      storage,
      `bank_statements/${clientDetails.idNumber}/${safeName}`
    );

    setUploadStatus("Uploading file...");

    // UPLOAD
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

    // OPTIONAL: CONFIRM USER IS LOGGED IN
    if (!currentUser) {
      alert("You must be logged in to upload.");
      return;
    }

    // REQUIRED FIELDS
    if (!idNumber || !clientName || !clientSurname || !bankName) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) UPLOAD THE FILE
      const fileURL = await handleUploadFile();
      if (!fileURL) {
        // If upload was invalid or canceled, stop
        setIsSubmitting(false);
        return;
      }

      // 2) SAVE DATA TO FIRESTORE
      const clientDocRef = doc(db, "clients", idNumber);

      await setDoc(
        clientDocRef,
        {
          idNumber,
          clientName,
          clientSurname,
          bankName,
          bankStatementURL: fileURL,
          userEmail,
          timestamp: new Date(),
          dateCreated: new Date(),
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <Sidebar title="Add Client" links={links} />

      <div className="flex-1 p-8">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              Capture Clients
            </h2>
            <input
              type="text"
              name="idNumber"
              placeholder="ID Number"
              value={clientDetails.idNumber}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={clientDetails.clientName}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />
            <input
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
            <input
              type="file"
              name="bankStatement"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-gray-700 text-white shadow-inner"
            />

            {/* Show progress messages (optional) */}
            {uploadStatus && (
              <p className="text-sm text-gray-300 italic mt-1">{uploadStatus}</p>
            )}

            <button
              onClick={handleSubmit}
              className={`w-full p-2 rounded ${
                isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>

            {submitSuccess && (
              <p className="text-green-400 text-lg mt-4">
                🎉 Client details saved successfully!
              </p>
            )}
            <p className="text-sm text-gray-400 italic mt-2">
              Note: This feature currently supports processing a single PDF/image file
              at a time.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientAddPage;
