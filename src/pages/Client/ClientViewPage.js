// src/pages/ViewClient.js

import React, { useEffect, useState } from "react";
import "styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase"; 
import { collection, getDocs } from "firebase/firestore";

// Component Imports
import { Sidebar } from "components/Common";
import Table from "components/Client/ClientView/Tables/Table";



const ClientViewPage = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // ---- ADDED SORTING STATE ----
  const [sortField, setSortField] = useState("clientName");
  const [sortOrder, setSortOrder] = useState("asc");
  const links = [
    { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  ];
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

  // ---- SORT the filtered list before pagination ----
  const sortedClients = React.useMemo(() => {
    // Copy array so we don't mutate original
    const clientsCopy = [...filteredClients];

    clientsCopy.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "clientName":
          comparison = (a.clientName || "").localeCompare(b.clientName || "");
          break;
        case "bankName":
          comparison = (a.bankName || "").localeCompare(b.bankName || "");
          break;
        case "id":
          comparison = parseInt(a.id || 0) - parseInt(b.id || 0);
          break;
        case "dateCreated":
          comparison =
            new Date(a.dateCreated || 0).getTime() - new Date(b.dateCreated || 0).getTime();
          break;
        default:
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
      <Sidebar title="View Clients" links={links} />
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-400">Client List View</h1>
        </header>

        <section className="mt-6 flex flex-wrap items-center gap-4">
          <div className="relative">
            {/* <input
              type="text"
              placeholder="Search clients..."
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              value={searchQuery}
              className="pl-10 pr-4 h-10 w-56 rounded-md bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-cyan-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400">🔍</div> */}
          </div>
          <div className="flex items-center h-10">
            {/* <label className="text-gray-300 text-sm mr-2">Sort:</label> */}
            {/* <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="h-full bg-gray-800 text-white px-3 rounded-md border border-gray-700 text-sm"
            >
              {[
                { value: "clientName", label: "Name" },
                { value: "bankName", label: "Bank" },
                { value: "id", label: "ID" },
                { value: "dateCreated", label: "Date" },
              ].map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select> */}
            {/* <button
              className="h-full ml-2 px-3 rounded-md bg-gray-800 text-white text-sm border border-gray-700 hover:bg-cyan-600"
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            >
              {sortOrder === "asc" ? "⬆" : "⬇"}
            </button> */}
          </div>
        </section>
        <section className="mt-6">
        <Table sortedClients={sortedClients} />
        </section>
    </div>
  </div>
  );
};

export default ClientViewPage;
