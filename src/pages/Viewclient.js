import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

const Viewclient = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [clientData, setClientData] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchClientData(user.uid); // Assuming UID is used to fetch data
      } else {
        setUserEmail("Not logged in");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchClientData = async (userId) => {
    try {
      setErrorLog((prev) => [...prev, "Starting to fetch client data..."]);
      if (!userId) {
        setErrorLog((prev) => [...prev, "User ID is not available."]);
        throw new Error("User ID is required to fetch client data.");
      }

      const docRef = doc(db, "clients", userId);
      setErrorLog((prev) => [...prev, `Fetching document for user ID: ${userId}`]);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setErrorLog((prev) => [...prev, "Document exists, setting client data."]);
        setClientData(docSnap.data());
      } else {
        setErrorLog((prev) => [...prev, "No document found for this user."]);
        throw new Error("No document found for the given user ID.");
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      setErrorLog((prev) => [...prev, `Error: ${error.message}`]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-logo">
          <div className="logo">
            <h1 className="logo-title">
              <span>View Client</span>
            </h1>
          </div>
        </div>
        <div className="app-header-actions">
          <button className="user-profile">
            <span>{userEmail}</span>
            <span>
              <img
                src="https://img.icons8.com/pastel-glyph/100/person-male--v1.png"
                alt="User Avatar"
              />
            </span>
          </button>
        </div>
        <div className="app-header-mobile">
          <button className="icon-button large">
            <i className="ph-list"></i>
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className="app-body-navigation">
          <nav className="navigation">
            <a href="/dashboard">
              <i className="ph-sign-out"></i>
              <span>Back to Dashboard</span>
            </a>
          </nav>
        </div>
        <div className="app-body-content">
          <h2>Client Data</h2>
          {clientData ? (
            <pre>{JSON.stringify(clientData, null, 2)}</pre>
          ) : (
            <p>No client data available.</p>
          )}
        </div>
        <div className="app-body-logs">
          <h3>Error Log</h3>
          <ul>
            {errorLog.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Viewclient;
