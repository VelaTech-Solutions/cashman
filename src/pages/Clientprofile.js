import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Components imports
import "styles/tailwind.css";
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import Button from "components/Button";

// Firebase imports
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

const Clientprofile = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(""); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history


  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "/viewclient", label: "View Clients", icon: "ph-file-text" },
    {},
  ];

  // Fetch client data, Fetch client notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(id);
        
        setClientData(clientData);
        setNotes(clientData.notes || []); 

  
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
  
    fetchData();
  }, [id]);

  // Handle add client notes
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
            // User: userEmail,
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
      const clientRef = doc(db, "clients", id);
      await updateDoc(clientRef, { notes: [] });
      setNotes([]);
      alert("All notes deleted successfully!");
    } catch (error) {
      console.error("Error deleting all notes:", error);
      alert("Failed to delete all notes.");
    }
  };

  // Define links at the top
  const actionLinks = id
  ? [
      { label: "Profile", path: `/client/${id}/profile` },
      { label: "Budget", path: `/budget/${id}` },
      { label: "View Transactions", path: `/client/${id}/transactions` },
      { label: "Edit Transactions", path: `/client/${id}/edit-transactions` },
      { label: "Categorize Transactions", path: `/client/${id}/categorize` },
      { label: "Extract Transactions", path: `/ExtractTransactions/${id}` },
      { label: "View Reports", path: `/client/${id}/reports` },
    ]
  : [];
  const Button = ({ to, onClick, children, className }) => {
    return to ? (
      <Link to={to} className={`btn ${className}`}>
        {children}
      </Link>
    ) : (
      <button onClick={onClick} className={`btn  ${className}`}>
        {children}
      </button>
    );
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
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8 text-left border border-gray-700">
          <div className="grid grid-cols-1 gap-3 justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">ID:</span> {clientData?.idNumber || 'N/A'}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">Bank:</span> {clientData?.bankName || 'N/A'}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">Captured By:</span> {clientData?.userEmail || 'No notes available'}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">Date Captured:</span> {clientData?.dateCaptured || 'Unknown'}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">Last Updated:</span> {clientData?.lastUpdated || 'Never'}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md mt-2">
                <p><span className="font-bold text-white">Total Transactions:</span> {clientData?.number_of_transactions || 0}</p>
              </div>

            </div>
          </div>
        </div>



        {/* Buttons*/}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8 text-center border border-gray-700">
          {/* <h3 className="text-2xl font-bold text-white mb-4">Actions</h3> */}
          <div className="grid grid-cols-1 gap-3 justify-center">
            <div className="flex flex-wrap gap-2 mb-4">
              {actionLinks.map(({ label, path }) => (
                <Button 
                  key={path} 
                  to={path} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl"
                >
                  {label}
                </Button>
                ))}
                <Button
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this client?")) {
                      handleDeleteClient();
                    }
                  }}
                >
                  Delete Client Data
                </Button>
            </div>
          </div>
        </div>


        {/* Client notes section A box here the user can add note about the client, linked with clients data*/}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8 text-left border border-gray-700">
          {/* <h1 className="text-4xl font-bold mb-4 text-blue-400"> Client Notes </h1> */}
          {/* <div className="bg-gray-900 p-4 rounded-lg shadow-sm"> */}
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
            {notes.length > 0 ? (
              <ul className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8 text-left border border-gray-700">
                {notes.map((note, index) => (
                  <li key={index} className="text-lg text-gray-400 mt-2">
                    <p>
                      Created by: <strong>{note.User}</strong>
                    </p>
                    {note.content} <br />
                    <span className="text-sm text-gray-500">
                      Added: {new Date(note.timestamp).toLocaleString()}
                     </span>
                    <button
                      onClick={() => deleteNote(index)}
                      className="text-red-500 ml-2"
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

          {/* </div> */}
        </div>



      </div>
    </div>
  );
};
export default Clientprofile;
