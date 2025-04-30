import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/tailwind.css";

// Firebase imports
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, } from "firebase/firestore";

// Component Imports
import { Sidebar, LoadClientData, ViewSwitcher } from 'components/Common';
import OverviewProfile from "components/Client/ClientProfile/OverviewProfile";
import ClientActions1 from "components/Client/ClientProfile/Actions/ClientActions1";
import ClientActions2 from "components/Client/ClientProfile/Actions/ClientActions2";
import ClientActions3 from "components/Client/ClientProfile/Actions/ClientActions3";
import ClientActions4 from "components/Client/ClientProfile/Actions/ClientActions4";




const ClientProfilePage = () => {
  const { id: clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState(""); // State for the new note
  const [notes, setNotes] = useState([]); // State for notes history
  const [activeView, setActiveView] = useState("view1");


  // Fetch client data, Fetch client notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientData = await LoadClientData(clientId);
        
        setClientData(clientData);
        setNotes(clientData.notes || []); 

  
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch Client Data.");
      }
    };
  
    fetchData();
  }, [clientId]);

  // Handle add client notes
  const handleAddNote = async () => {
    if (!note.trim()) {
      alert("Note cannot be empty.");
      return;
    }

    try {
      const clientRef = doc(db, "clients", clientId);
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
      const clientRef = doc(db, "clients", clientId);
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
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, { notes: [] });
      setNotes([]);
      alert("All notes deleted successfully!");
    } catch (error) {
      console.error("Error deleting all notes:", error);
      alert("Failed to delete all notes.");
    }
  };

  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
    { path: "/viewclient", label: "View Clients", icon: "ph-file-text" },
    {},
  ];
  const actionLinks = clientId ? [
    { label: "Budget", path: `/budget/${clientId}` },
    { label: "Transactions", path: `/client/${clientId}/transactionspage` },
    { label: "Archives", path: `/client/${clientId}/archive` },
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
        <OverviewProfile clientData={clientData} />
        <div className="flex items-center h-10 space-x-2">
          <ViewSwitcher views={views} activeViewKey={activeView} setActiveViewKey={setActiveView} />
        </div>
        <div className="mt-6">
          {views.find((v) => v.key === activeView)?.component}
        </div>
      </div>
    </div>
  );
};
export default ClientProfilePage;
