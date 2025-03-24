// src/pages/ViewClient.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Component Imports
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase"; // Ensure this is the correct path
import { collection, getDocs } from "firebase/firestore";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
];

import ClientViewTable1 from "components/ClientView/ClientViewTable1";
import ClientViewTable2 from "components/ClientView/ClientViewTable2";
import ClientViewTable3 from "components/ClientView/ClientViewTable3";
import ClientViewTable4 from "components/ClientView/ClientViewTable4";


const Viewclient = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---- ADDED SORTING STATE ----
  const [sortField, setSortField] = useState("clientName");
  const [sortOrder, setSortOrder] = useState("asc");

  // State for toggling view mode (1 = Grid View, 2 = List View)
  const [viewMode, setViewMode] = useState(1);

  // Track user authentication
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

  // Fetch client data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, "clients");
        const clientSnapshot = await getDocs(clientsCollection);
        const clientsList = clientSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsList);
      } catch (err) {
        setError("Failed to fetch clients. Please try again.");
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    `${client.clientName} ${client.clientSurname} ${client.id} ${client.bankName}`
      .toLowerCase()
      .includes(searchQuery),
  );

  const views = [
    {
      key: "view1",
      label: "View 1",
      component: (<ClientViewTable1 sortedClients={sortedClients} />
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

  // ---- SORT the filtered list before pagination ----
  const sortedClients = React.useMemo(() => {
    // Copy array so we don't mutate original
    const clientsCopy = [...filteredClients];

    clientsCopy.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "clientName":
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case "bankName":
          comparison = a.bankName.localeCompare(b.bankName);
          break;
        case "id":
          // If these aren't guaranteed to be numbers, convert them
          // or compare them as strings with localeCompare.
          comparison = parseInt(a.id) - parseInt(b.id);
          break;
        case "dateCreated":
          // Converting to Date objects to compare properly
          comparison =
            new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
          break;
        default:
          // default = no sorting
          comparison = 0;
      }

      // Flip comparison if sorting is descending
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return clientsCopy;
  }, [filteredClients, sortField, sortOrder]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="View Clients" links={links} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>
        </header>

        <section className="mt-6 flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search clients..."
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              value={searchQuery}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 shadow-md border border-gray-700 hover:border-cyan-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
              🔍
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-xs font-semibold" htmlFor="sortField">Sort:</label>
            <select
              id="sortField"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-gray-800 text-white px-2 py-1 text-xs rounded-md shadow-sm focus:ring-2 focus:ring-cyan-500 border border-gray-700 transition-all duration-300"
            >
              {[
                { value: "clientName", label: "Name" },
                { value: "bankName", label: "Bank" },
                { value: "id", label: "ID" },
                { value: "dateCreated", label: "Date" },
              ].map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              className="px-3 py-1 text-xs rounded-md shadow-sm transition-all duration-300 bg-gray-800 text-white hover:bg-cyan-600 hover:shadow-md"
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            >
              {sortOrder === "asc" ? "⬆" : "⬇"}
            </button>
          </div>
          
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
        </section>


        {/* Render the Selected Table */}
        <div className="mt-6">
          {viewMode === 1 ? 
          (
            <ClientViewTable1 sortedClients={sortedClients} />
          ) : viewMode === 2 ? (
            <ClientViewTable2 sortedClients={sortedClients} />
          ) : viewMode === 3 ? (
            <ClientViewTable3 sortedClients={sortedClients} />
          ) : (
            <ClientViewTable4 sortedClients={sortedClients} />
          )}
        </div>

      </div>
    </div>
  );
};

export default Viewclient;
