import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore'; // Adjust path if necessary

const Viewclient = () => {
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [clientData, setClientData] = useState(null); // State for client data
  const [loading, setLoading] = useState(true); // Loading state
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('Not logged in');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const docRef = doc(db, 'clients', 'OnCsEboOl39VtcboLM8i'); // Adjust collection and document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClientData(docSnap.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []);

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
          {loading ? (
            <p>Loading client data...</p>
          ) : clientData ? (
            <div>
              <h2>Client Details</h2>
              <p><strong>ID:</strong> {clientData.id}</p>
              {/* Add other fields as needed */}
            </div>
          ) : (
            <p>No client data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Viewclient;
