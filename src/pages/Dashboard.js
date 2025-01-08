// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import '../styles/tailwind.css';

// firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; 

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState('Not logged in');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Check if user is logged in
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
      <div className="flex items-center space-x-3 pb-4 pt-4">
          <h1 className="text-2xl font-bold text-blue-400">Cash Flow Manager</h1>
        </div>
        {/* User Email */}
        <div className="text-sm text-gray-300 border-t border-gray-700 pt-4">
          <p className="font-medium text-white">{userEmail || 'Guest'}</p>
        </div>
        <nav className="space-y-4 border-t border-gray-700 pt-4">
          <Link to="/" className="flex items-center space-x-3 hover:text-white transition">
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

          {/* Make a line */}
          <div className="border-t border-gray-700"></div>  

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
          <Link to="/testdash" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Test Dashboard</span>
          </Link>
          <Link to="/testviewclient" className="flex items-center space-x-3 hover:text-white transition">
            <i className="ph-gear text-xl"></i>
            <span>Test View Client</span>
          </Link>
        </nav>
        <div className="mt-auto text-left text-gray-500 text-sm">
            Integra Wealth ©<br />
            All Rights Reserved 2025
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="ph-list text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
