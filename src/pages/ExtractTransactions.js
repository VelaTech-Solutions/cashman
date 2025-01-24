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
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  setDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { filter } from "framer-motion/client";

const links = [{ path: "javascript:void(0)", label: "Back", icon: "ph-home" }];

// ExtractTransactions component definition here auto and manual extraction

function ExtractTransactions() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false); // handleExtractTransactions
  const [processing, setProcessing] = useState(false); // handleExtractDataManual

  const [errorMessage, setErrorMessage] = useState("");

  const [rawData, setRawData] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function

  const [processingMethod, setProcessingMethod] = useState("pdfparser"); // Default to PDF Parser
  const PROCESS_METHODS = {
    PDF_PARSER: "pdfparser",
    OCR: "ocr",
  };

  const [newLine, setNewLine] = useState(""); // To manage the input for new lines
  const [successMessage, setSuccessMessage] = useState(""); // To display success messages


  const [viewRemovedLinesOpen, setViewRemovedLinesOpen] = useState(false);

  const [removalDropdownOpen, setRemovalDropdownOpen] = useState(false); // Initialize dropdown state
  const [addLineDropdownOpen, setAddLineDropdownOpen] = useState(false);
  const [removalLines, setRemovalLines] = useState([]);
  const [removalSidebarOpen, setRemovalSidebarOpen] = useState(false);
  const [removeLineDropdownOpen, setRemoveLineDropdownOpen] = useState(false);
  
  // Auto extraction Settings
  const [autosidebarOpen, setAutoSidebarOpen] = useState(false);
  const [autofilteredSidebarOpen, setAutoFilteredSidebarOpen] = useState(false);

  // Manual extraction Settings
  const [manualSidebarOpen, setManualSidebarOpen] = useState(false);
  const [manualFilteredSidebarOpen, setManualFilteredSidebarOpen] = useState(false);
  const [manualRemoveLineDropdownOpen, setManualRemoveLineDropdownOpen] = useState(false);
  const [editRawDataOpen, setEditRawDataOpen] = useState(false);
  const [isProcessingtransactions, setisProcessingtransactions] = useState(false);
  const [ProcessingTransactions, setProcessingtransactions] = useState(false);



  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load client data using the reusable function
        const clientData = await LoadClientData(id); // Assuming 'clientData' is the reusable function
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

  // Handle data extraction Automatically
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
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();
      alert(result.message || "Data extracted successfully!");

      // Refresh the page by reloading
      window.location.reload();
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage(
        "An error occurred while extracting data. Please try again."
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
    setFilteredSidebarOpen(!autofilteredSidebarOpen);
  };


  // Handle data extraction Manually
  const handleExtractDataManual = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: id,
            bankName: clientData.bankName,
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();
      alert(result.message || "Data extracted successfully!");

      // Refresh the page by reloading
      window.location.reload();
    } catch (error) {
      console.error("Error extracting data:", error);
      setErrorMessage(
        "An error occurred while extracting data. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Handle Transactions Extraction Manually
  const handleExtractTransactions = async () => {
    if (!id) {
      alert("Client ID is not provided.");
      return;
    }

    setProcessingtransactions(true); // Start processing
    setErrorMessage(""); // Clear error messages
    setSuccessMessage(""); // Clear success messages

    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractTransactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: id,
            bankName: clientData.bankName,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();

      // Show success message if the request succeeded
      setSuccessMessage(result.message || "Transactions extracted successfully!");

      // Optionally refresh or update UI with new transactions
      if (result.transactions) {
        setClientData((prevData) => ({
          ...prevData,
          transactions: result.transactions,
        }));
      }
    } catch (error) {
      console.error("Error extracting transactions:", error);
      setErrorMessage(
        error.message || "Failed to extract transactions. Please try again."
      );
    } finally {
      setProcessingtransactions(false); // Stop processing
    }
  };


  const handleDeleteLine = (index) => {
    const updatedRawData = [...clientData.rawData];
    updatedRawData.splice(index, 1); // Remove the line at the given index
    setClientData({ ...clientData, rawData: updatedRawData }); // Update state
  };
  
  const handleSaveFilteredData = async () => {
    try {
      if (!clientData?.filteredData || clientData.filteredData.length === 0) {
        setErrorMessage("No data to save.");
        return;
      }
  
      // Save filteredData to Firestore using db
      await updateDoc(doc(db, "clients", clientData.idNumber), {
        filteredData: clientData.filteredData,
      });
  
      console.log("Filtered data saved successfully!");
      // setSuccessMessage("Filtered data saved!");
    } catch (error) {
      console.error("Error saving filtered data:", error.message);
      setErrorMessage("Failed to save filtered data. Please try again.");
    }
  };
  

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Extract Transaction" links={links} />
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
                <option value={PROCESS_METHODS.OCR}>
                  OCR (Not Supported yet)
                </option>
              </select>
            </div>
          </div>

          {/* Extract and Manage Options in Grid Layout */}
          {/* Extract and Manage Options in Grid Layout */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Manually Extract Data
            </h2>

            {/* Button Group: Flex Column for Stacked Buttons */}
            <div className="flex flex-col gap-4">
              {/* Button 1: Manual Extract */}
              <Button
                onClick={handleExtractDataManual}
                text={processing ? "Processing..." : "Manual Extract"}
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                disabled={processing}
              />

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 mt-4 text-center" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Button 2: View Raw Extracted Data */}
              <div className="relative">
                <Button
                  onClick={() => setManualSidebarOpen(!manualSidebarOpen)}
                  text={
                    manualSidebarOpen
                      ? "Hide Raw Data"
                      : "View Raw Data"
                  }
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                />

                {/* Data Display */}
                {manualSidebarOpen && (
                <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
                <h2 className="text-xl font-semibold text-blue-400 mb-4">
                  Raw Extracted Data
                </h2>
                {clientData?.rawData ? (
                  <pre className="text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded-lg">
                    {(clientData.rawData)}
                  </pre>
                ) : (
                  <p className="text-gray-400">No raw data available.</p>
                )}
              </div>
                )}
              </div>

              {/* Button 3: Edit Extracted Raw Data */}
              {/* Button 3: Edit Extracted Raw Data */}
              <div className="relative">
                {/* Button to toggle dropdown */}
                <Button
                  onClick={() => setEditRawDataOpen(!editRawDataOpen)}
                  text={
                    editRawDataOpen
                      ? "Hide Extracted Transactions"
                      : "Edit Extracted Raw Data"
                  }
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                />

                {/* Dropdown for editing raw transactions */}
                {editRawDataOpen && (
                  <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
                    <h2 className="text-xl font-semibold text-blue-400 mb-4">
                      Edit Extracted Transactions
                    </h2>

                    {/* Editable Text Area */}
                    <textarea
                      value={
                        Array.isArray(clientData?.rawData)
                          ? clientData.rawData.join("\n")
                          : clientData?.rawData || ""
                      }
                      onChange={(e) => {
                        const updatedRawData = e.target.value.split("\n"); // Convert textarea input to array
                        setClientData({
                          ...clientData,
                          rawData: updatedRawData, // Update rawData
                          filteredData: updatedRawData.filter(line => line.trim() !== ""), // Update filteredData dynamically
                        });
                      }}
                      className="w-full h-60 bg-gray-800 text-white p-3 rounded-lg resize-none"
                      placeholder="Edit your transactions here..."
                    ></textarea>


                    {/* Save Button (Sticky at the Bottom) */}
                    <div className="sticky bottom-0 bg-gray-900 p-4 mt-4">
                      <Button
                        onClick={() => handleSaveFilteredData(clientData.idNumber)

                        }
                        text="Save Filtered Data"
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium text-center"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* View Filitered data */}
              {/* View Filtered Data */}
              <div className="relative">
                <Button
                  onClick={() => setManualFilteredSidebarOpen(!manualFilteredSidebarOpen)}
                  text="View Filtered Data"
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                />
                {/* Data Display */}
                {manualFilteredSidebarOpen && (
                  <div className="bg-gray-900 mt-2 p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
                    <h2 className="text-xl font-semibold text-white mb-2">Filtered Data</h2>
                    {clientData?.filteredData ? (
                      <pre className="text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded-lg">
                        {Array.isArray(clientData.filteredData)
                          ? clientData.filteredData.join("\n") // Convert array to a newline-separated string
                          : clientData.filteredData} {/* Directly render if already a string */}
                      </pre>
                    ) : (
                      <p className="text-gray-400">No filtered data available.</p>
                    )}
                  </div>
                )}
              </div>


              {/* Button 4: Extract Transactions */}
              <Button
                onClick={handleExtractTransactions}
                text={ProcessingTransactions ? "Processing..." : "Extract Transactions"}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                disabled={ProcessingTransactions}
              />
              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 mt-4 text-center" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Placeholder for Displaying Transactions */}
              {manualSidebarOpen && (
                <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
                  <h2 className="text-xl font-semibold text-blue-400 mb-4">
                    Extracted Transactions
                  </h2>
                  <p className="text-gray-400">Placeholder for displaying extracted transactions.</p>
                </div>
              )}

              {/* Button 5: Delete Extracted Data */}
              <Button
                onClick={handleDeleteExtractedData}
                text="Delete Extracted Data"
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />
            </div>
          </div>
        </div>


        {/* ################################################ */}





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
                <option value={PROCESS_METHODS.OCR}>
                  OCR Not Supported yet.
                </option>
              </select>
            </div>
          </div>

          {/* Extract and Manage Options */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Automatically Extract Data
            </h2>

            {/* Extract Data Button */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleExtractData}
                text={isProcessing ? "Processing..." : "Automatic Extract"}
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
                disabled={isProcessing}
              />

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 mt-4 text-center" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Delete Extracted Data Button */}
              <Button
                onClick={handleDeleteExtractedData}
                text="Delete Extracted Data"
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />

              {/* Add Removal Line Dropdown */}
              <Button
                onClick={() => setRemovalDropdownOpen(!removalDropdownOpen)}
                text={
                  removalDropdownOpen
                    ? "Close Add Removal Line"
                    : "Add Removal Line"
                }
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />

              {removalDropdownOpen && (
                <div className="bg-gray-800 mt-2 p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Add Line to Remove
                  </h2>
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


              {/* View Lines Removed Button with Dropdown */}
              <div className="relative">
                <Button
                  onClick={() => setViewRemovedLinesOpen(!viewRemovedLinesOpen)}
                  text={
                    viewRemovedLinesOpen
                      ? "Hide List of Removed Lines"
                      : "View List of Removed Lines"
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
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

              {/* Remove Lines for removal */}
              <div className="relative">
              <Button
                onClick={() => setRemoveLineDropdownOpen(!removeLineDropdownOpen)}
                text={removeLineDropdownOpen ? "Close Remove Lines" : "Remove Lines"}
                className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />
              {/* Data Display */}
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
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium"
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
              <div className="relative">
              <Button
                onClick={() => setAutoFilteredSidebarOpen(!autofilteredSidebarOpen)}
                text="View Filtered Data"
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />
              {/* Data Display */}
              {autofilteredSidebarOpen && (
                <div className="bg-gray-900 mt-2 p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-white mb-2">Filtered Data</h2>
                  {clientData.filteredData ? (
                    <pre className="text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded-lg">
                      {(clientData.filteredData)}
                    </pre>
                  ) : (
                    <p className="text-gray-400">No filtered data available.</p>
                  )}
                </div>
              )}
              </div>

              {/* View Raw Data */}
              <div className="relative">
              <Button
                onClick={() => setAutoSidebarOpen(!autosidebarOpen)}
                text={
                  autosidebarOpen 
                  ? "Hide Raw Extracted Data" 
                  : "View Raw Extracted Data"
                }
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium text-center w-[220px]"
              />

              {/* Data Display */}
              {autosidebarOpen && (
                <div className="mt-4 bg-gray-900 text-white p-4 rounded-lg shadow-md max-h-80 overflow-y-auto">
                  <h2 className="text-xl font-semibold text-blue-400 mb-4">
                    Raw Extracted Data
                  </h2>
                  {clientData?.rawData ? (
                    <pre className="text-sm whitespace-pre-wrap bg-gray-800 p-3 rounded-lg">
                      {(clientData.rawData)}
                    </pre>
                  ) : (
                    <p className="text-gray-400">No raw data available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      

  );
}
export default ExtractTransactions;

// can we make the different ways of extraction placed in the sidebar? the render if  manual or auto extraction?
