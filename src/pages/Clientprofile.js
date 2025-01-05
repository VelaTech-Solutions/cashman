import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion } from "framer-motion";
import "../styles/tailwind.css";

const ClientProfile = () => {
  const { id } = useParams(); // Get the client ID from the URL
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientDoc = doc(db, 'clients', id); // Fetch the specific client document
        const clientSnapshot = await getDoc(clientDoc);
        if (clientSnapshot.exists()) {
          setClientData(clientSnapshot.data());
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        setError('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  if (loading) return <p>Loading client data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
    <nav className="space-y-4">
    <Link to="/dashboard" className="hover:text-white transition">
        Back to Dashboard
    </Link>
    </nav>
      <h1 className="text-3xl font-bold mb-4">Client Profile: {clientData.clientName} {clientData.clientSurname}</h1>
      <p>ID: {id}</p>
      <p>Email: {clientData.email}</p>
      <p>Bank: {clientData.bankName}</p>
      
      {/* Add more client-specific details here */}
      <h2 className="text-2xl font-semibold mt-8">Bank Statements</h2>
      {/* Display or link to statements */}
      <div className="mt-4">
        <p>No statements available yet.</p>
      </div>
    </div>
  );
};

export default ClientProfile;
