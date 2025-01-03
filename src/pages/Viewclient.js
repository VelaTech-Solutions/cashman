// src/pages/Viewclient.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase'; // Assuming you've initialized Firebase in this file
import { doc, getDoc } from 'firebase/firestore';

const Viewclient = () => {
  const { idNumber } = useParams(); // Fetch the idNumber from the URL
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientDocRef = doc(db, 'clients', idNumber); // Reference to the client document
        const clientDocSnap = await getDoc(clientDocRef);

        if (clientDocSnap.exists()) {
          setClient(clientDocSnap.data()); // Set the client data to state
        } else {
          console.log('No such client!');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchClientData();
  }, [idNumber]); // Re-run when idNumber changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>No client data available</div>;
  }

  return (
    <div className="view-client-container">
      <h2>View Client</h2>
      <div className="client-details">
        <p><strong>Name:</strong> {client.name}</p>
        <p><strong>Surname:</strong> {client.surname}</p>
        <p><strong>Bank Name:</strong> {client.bankName}</p>
        <p><strong>ID Number:</strong> {client.idNumber}</p>
        <p><strong>Timestamp:</strong> {new Date(client.timestamp?.seconds * 1000).toLocaleString()}</p>
      </div>

      <div className="client-bank-statement">
        <h3>Bank Statement</h3>
        {client.bankStatement && (
          <a href={client.bankStatement} target="_blank" rel="noopener noreferrer">
            View Bank Statement
          </a>
        )}
      </div>
    </div>
  );
};

export default Viewclient;
