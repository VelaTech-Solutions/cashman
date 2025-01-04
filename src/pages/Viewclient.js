// src/pages/Viewclient.js

import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase'; // Assuming config is correctly set up
import { collection, getDocs } from 'firebase/firestore';

function ViewClient() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientsCollection);
        const clientsList = clientSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Client List</h1>
      {clients.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No clients available</p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-4 border rounded-lg shadow-md hover:bg-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-800">{client.name}</h2>
              <p className="text-gray-600">ID: {client.id}</p>
              <p className="text-gray-600">Bank: {client.bank}</p>
              <p className="text-gray-600">Timestamp: {client.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewClient;
