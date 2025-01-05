// src/pages/ViewClient.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/tailwind.css';

// Firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase'; // Ensure this is the correct path
import { collection, getDocs } from 'firebase/firestore';

const Testviewclient = () => {
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track user authentication
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

  // Fetch client data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientsCollection);
        const clientsList = clientSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsList);
      } catch (err) {
        setError('Failed to fetch clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Loading or error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-gray-400">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <motion.div
        className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 shadow-lg ${
          sidebarOpen ? 'block' : 'hidden lg:block'
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="flex items-center space-x-3 pb-4">
          <h1 className="text-xl font-semibold text-white">Cash Flow Manager</h1>
        </div>
        <nav className="space-y-4">
          <Link to="/dashboard" className="hover:text-white transition">
          Back to Dashboard
          </Link>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>
          <div className="flex items-center space-x-4">
            <span>Welcome, {userEmail}</span>
          </div>
        </header>

        <section>
          <h1 className="text-3xl font-semibold mb-4">Client List</h1>
          {clients.length === 0 ? (
            <p className="text-center text-lg text-gray-500">
              No clients available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 bg-gray-700 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold">{client.id}</h2>
                  <p className="text-sm font-semibold text-gray-400">Name: {client.clientName} {client.clientSurname}</p>
                  <p className="text-sm text-gray-400">ID: {client.id}</p>
                  <p className="text-sm text-gray-400">Bank: {client.bankName}</p>
                  <Link
                    to={`/testclientprofile/${client.id}`}
                    className="mt-2 inline-block text-blue-400 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Testviewclient;
