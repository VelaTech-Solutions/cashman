import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Components imports
import "styles/tailwind.css";
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import Button from "components/Button";  
import ClientProfileOverview from "components/ClientView/ClientProfileOverview";
import ClientActions1 from "components/ClientView/ClientActions1";
import ClientActions2 from "components/ClientView/ClientActions2";
import ClientActions3 from "components/ClientView/ClientActions3";



// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { httpsCallable } from "firebase/functions";
import { functions, db, storage } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  deleteField,
  setDoc,
} from "firebase/firestore";
import { ref, getDownloadURL, listAll, deleteObject } from "firebase/storage";

const ClientProfilePage = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(""); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history
  const [clients, setClients] = useState([]);
  const [viewMode, setViewMode] = useState(1);
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
      { label: "Budget", path: `/budget/${id}` },
      { label: "Transactions", path: `/client/${id}/transactionspage` },
    ]
  : [];


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

          {/* Client Profile Overview */}
          <ClientProfileOverview clientData={clientData} />
          
          {/* View Mode Toggle */}
          <div className="flex space-x-1">
            {[
              { mode: 1, label: "📊" },
              { mode: 2, label: "📋" },
              { mode: 3, label: "🎛️" },
              { mode: 4, label: "🚀" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded-md transition-all duration-300 shadow-sm ${
                  viewMode === mode
                    ? mode === 4
                      ? "bg-cyan-500 animate-pulse shadow-md" // Cyberpunk pulses
                      : "bg-blue-500 shadow-md"
                    : "bg-gray-800 hover:bg-gray-700 hover:shadow-sm"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

        {/* Client Actions bars*/}
          {viewMode === 1 ? 
          (
            <ClientActions1 
              actionLinks={actionLinks}
              notes={notes}
              setNote={setNote}
              note={note}
              handleAddNote={handleAddNote}
              deleteNote={deleteNote}
              deleteAllNotes={deleteAllNotes}
              //handleDeleteClient={handleDeleteClient}
            />
          ) : viewMode === 2 ? (
            <ClientActions2 
              actionLinks={actionLinks}
              notes={notes}
              setNote={setNote}
              note={note}
              handleAddNote={handleAddNote}
              deleteNote={deleteNote}
              deleteAllNotes={deleteAllNotes}
              //handleDeleteClient={handleDeleteClient}
            />
          ) : viewMode === 3 ? (
            <ClientActions3 
              actionLinks={actionLinks}
              notes={notes}
              setNote={setNote}
              note={note}
              handleAddNote={handleAddNote}
              deleteNote={deleteNote}
              deleteAllNotes={deleteAllNotes}
              //handleDeleteClient={handleDeleteClient}
            />
          ) : (
            <ClientActions4 
              actionLinks={actionLinks}
              notes={notes}
              setNote={setNote}
              note={note}
              handleAddNote={handleAddNote}
              deleteNote={deleteNote}
              deleteAllNotes={deleteAllNotes}
              //handleDeleteClient={handleDeleteClient}
            />
          )}
  

      </div>
    </div>
  );
};
export default ClientProfilePage;
