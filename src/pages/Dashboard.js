// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import '../styles/tailwind.css';

// firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Ensure this is the correct path

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('Not logged in');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center space-x-3 pb-4">
          <img src="https://assets.codepen.io/285131/almeria-logo.svg" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-white">Cash Flow Manager</h1>
        </div>
        <nav className="space-y-4">
          <Link to="/logout" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-sign-out text-xl"></i>
            <span>Logout</span>
          </Link>
          <Link to="/addclient" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-check-square text-xl"></i>
            <span>Add Client</span>
          </Link>
          <Link to="/editclient" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-swap text-xl"></i>
            <span>Edit Client</span>
          </Link>
          <Link to="/viewclient" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-file-text text-xl"></i>
            <span>View Client</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-globe text-xl"></i>
            <span>Settings</span>
          </Link>
          <Link to="/developernotes" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Developer Notes</span>
          </Link>
          <Link to="/testpage" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Test Page</span>
          </Link>
          <Link to="/testfirestore" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Test Firestore</span>
          </Link>
          <Link to="/teststorage" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Test Storage</span>
          </Link>
          <Link to="/testfunctions" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i> 
            <span>Test Functions</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="ph-list text-2xl"></i>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>{userEmail}</span>
              <img
                src="https://img.icons8.com/pastel-glyph/100/person-male--v1.png"
                alt="User Avatar"
                className="w-10 h-10 rounded-full ml-4"
              />
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Clients</h2>
            <div className="flex items-center justify-between">
              <div className="relative flex-grow">
                <i className="ph-magnifying-glass absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Id Number"
                  className="w-full py-2 pl-8 pr-4 bg-transparent border-b border-gray-600 text-white focus:outline-none"
                />
              </div>
              <button className="bg-transparent border border-gray-600 text-gray-200 px-6 py-2 rounded-md hover:bg-gray-600 transition">
                Search
              </button>
            </div>
          </section>
        </div>

        <footer className="mt-auto text-center text-gray-500 text-sm">
          <div>
            Integra Wealth ©<br />
            All Rights Reserved 2025
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
