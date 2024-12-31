import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Dashboard = () => {
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
            <span className="logo-icon">
              <img src="https://assets.codepen.io/285131/almeria-logo.svg" alt="Logo" />
            </span>
            <h1 className="logo-title">
              <span>Cash Flow</span>
              <span>Manager</span>
            </h1>
          </div>
        </div>
        <div className="app-header-navigation">
          <div className="tabs">
            <Link to="/dashboard">Overview</Link>
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
            <Link to="/logout"><i className="ph-sign-out"></i><span>Logout</span></Link>
            <Link to="/addclient"><i className="ph-check-square"></i><span>Add Client</span></Link>
            <Link to="/editclient"><i className="ph-swap"></i><span>Edit Client</span></Link>
            <Link to="/viewclient"><i className="ph-file-text"></i><span>View Client</span></Link>
            <Link to="/settings"><i className="ph-globe"></i><span>Settings</span></Link>
            <Link to="/developernotes"><i className="ph-gear"></i><span>Developer Notes</span></Link>
          </nav>
          <footer className="footer">
            <div>Integra Wealth ©<br />All Rights Reserved 2025</div>
          </footer>
        </div>

        <div className="app-body-main-content">
          <section className="service-section">
            <h2>Clients</h2>
            <div className="service-section-header">
              <div className="search-field">
                <i className="ph-magnifying-glass"></i>
                <input type="text" placeholder="Id Number" />
              </div>
              <button className="flat-button">Search</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
