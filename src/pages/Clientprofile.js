import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";
import Sidebar from "../components/Sidebar";

// firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../firebase/firebase";
import { doc, getDoc, deleteDoc, updateDoc, deleteField, setDoc  } from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { filter } from "framer-motion/client";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
];

const Clientprofile = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState(""); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rawData, setRawData] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function

  const [processingMethod, setProcessingMethod] = useState("pdfparser"); // Default to PDF Parser
  const PROCESS_METHODS = {
    PDF_PARSER: "pdfparser",
    OCR: "ocr",
  };


  const [newLine, setNewLine] = useState(""); // To manage the input for new lines
  const [removalLines, setRemovalLines] = useState([]);

  const [viewRemovedLinesOpen, setViewRemovedLinesOpen] = useState(false);

  const [removalDropdownOpen, setRemovalDropdownOpen] = useState(false); // Initialize dropdown state
  const [addLineDropdownOpen, setAddLineDropdownOpen] = useState(false);
  const [removalSidebarOpen, setRemovalSidebarOpen] = useState(false);
  const [removeLineDropdownOpen, setRemoveLineDropdownOpen] = useState(false);
  const [filteredSidebarOpen, setFilteredSidebarOpen] = useState(false);



  // Debugging remove when done
  const DEBUG = true; // Set to false to disable debug logs globally

  const logDebug = (message, data = null) => {
    if (DEBUG) {
      if (data) {
        console.log(`DEBUG: ${message}`, data);
      } else {
        console.log(`DEBUG: ${message}`);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientDoc = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          const data = clientSnapshot.data();
          setClientData(data); // Set client data including all fields
          setRawData(data.rawData || "No raw data available"); // Set rawData or default message

          const folderRef = ref(storage, `bank_statements/${id}/`);
          const fileList = await listAll(folderRef);
          const urls = await Promise.all(
            fileList.items.map((item) => getDownloadURL(item)),
          );
          setFileLinks(urls);
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch user email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("Not logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch client data with notes
  useEffect(() => {
    const fetchClientNotes = async () => {
      try {
        const clientRef = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientRef);

        if (clientSnapshot.exists()) {
          const clientData = clientSnapshot.data();
          console.log("DEBUG: Client Data", clientData);

          setNotes(clientData.notes || []); // Set notes or empty array
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching client notes:", err);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientNotes();
  }, [id]);

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert("Note cannot be empty.");
      return;
    }

    try {
      const clientRef = doc(db, "clients", id);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        const updatedNotes = [
          ...existingNotes,
          {
            User: userEmail,
            content: note,
            timestamp: new Date().toISOString(),
          }, // Add new note
        ];

        await updateDoc(clientRef, { notes: updatedNotes }); // Update Firestore document
        setNotes(updatedNotes); // Update local state
        setNote(""); // Clear the input
      }
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note.");
    }
  };

  // Function to delete a note from a client's notes array
  const deleteNote = async (noteIndex) => {
    try {
      const clientRef = doc(db, "clients", id);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        existingNotes.splice(noteIndex, 1); // Remove note by index

        await updateDoc(clientRef, { notes: existingNotes }); // Update Firestore document
        setNotes(existingNotes); // Update local state
        alert("Note deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting note: ", error);
      alert("Failed to delete note.");
    }
  };

  // Function to delete all notes
  const deleteAllNotes = async () => {
    try {
      // Reference to the specific client document
      const clientRef = doc(db, "clients", id);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        // Get the existing notes from the client's document
        const existingNotes = clientSnapshot.data().notes || [];

        // Remove all notes (empty array)
        const updatedNotes = [];

        // Update the Firestore document with an empty notes array
        await updateDoc(clientRef, { notes: updatedNotes });

        // Optionally update local state
        setNotes(updatedNotes); // Clear the local state
        alert("All notes deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting all notes:", error);
      alert("Failed to delete all notes.");
    }
  };

  // Function to handle deletion of client data
  const handleDeleteClient = async () => {
    try {
      // Delete client document from Firestore
      await deleteDoc(doc(db, "clients", id));

      // Delete associated files from Storage
      const folderRef = ref(storage, `bank_statements/${id}/`);
      const files = await listAll(folderRef);
      for (const file of files.items) {
        await deleteObject(ref(storage, file.fullPath));
      }

      alert("Client and associated data successfully deleted.");
    } catch (err) {
      console.error("Error deleting client data:", err);
      alert("Failed to delete client data. Please try again.");
    }
  };
  // Function to handle deletion of extracted data
  const handleDeleteExtractedData = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }
  
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all extracted data? This action cannot be undone."
    );
  
    if (!confirmDelete) return;
  
    try {
      // Reference the Firestore document for this client using the ID
      const clientRef = doc(db, "clients", id);
  
      // Remove the specific fields from the document
      await updateDoc(clientRef, {
        rawData: deleteField(),
        transactions: deleteField(),
        number_of_transactions: deleteField(),
      });

      alert("Extracted data deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting extracted data:", error);
      alert("Failed to delete extracted data. Please try again.");
    }
  };
  

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientDoc = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          setClientData(clientSnapshot.data());
          const folderRef = ref(storage, `bank_statements/${id}/`);
          const fileList = await listAll(folderRef);
          const urls = await Promise.all(
            fileList.items.map((item) => getDownloadURL(item)),
          );
          setFileLinks(urls);
          console.log(fileLinks);
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading client data and files...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Handle data extraction
  const handleExtractData = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: id,
            bankName: clientData.bankName,
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
            // lines to be deleted
            // linesToDelete: linesToDelete, push removed list to backend
            // linesToDelete: removedLines,

          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }

      const result = await response.json();
      alert(result.message || "Data extracted successfully!");

    // Refresh the page by reloading
    window.location.reload();
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage(
        "An error occurred while extracting data. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle list for lines to be deleted by bank name
  const handleAddLine = async (bankName, line) => {
    if (!line.trim()) {
      alert("Please enter a valid line.");
      return;
    }
  
    try {
      const bankRef = doc(db, "banks", bankName); // Reference the bank document
      const bankSnapshot = await getDoc(bankRef);
  
      let currentLines = [];
      if (bankSnapshot.exists()) {
        currentLines = bankSnapshot.data().removalLines || [];
      } else {
        console.log("Creating new bank document:", bankName);
      }
  
      const updatedLines = [...currentLines, line]; // Add the new line
  
      // Create or update the document with the new removalLines
      await setDoc(bankRef, { removalLines: updatedLines }, { merge: true });
  
      setRemovalLines(updatedLines); // Update state for UI
      setNewLine(""); // Clear input field
      alert("Line added successfully!");
    } catch (error) {
      console.error("Error adding line:", error);
      alert("Failed to add line. Please try again.");
    }
  };
  
  // Handle view removal lines
  const handleViewRemovedLines = () => {
    if (!viewRemovedLinesOpen) {
      fetchRemovalLines(clientData.bankName); // Fetch lines only when opening the dropdown
    }
    setViewRemovedLinesOpen(!viewRemovedLinesOpen); // Toggle the dropdown state
  };
  // Fetch removal lines
  const fetchRemovalLines = async (bankName) => {
    try {
      const bankRef = doc(db, "banks", bankName); // Reference the bank document
      const bankSnapshot = await getDoc(bankRef);
  
      if (bankSnapshot.exists()) {
        const lines = bankSnapshot.data().removalLines || []; // Fetch removalLines or set default to []
        setRemovalLines(lines); // Update the state with fetched lines
      } else {
        console.log("No bank document found for:", bankName);
        setRemovalLines([]); // Clear the state if no document exists
      }
    } catch (error) {
      console.error("Error fetching removal lines:", error);
      alert("Failed to load removal lines. Please try again.");
    }
  };
  

  const handleRemoveLine = async (index) => {
    if (index < 0 || index >= removalLines.length) {
      alert("Invalid line index.");
      return;
    }
  
    try {
      // Create a copy of the current lines and remove the selected line
      const updatedLines = [...removalLines];
      updatedLines.splice(index, 1); // Remove the line at the given index
  
      // Update Firestore with the updated list
      const bankRef = doc(db, "banks", clientData.bankName); // Reference the Firestore document
      await updateDoc(bankRef, { removalLines: updatedLines }); // Save the new list
  
      // Update local state
      setRemovalLines(updatedLines);
  
      alert("Line removed successfully!");
    } catch (error) {
      console.error("Error removing line:", error);
      alert("Failed to remove line. Please try again.");
    }
  };
  
  // handle view filtered data
  const handleViewFilteredData = () => {
    setFilteredSidebarOpen(!filteredSidebarOpen);
  };
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      

      {/* Sidebar */}
      <Sidebar title="Client Profile" links={links} />


      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Client Profile</h1>
        </header>

        {/* Client Profile */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h2 className="text-4xl font-bold mb-4 text-blue-400">
              {clientData.clientName} {clientData.clientSurname}
            </h2>
            {/* Line */}
            <div className="w-full h-1 bg-gray-700 mb-4"></div>
            <p className="text-lg text-gray-400 mt-2">
              <span className="font-bold text-white">ID:</span> {id}
            </p>
            <p className="text-lg text-gray-400 mt-1">
              <span className="font-bold text-white">Bank:</span>{" "}
              {clientData.bankName}
            </p>
            <p className="text-lg text-gray-400 mt-1">
              <span className="font-bold text-white">Captured by:</span>{" "}
              {clientData.userEmail}
            </p>
            <p className="text-lg text-gray-400 mt-1">
              <span className="font-bold text-white">Date Captured:</span>{" "}
              {clientData.dateCaptured}
            </p>
            <p className="text-lg text-gray-400 mt-1">
              <span className="font-bold text-white">Last Updated:</span>{" "}
              {clientData.lastUpdated}
            </p>
            <p className="text-lg text-gray-400 mt-1">
              <span className="font-bold text-white">Total Transactions:</span>{" "}
              {clientData.number_of_transactions || 0}
            </p>
          </div>
        </div>

        {/* Buttons Stacked Vertically */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          {/* Section Header */}
          <h1 className="text-4xl font-bold mb-4 text-blue-400">Actions</h1>

          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            {/* <h2 className="text-2xl font-semibold text-white mb-4">
            Manage Extracted Data
          </h2> */}

            <div className="flex flex-col gap-4 mt-4">
              {/* Profile */}
              <Link
                to={`/client/${id}/profile`}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60 text-center"
              >
                Profile
              </Link>

              {/* View Transactions */}
              <Link
                to={`/client/${id}/transactions`}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60 text-center"
              >
                View Transactions
              </Link>

              {/* Edit Transactions */}
              <Link
                to={`/client/${id}/edit-transactions`}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60 text-center"
              >
                Edit Transactions
              </Link>

              {/* Categorize Transactions */}
              <Link
                to={`/client/${id}/categorize`}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60 text-center"
              >
                Categorize Transactions
              </Link>

              {/* View Reports */}
              <Link
                to={`/client/${id}/reports`}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60 text-center"
              >
                View Reports
              </Link>

              {/* Delete Client Data */}
              <div>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm w-60"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this client?",
                      )
                    ) {
                      handleDeleteClient();
                    }
                  }}
                >
                  Delete Client Data
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Extract Transactions Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          {/* Section Header */}
          <h1 className="text-4xl font-bold mb-4 text-blue-400">
            Extract Transactions
          </h1>

          {/* Parser Options */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Parser Options
            </h2>
            <p className="text-sm text-white">
              <strong>Choose a method to process your file:</strong>
              <br />- Use <strong>PDF Parser</strong> for selectable text.
              <br />- Use <strong>OCR</strong> for scanned or image-based files.
              Not Working for now
            </p>

            {/* Dropdown for Processing Method */}
            <div className="mt-4">
              <label
                htmlFor="processing-method"
                className="text-white text-sm font-medium mb-2 block"
              >
                Choose File Processing Method:
              </label>
              <select
                id="processing-method"
                className="bg-gray-800 text-white py-2 px-3 rounded text-sm w-full"
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value)}
              >
                <option value={PROCESS_METHODS.PDF_PARSER}>PDF Parser</option>
                <option value={PROCESS_METHODS.OCR}>OCR</option>
              </select>
            </div>
          </div>


          {/* Extract and Manage Options */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Manage Extracted Data
            </h2>

            {/* Extract Data Button */}
            <div className="w-full">
              <button
                className={`mt-4 w-full py-2 px-4 rounded ${
                  isProcessing
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
                onClick={handleExtractData}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Extract Bank Statement Transactions"
                )}
              </button>

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 mt-4" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-4">
              
              {/* Delete Extracted Data Button */}
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-full"
                onClick={handleDeleteExtractedData}
              >
                Delete Extracted Data
              </button>

              {/* Add Removal Line Dropdown */}
              <div className="relative">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                  onClick={() => setRemovalDropdownOpen(!removalDropdownOpen)} // Toggle dropdown
                >
                  {removalDropdownOpen ? "Close Add Removal Line" : "Add Removal Line"}
                </button>

                {removalDropdownOpen && (
                  <div className="bg-gray-800 mt-2 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-white mb-4">Add Line to Remove</h2>
                    <input
                      type="text"
                      placeholder="Enter a line to remove"
                      value={newLine}
                      onChange={(e) => setNewLine(e.target.value)}
                      className="bg-gray-700 text-white py-2 px-3 rounded w-full mb-4"
                    />
                    <button
                      onClick={() => handleAddLine(clientData.bankName, newLine)} // Trigger add function
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full"
                    >
                      Add Line
                    </button>
                  </div>
                )}
              </div>

              {/* View lines removed Button with dropdown */}
              <div className="relative">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                  onClick={() => handleViewRemovedLines(!viewRemovedLinesOpen)} // Toggle dropdown
                >
                  {viewRemovedLinesOpen ? "Hide List of Removed Lines" : "View List of Removed Lines"}
                </button>

                {viewRemovedLinesOpen && (
                  <div className="bg-gray-900 mt-2 p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-white mb-2">Removed Lines</h2>
                    {removalLines.length > 0 ? (
                      <ul className="list-disc pl-6 text-gray-400">
                        {removalLines.map((line, index) => (
                          <li key={index} className="mb-2">{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No lines removed yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Remove Lines Dropdown */}
              <div className="relative">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded w-full"
                  onClick={() => setRemoveLineDropdownOpen(!removeLineDropdownOpen)} // Toggle dropdown
                >
                  {removeLineDropdownOpen ? "Close Remove Lines" : "Remove Lines"}
                </button>

                {/* Dropdown Content */}
                {removeLineDropdownOpen && (
                  <div className="bg-gray-900 mt-2 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-white mb-4">Remove Lines</h2>
                    {removalLines.length > 0 ? (
                      <ul className="list-disc pl-6 text-gray-400">
                        {removalLines.map((line, index) => (
                          <li key={index} className="flex justify-between items-center mb-2">
                            <span>{line}</span>
                            <button
                              onClick={() => handleRemoveLine(index)} // Remove line logic
                              className="text-red-500 hover:text-red-700 font-bold ml-4"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No lines to remove.</p>
                    )}
                  </div>
                )}
              </div>

              {/* View Filtered Data */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                onClick={() => setFilteredSidebarOpen(!filteredSidebarOpen)} // Toggle for raw data section
              >
                View Filtered Data
              </button>

              {/* Extracted Data Section */}
              {filteredSidebarOpen && (
                <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-8 max-h-80 overflow-auto">
                  <h2 className="text-2xl font-semibold text-white">Filtered Extracted Data</h2>
                  {clientData.filteredData ? (
                    <div className="mt-4">
                      <pre className="text-white whitespace-pre-wrap">
                        {clientData.filteredData}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-lg text-red-500 mt-2">No filtered extracted data available.</p>
                  )}
                </div>
              )}
      

              {/* View Data Button */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                onClick={() => setSidebarOpen(!sidebarOpen)} // Toggle for raw data section
              >
                {sidebarOpen ? "Hide Raw Extracted Data" : "View Raw Extracted Data"}
              </button>
            </div>

            {/* Extracted Data Section */}
            {sidebarOpen && (
              <div className="bg-gray-900 p-4 rounded-lg shadow-md mt-8 max-h-80 overflow-auto">
                <h2 className="text-2xl font-semibold text-white">Raw Extracted Data</h2>
                {clientData.rawData ? (
                  <div className="mt-4">
                    <pre className="text-white whitespace-pre-wrap">
                      {clientData.rawData}
                    </pre>
                  </div>
                ) : (
                  <p className="text-lg text-red-500 mt-2">No raw extracted data available.</p>
                )}
              </div>
            )}
          </div>
        </div>




        {/* Client notes section A box here the user can add note about the client, linked with clients data*/}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-400">
            Client Notes
          </h1>
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-white">Add a Note</h2>
            <p className="text-lg text-gray-400 mt-2">
              Write notes about the client here:
            </p>

            {/* Text box for adding a new note */}
            <textarea
              className="w-full h-32 p-2 mt-4 bg-gray-700 text-white rounded-lg"
              placeholder="Enter notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>

            {/* Notes Buttons */}
            <div className="flex gap-2 mt-4">
              {/* Add Note Button */}
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl"
                onClick={handleAddNote}
              >
                Save Note
              </button>

              {/* Delete All Notes */}
              <button
                onClick={deleteAllNotes}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl"
              >
                Delete All Notes
              </button>
            </div>

            {/* Notes History */}
            <h2 className="text-2xl font-semibold text-white mt-4 border-t border-gray-700 pt-2">
              Notes History
            </h2>
            {loading ? (
              <p className="text-lg text-gray-400">Loading notes...</p>
            ) : notes.length > 0 ? (
              <ul className="list-disc pl-6">
                {notes.map((note, index) => (
                  <li key={index} className="text-lg text-gray-400 mt-2">
                    <p>
                      Created by: <strong>{note.User}</strong>
                    </p>
                    {note.content} <br />
                    <span className="text-sm text-gray-500">
                      Added: {new Date(note.timestamp).toLocaleString()}{" "}
                    </span>
                    <button
                      onClick={() => deleteNote(index)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-gray-400">No notes found.</p>
            )}

            {/* Error Message */}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Clientprofile;
