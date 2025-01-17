// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/tailwind.css";

// firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Check if user is logged in
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

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <motion.div
        className="lg:w-64 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8 shadow-xl hidden lg:block"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 pt-4">
          <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">
            Cash Flow Manager
          </h1>
        </div>

        <Link
          to="/"
          className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
        >
          <i className="ph-sign-out text-xl text-blue-400"></i>
          <span className="text-white">Logout</span>
        </Link>

        {/* User Info */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-white">
            Logged in as:{" "}
            <span className="text-blue-400">{userEmail || "Guest"}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-0.5 bg-gray-700"></div>

        {/* Navigation */}
        <nav className="space-y-6">
          {/* Navigation Label */}
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Main Navigation
          </div>

          {/* Links */}

          <Link
            to="/addclient"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
          >
            <i className="ph-check-square text-xl text-blue-400"></i>
            <span className="text-white">Add Client</span>
          </Link>
          <Link
            to="/editclient"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
          >
            <i className="ph-swap text-xl text-blue-400"></i>
            <span className="text-white">Edit Client</span>
          </Link>
          <Link
            to="/viewclient"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
          >
            <i className="ph-file-text text-xl text-blue-400"></i>
            <span className="text-white">View Client</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
          >
            <i className="ph-globe text-xl text-blue-400"></i>
            <span className="text-white">Settings</span>
          </Link>
          <Link
            to="/developernotes"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md"
          >
            <i className="ph-gear text-xl text-blue-400"></i>
            <span className="text-white">Developer Notes</span>
          </Link>

          {/* Divider */}
          <div className="w-full h-0.5 bg-gray-700"></div>

          {/* Navigation Label */}
          <div className="mt-auto text-left text-gray-500 text-sm">
            Integra Wealth ©<br />
            All Rights Reserved 2025
          </div>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
