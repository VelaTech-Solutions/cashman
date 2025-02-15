// src/pages/ViewEditClient.js

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// Component Imports
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

// Firebase imports
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "/Editclient", label: "Edit Client", icon: "ph-file-text" },
];

const ViewEditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("Not logged in");

  const [formValues, setFormValues] = useState({
    clientName: "",
    clientSurname: "",
    bankName: "",
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientDoc = doc(db, "clients", id);
        const clientSnapshot = await getDoc(clientDoc);

        if (clientSnapshot.exists()) {
          const data = clientSnapshot.data();
          setClientData(data);
          setFormValues({
            clientName: data.clientName || "",
            clientSurname: data.clientSurname || "",
            bankName: data.bankName || "",
          });
        } else {
          setError("Client not found.");
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateClient = async () => {
    try {
      const clientDoc = doc(db, "clients", id);
      await updateDoc(clientDoc, {
        clientName: formValues.clientName,
        clientSurname: formValues.clientSurname,
        bankName: formValues.bankName,
      });

      alert("Client details updated successfully!");
      navigate("/Editclient");
    } catch (err) {
      console.error("Error updating client data:", err);
      alert("Failed to update client data.");
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar title="View/Edit Client" links={links} />

      <div className="flex-1 p-8 space-y-8">
        <h1 className="text-4xl font-bold text-blue-400">View/Edit Client</h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-white">Edit Details</h2>
          <div className="space-y-4 mt-4">
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

        {clientData && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-white">
              Client Details
            </h2>
            <p className="text-lg text-gray-400 mt-2">
              <strong className="text-white">Captured By:</strong>
              {clientData.userEmail || "N/A"}
            </p>
            <p className="text-lg text-gray-400">
              <strong className="text-white">Date Captured:</strong>
              {clientData.dateCaptured || "N/A"}
            </p>
            <p className="text-lg text-gray-400">
              <strong className="text-white">Last Updated:</strong>
              {clientData.lastUpdated || "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEditClient;
