// src/testpages/Testfunctions.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter , Routes, Route, useParams, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import '../styles/tailwind.css';

// firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 
import { httpsCallable } from 'firebase/functions';
import { functions, db, storage } from '../firebase/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

const TestFunctions = () => {
  const [message, setMessage] = useState(""); // State to store the message
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [userEmail, setUserEmail] = useState('Not logged in');

  // Fetch client data with notes
  useEffect(() => {
    const fetchClientNotes = async () => {
      try {
        const clientRef = doc(db, 'clients', id);
        const clientSnapshot = await getDoc(clientRef);

        if (clientSnapshot.exists()) {
          const clientData = clientSnapshot.data();
          setNotes(clientData.notes || []); // Set notes or empty array
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        console.error('Error fetching client notes:', err);
        setError('Failed to load notes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientNotes();
  }, [id]);


  const onClick = async () => {
    try {
      const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/helloWorld");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Function response:", data); // Logs the response to the console
      setMessage(data.message); // Update state with the response message
    } catch (error) {
      console.error("Error calling the function:", error);
      setMessage("Error: Unable to fetch the message."); // Display error message
    }
  };

  // Call the Cloud Function pdf parser
  const callCloudFunction = async () => {
    try {
      const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/parsePDF");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Function response:", data); // Logs the response to the console
      setMessage(data.message); // Update state with the response message
    } catch (error) {
      console.error("Error calling the function:", error);
      setMessage("Error: Unable to fetch the message."); // Display error message
    }
  };



  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">

      {/* Navigation */}
      <nav className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <Link to="/dashboard" className="text-white hover:text-blue-400 transition">Back to Dashboard</Link>
        <Link to="/testviewclient" className="text-white hover:text-blue-400 transition">Back to Test View Client</Link>
      </nav>

      <h1>Test Firebase Functions</h1>
      <button onClick={onClick}>Call Cloud Function</button>
      <p>{message}</p> {/* Display the message on the page */}
    
    {/* Enter client id to test extract transactions */}
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Enter Client ID</h1>
      <input
        type="text"
        placeholder="Client ID"
        className="bg-gray-900 p-4 rounded-lg shadow-sm text-white"
      />
      <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4">Extract Transactions</button>
    </div>

      
    {/* Extract transactions section: This box allows the user to extract transactions from the client data, which is linked to the client's profile */}
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      {/* Header for the section */}
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Extract Transactions</h1>
      
      {/* Inner container for functionality */}
      <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
        
        {/* Title for the processing options */}
        <h2 className="text-2xl font-semibold text-white mb-4">File Processing Options</h2>
        
        {/* Instruction for selecting processing method */}
        <p className="text-sm text-white">
          <strong>Choose a method to process your file:</strong>
          <br />
          - If the text in your file is selectable (e.g., you can copy and paste it), use <strong>PDF Parser</strong>.
          <br />
          - If the text is not selectable (e.g., the file contains images of text like scanned documents), use <strong>OCR</strong> (Optical Character Recognition).
          <br />
          <br />
          <em>Examples:</em>
          <br />
          <strong>PDF Parser:</strong> Bank statements in PDF format with selectable text.
          <br />
          <strong>OCR:</strong> Scanned copies of handwritten or printed documents.
        </p>

        {/* Dropdown and buttons are stacked vertically */}
        <div className="flex flex-col gap-4 mt-4">

          {/* Dropdown to select the file processing method */}
          <div>
            <label 
              htmlFor="processing-method" 
              className="text-white text-sm font-medium mb-2 block">
              Choose File Processing Method:
            </label>
            <select
              id="processing-method"
              className="bg-gray-800 text-white py-2 px-3 rounded text-sm w-full"
            >
              <option value="ocr">Text-Based Extraction (for PDF Parser)</option>
              <option value="pdfparser">Image-Based Extraction (for OCR)</option>
            </select>
          </div>
          <p className="text-lg text-gray-400 mt-1">
                <span className="font-bold text-white">Bank:</span> {clientData.bankName}
              </p>
          {/* Extract Data button */}
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm w-full"
            onClick={() => {
              // Add function here to handle extraction based on selected method
            }}
          >
            Extract Data
          </button>

          {/* If data is extracted, show a view data button here */}
          
          {/* {isDataExtracted && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm w-full"
              onClick={() => {
                // Add function here to handle view data
              }}
            >
              View Data
            </button>
          )} */}

          {/* Delete Extracted Data button */}
          <button 
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm w-full"
            onClick={() => {
              // Add function here to handle deletion of extracted data
            }}
          >
            Delete Extracted Data
          </button>

        </div>
      </div>
    </div>
    </div>

    
  );
};

export default TestFunctions;
