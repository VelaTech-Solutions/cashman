// src/pages/ViewClient.js

import React, { useEffect, useState } from "react";
import "styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase"; 
import { collection, getDocs } from "firebase/firestore";

// Component Imports
import Table from "components/Client/ClientView/Tables/Table";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { TextField, Button, Paper, Stack, Typography, Grid} from "@mui/material";

export default function ClientViewPage({ setSelectedClientId, setActivePage }) {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // ---- ADDED SORTING STATE ----
  const [sortField, setSortField] = useState("clientName");
  const [sortOrder, setSortOrder] = useState("asc");

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
    <Box sx={{ width: '100%', maxWidth: '1700px', mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Clients
        </Typography>
        <Table
          sortedClients={clients}
          setSelectedClientId={setSelectedClientId}
          setActivePage={setActivePage}
        />
      </Stack>
    </Box>
  );
};