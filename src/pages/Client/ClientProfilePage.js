import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Components imports
import "styles/tailwind.css";
import Sidebar from "components/Sidebar";
import LoadClientData from "components/LoadClientData";
import ViewSwitcher from "components/Common/ViewSwitcher";

import ClientProfileOverview from "components/ClientView/ClientProfileOverview";
import ClientActions1 from "components/ClientView/ClientActions1";
import ClientActions2 from "components/ClientView/ClientActions2";
import ClientActions3 from "components/ClientView/ClientActions3";
import ClientActions4 from "components/ClientView/ClientActions4";


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


const ClientProfilePage = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(""); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history
  const [activeView, setActiveView] = useState("view1");
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
  const actionLinks = id ? [
      { label: "Budget", path: `/budget/${id}` },
      { label: "Transactions", path: `/client/${id}/transactionspage` },
    ]
  : [];

  const views = [
    {
      key: "view1",
      label: "View 1",
      component: (
        <ClientActions1
        actionLinks={actionLinks}
        notes={notes}
        setNote={setNote}
        note={note}
        handleAddNote={handleAddNote}
        deleteNote={deleteNote}
        deleteAllNotes={deleteAllNotes}
      />
      ),
    },
    {
      key: "view2",
      label: "View 2",
      component: (
        <ClientActions2
        actionLinks={actionLinks}
        notes={notes}
        setNote={setNote}
        note={note}
        handleAddNote={handleAddNote}
        deleteNote={deleteNote}
        deleteAllNotes={deleteAllNotes}
      />
      ),
    },
    {
      key: "view3",
      label: "View 3",
      component: (
        <ClientActions3 
        actionLinks={actionLinks}
        notes={notes}
        setNote={setNote}
        note={note}
        handleAddNote={handleAddNote}
        deleteNote={deleteNote}
        deleteAllNotes={deleteAllNotes}
      />
      ),
    },
      {
        key: "view4",
        label: "View 4",
        component: (
          <ClientActions4 
          actionLinks={actionLinks}
          notes={notes}
          setNote={setNote}
          note={note}
          handleAddNote={handleAddNote}
          deleteNote={deleteNote}
          deleteAllNotes={deleteAllNotes}
        />
        )
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <Sidebar title="Client Profile" links={links} />
        <div className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-400">
            Client Profile
            </h1>
          </header>
          <ClientProfileOverview clientData={clientData} />
          <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
          <div className="flex space-x-1">
            {views.find((v) => v.key === activeView)?.component}
          </div>
        </div>
    </div>
  );
};
export default ClientProfilePage;
