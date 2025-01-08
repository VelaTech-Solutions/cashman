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

const Testclientprofile = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [fileLinks, setFileLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState(''); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('Not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert('Note cannot be empty.');
      return;
    }

    try {
      const clientRef = doc(db, 'clients', id);
      const clientSnapshot = await getDoc(clientRef);

      if (clientSnapshot.exists()) {
        const existingNotes = clientSnapshot.data().notes || [];
        const updatedNotes = [
          ...existingNotes,
          { User : userEmail, content: note, timestamp: new Date().toISOString() }, // Add new note
        ];

        await updateDoc(clientRef, { notes: updatedNotes }); // Update Firestore document
        setNotes(updatedNotes); // Update local state
        setNote(''); // Clear the input
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note.');
    }
  };

  // Function to handle deletion of client data
  const handleDeleteClient = async () => {
    try {
      // Delete client document from Firestore
      await deleteDoc(doc(db, 'clients', id));

      // Delete associated files from Storage
      const folderRef = ref(storage, `bank_statements/${id}/`);
      const files = await listAll(folderRef);
      for (const file of files.items) {
        await deleteObject(ref(storage, file.fullPath));
      }

      alert('Client and associated data successfully deleted.');
    } catch (err) {
      console.error('Error deleting client data:', err);
      alert('Failed to delete client data. Please try again.');
    }
  };

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientDoc = doc(db, 'clients', id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          setClientData(clientSnapshot.data());
          const folderRef = ref(storage, `bank_statements/${id}/`);
          const fileList = await listAll(folderRef);
          const urls = await Promise.all(fileList.items.map((item) => getDownloadURL(item)));
          setFileLinks(urls);
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load client data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Function to handle data processing
  const handleProcessData = async () => {
    setIsProcessing(true);
    try {
      const processBankStatement = httpsCallable(functions, 'processBankStatement');
      const result = await processBankStatement({ clientId: id });
      alert(result.data.message);
    } catch (err) {
      console.error('Error processing data:', err);
      alert('Failed to process data.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <p>Loading client data and files...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Function to handle data extraction
  const handleExtractTransactions = async () => {
    if (!clientData.bankName) {
      alert('Bank name is missing. Cannot extract transactions.');
      return;
    }
  
    try {
      setIsProcessing(true);
      const extractTransactions = httpsCallable(functions, 'extractTransactions');
  
      const response = await extractTransactions({
        clientId: id,
        bankName: clientData.bankName,
      });
  
      alert(response.data.message || 'Transactions extracted successfully!');
    } catch (err) {
      console.error('Error extracting transactions:', err);
      alert('Failed to extract transactions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to handle deletion of extracted transactions
  const handleDeleteExtractedTransactions = async () => {
    try {
      setIsProcessing(true);
      const deleteTransactions = httpsCallable(functions, 'deleteTransactions');
  
      const response = await deleteTransactions({ clientId: id });
  
      alert(response.data.message || 'Transactions deleted successfully!');
    } catch (err) {
      console.error('Error deleting transactions:', err);
      alert('Failed to delete transactions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {/* Navigation */}
      <nav className="flex space-x-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <Link to="/dashboard" className="text-white hover:text-blue-400 transition">Back to Dashboard</Link>
        <Link to="/testviewclient" className="text-white hover:text-blue-400 transition">Back to test View Client</Link>
      </nav>

    {/* Client Profile */}
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Client Profile</h1>
      <div className="bg-gray-900 p-6 rounded-lg shadow-sm space-y-4">
        {/* Client Name */}
        <h2 className="text-2xl font-semibold text-white">
          {clientData.clientName} {clientData.clientSurname}
        </h2>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* ID */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">ID:</span> {id}
            </p>
          </div>

          {/* Bank */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Bank:</span> {clientData.bankName}
            </p>
          </div>

          {/* Captured By */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Captured by:</span> {clientData.userEmail}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Status:</span> {clientData.status || "N/A"}
            </p>
          </div>

          {/* Date Created */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Date Created:</span>{" "}
              {clientData.dateCreated || "Not Available"}
            </p>
          </div>

          {/* Date Updated */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Date Updated:</span>{" "}
              {clientData.dateUpdated || "Not Available"}
            </p>
          </div>

          {/* Date Closed */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Date Closed:</span>{" "}
              {clientData.dateClosed || "Not Available"}
            </p>
          </div>

          {/* Transactions Extracted Yes or No */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Transactions Extracted:</span>{" "}
              {clientData.transactionsExtracted ? "Yes" : "No"}
            </p>
          </div>

          {/* Total Transactions */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Total Transactions:</span>{" "}
              {clientData.totalTransactions || 0}
            </p>
          </div>

          {/* Number of Reports generated */}
          <div>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Number of Reports:</span>{" "}
              {clientData.numberOfReports || 0}
            </p>
          </div>


        </div>
      </div>
    </div>

    {/* Extract Transactions Section */}
    <div className="flex flex-col mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
      <h3 className="text-lg font-semibold text-white mb-2">Extract Transactions</h3>

      {/* Extract Transaction Data */}
      <button
        className={`bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm w-60 ${
          isProcessing ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={handleExtractTransactions}
        disabled={isProcessing}
      >
        {isProcessing ? 'Extracting...' : 'Extract Transactions'}
      </button>

      {/* Delete Extracted Transaction Data */}
      <button
        className={`bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm w-60 ${
          isProcessing ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={handleDeleteExtractedTransactions}
        disabled={isProcessing}
      >
        {isProcessing ? 'Deleting...' : 'Delete Extracted Transactions'}
      </button>
    </div>


    {/* Buttons Stacked Vertically */}
    <div className="mt-4 space-y-4">

      {/* Profile Actions Section */}
      <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">Client Actions</h3>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
          View Portfolio
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
          View Transactions
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
          Edit Transactions
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
          Categorize Transactions
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm w-60">
          View Reports
        </button>
      </div>

      {/* Delete Client Section */}
      <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg border border-red-700">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <button
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm w-60"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this client?')) {
              handleDeleteClient();
            }
          }}
        >
          Delete Client Data
        </button>
      </div>
    </div>


    {/* Client notes section A box here the user can add note about the client, linked with clients data*/}
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Client Notes</h1>
      <div className="bg-gray-900 p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-white">Add a Note</h2>
        <p className="text-lg text-gray-400 mt-2">Write notes about the client here:</p>

        {/* Text box for adding a new note */}
        <textarea
          className="w-full h-32 p-2 mt-4 bg-gray-700 text-white rounded-lg"
          placeholder="Enter notes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>

        {/* Add Note Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4"
          onClick={handleAddNote}
        >
          Save Note
        </button>

        {/* Notes History */}
        <h2 className="text-2xl font-semibold text-white mt-4">Notes History</h2>
        {loading ? (
          <p className="text-lg text-gray-400">Loading notes...</p>
        ) : notes.length > 0 ? (
          <ul className="list-disc pl-6">
            {notes.map((note, index) => (
              <li key={index} className="text-lg text-gray-400 mt-2">
                {note.content} <br />
                <span className="text-sm text-gray-500">Added: {new Date(note.timestamp).toLocaleString()}</span>
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
  );
};
export default Testclientprofile;
