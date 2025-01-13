// Editclient.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditClient = () => {
  const { id } = useParams(); // Extract client ID from the route
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    clientName: "",
    clientSurname: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientDoc = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          const client = clientSnapshot.data();
          setFormValues({
            clientName: client.clientName || "",
            clientSurname: client.clientSurname || "",
            bankName: client.bankName || "",
          });
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        setError("Failed to fetch client data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClient = async () => {
    if (
      !formValues.clientName ||
      !formValues.clientSurname ||
      !formValues.bankName
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const clientDoc = doc(db, "clients", id);
      await updateDoc(clientDoc, {
        clientName: formValues.clientName,
        clientSurname: formValues.clientSurname,
        bankName: formValues.bankName,
      });

      alert("Client updated successfully!");
      navigate("/view-clients"); // Redirect back to the clients list
    } catch (err) {
      console.error("Error updating client:", err);
      setError("Failed to update client. Please try again.");
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
      <Link to="/view-clients" className="text-blue-400 hover:underline">
        Back to Clients List
      </Link>
      <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Edit Client</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Client Name
            </label>
            <input
              type="text"
              name="clientName"
              value={formValues.clientName}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Client Surname
            </label>
            <input
              type="text"
              name="clientSurname"
              value={formValues.clientSurname}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={formValues.bankName}
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
