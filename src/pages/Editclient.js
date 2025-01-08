// src/pages/EditClient.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    clientName: '',
    clientSurname: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientDoc = doc(db, 'clients', id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          const client = clientSnapshot.data();
          setFormValues({
            clientName: client.clientName || '',
            clientSurname: client.clientSurname || '',
          });
        } else {
          setError('Client not found.');
        }
      } catch (err) {
        setError('Failed to fetch client data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleUpdateClient = async () => {
    if (!formValues.clientName || !formValues.clientSurname) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const clientDoc = doc(db, 'clients', id);
      await updateDoc(clientDoc, {
        clientName: formValues.clientName,
        clientSurname: formValues.clientSurname,
      });

      alert('Client details updated successfully!');
      navigate('/dashboard'); // Redirect to the dashboard or client view
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400">Loading client data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-8">
        <Link to="/dashboard" className="text-blue-400 hover:underline">
          Back to Dashboard
        </Link>
      </nav>

      {/* Edit Client Form */}
      <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Edit Client</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formValues.clientName}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Client Surname</label>
            <input
              type="text"
              name="clientSurname"
              value={formValues.clientSurname}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateClient}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditClient;
