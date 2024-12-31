import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom


const Settings = () => {
  const [userEmail, setUserEmail] = useState('Not logged in');
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-logo">
          <div className="logo">
            <h1 className="logo-title">
              <span>Settings</span>
            </h1>
          </div>
        </div>
        <div className="app-header-actions">
          <button className="user-profile">
            <span>{userEmail}</span>
            <span>
              <img src="https://img.icons8.com/pastel-glyph/100/person-male--v1.png" alt="User Avatar" />
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
            <Link to="/dashboard">Back to Dashboard</Link>
            <Link to="/categories-settings">
              <i className="ph-check-square"></i>
              <span>Categories Settings</span>
            </Link>
            <button>
              <i className="ph-swap"></i>
              <span>Tools Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Settings;
