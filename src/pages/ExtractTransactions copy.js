// src/pages/extraction-page.js
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

// components imports
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";
import LoadClientData from "../components/LoadClientData";


// firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../firebase/firebase";
import { doc, getDoc, deleteDoc, updateDoc, deleteField, setDoc  } from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { filter } from "framer-motion/client";

const links = [
    { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

// ExtractTransactions component definition here auto and manual extraction

function ExtractTransactions() {
    const { id } = useParams();
    const [clientData, setClientData] = useState(null);
    const [fileLinks, setFileLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);


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


    // Fetch client data
useEffect(() => {
    const fetchData = async () => {
      try {
  
        // Load client data using the reusable function
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
        console.log("Fetched client data:", clientData);
  
        setClientData(clientData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

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
            <Sidebar title="Dashboard" links={links} />
            {/* maybe we can place the auto and manual in a the sidebar,  */}



            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-400">
                    Extract Transactions
                </h1>
                </header>

                {/* Overview Section */}
                <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold text-blue-400 mb-4">
                    Transactions Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                    <p className="text-lg font-bold text-blue-400">
                        Total Transactions
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {/* {clientData.transactions?.length || 0} */}
                    </p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                    <p className="text-lg font-bold text-blue-400">
                        Transactions Needing Review
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {/* Placeholder */}0
                    </p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                    <p className="text-lg font-bold text-blue-400">
                        Corrected Transactions
                    </p>
                    <p className="text-3xl font-bold text-white">
                        {/* Placeholder */}0
                    </p>
                    </div>
                </div>
                </section>

        {/* Extract Transactions Section Manual */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            {/* Section Header */}
            <h1 className="text-4xl font-bold mb-4 text-blue-400">
            Extract Transactions Manually
            </h1>

            {/* Parser Options */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-sm mb-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                Parser Options
                </h2>
                {/* <p className="text-sm text-white">
                <strong>Choose a method to process your file:</strong>
                <br />- Use <strong>PDF Parser</strong> for selectable text.
                <br />- Use <strong>OCR</strong> for scanned or image-based files.
                Not Working for now
                </p> */}
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
                            className="bg-gray-800 text-white py-2 px-3 rounded text-sm"
                            value={processingMethod}
                            onChange={(e) => setProcessingMethod(e.target.value)}
                        >
                            <option value={PROCESS_METHODS.PDF_PARSER}>PDF Parser</option>
                            <option value={PROCESS_METHODS.OCR}>OCR  Not Supported yet.</option>
                        </select>
                    </div>
                </div>

                {/* Extract and Manage Options manual */}
                <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Manually Extract Data
                    </h2>

                    {/* Step 1 extract data and show rawdata to user buttton */}
                    <Button 
                    onClick={handleExtractData}
                    text={isProcessing ? "Processing..." : "Manual Extract"}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isProcessing}
                    />

                    {/* Step 2 Manually Clean rawdata a dropdown and editable*/}
                    <Button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    text={sidebarOpen ? "Hide Raw Extracted Data" : "View Raw Extracted Data"}
                    className="bg-blue-500 hover:bg-blue-600 text-white "
                    />
                    {/* Step 3 Save cleaned data to database under clientData.filteredData */}
                    {/* Step 4 Extract Transactions button  */}

                    {/* Step 5 Show extracted data to user hide/show button */}
                    <Button 
                    // onClick={handleExtractTransactions}
                    text={isProcessing ? "Processing..." : "Extract Transactions"}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isProcessing}
                    />


                    {/* Step 6 Delete extracted data button */}
                    {/* Example usage for Delete Extracted Data Button */}
                    <Button
                    onClick={handleDeleteExtractedData}
                    text="Delete Extracted Data"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    />
                    </div>
                    </div>


        





        {/* Extract Transactions Section auto */}
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
                className="bg-gray-800 text-white py-2 px-3 rounded text-sm "
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value)}
              >
                <option value={PROCESS_METHODS.PDF_PARSER}>PDF Parser</option>
                <option value={PROCESS_METHODS.OCR}>OCR  Not Supported yet.</option>
              </select>
            </div>
          </div>



        {/* Extract and Manage Options */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-white mb-4">
            Automatically Extract Data
        </h2>

        {/* Extract Data Button */}
        <div className="">
            <Button
            onClick={handleExtractData}
            text={isProcessing ? "Processing..." : "Automatic Extract"}
            className={`mt-4 ${
                isProcessing ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isProcessing}
            />

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
            <Button
            onClick={handleDeleteExtractedData}
            text="Delete Extracted Data"
            className="bg-red-500 hover:bg-red-600 text-white"
            />

            {/* Add Removal Line Dropdown */}
            <div className="relative">
            <Button
                onClick={() => setRemovalDropdownOpen(!removalDropdownOpen)}
                text={removalDropdownOpen ? "Close Add Removal Line" : "Add Removal Line"}
                className="bg-blue-500 hover:bg-blue-600 text-white"
            />

            {removalDropdownOpen && (
                <div className="bg-gray-800 mt-2 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-white mb-4">Add Line to Remove</h2>
                <input
                    type="text"
                    placeholder="Enter a line to remove"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    className="bg-gray-700 text-white py-2 px-3 rounded mb-4"
                />
                <Button
                    onClick={() => handleAddLine(clientData.bankName, newLine)}
                    text="Add Line"
                    className="bg-green-500 hover:bg-green-600 text-white"
                />
                </div>
            )}
            </div>

            {/* View Lines Removed Button with Dropdown */}
            <div className="relative">
            <Button
                onClick={() => handleViewRemovedLines(!viewRemovedLinesOpen)}
                text={viewRemovedLinesOpen ? "Hide List of Removed Lines" : "View List of Removed Lines"}
                className="bg-blue-500 hover:bg-blue-600 text-white"
            />

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
            <Button
                onClick={() => setRemoveLineDropdownOpen(!removeLineDropdownOpen)}
                text={removeLineDropdownOpen ? "Close Remove Lines" : "Remove Lines"}
                className="bg-red-500 hover:bg-red-600 text-white"
            />

            {removeLineDropdownOpen && (
                <div className="bg-gray-900 mt-2 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-white mb-4">Remove Lines</h2>
                {removalLines.length > 0 ? (
                    <ul className="list-disc pl-6 text-gray-400">
                    {removalLines.map((line, index) => (
                        <li key={index} className="flex justify-between items-center mb-2">
                        <span>{line}</span>
                        <Button
                            onClick={() => handleRemoveLine(index)}
                            text="Remove"
                            className="text-red-500 hover:text-red-700 font-bold"
                        />
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
            <Button
            onClick={() => setFilteredSidebarOpen(!filteredSidebarOpen)}
            text="View Filtered Data"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            />

            {/* View Data Button */}
            <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            text={sidebarOpen ? "Hide Raw Extracted Data" : "View Raw Extracted Data"}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            />
        </div>
        </div>
        </div>

    
        </div>
        </div>
    );
}
export default ExtractTransactions;

// can we make the different ways of extraction placed in the sidebar? the render if  manual or auto extraction?