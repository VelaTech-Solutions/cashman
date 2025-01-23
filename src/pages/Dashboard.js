// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import "../styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const links = [
  { path: "/addclient", label: "Add Client", icon: "ph-check-square" },
  { path: "/editclient", label: "Edit Client", icon: "ph-swap" },
  { path: "/viewclient", label: "View Client", icon: "ph-file-text" },
  { path: "/settings", label: "Settings", icon: "ph-globe" },
  { path: "/developernotes", label: "Developer Notes", icon: "ph-gear" },
  { path : "/instructions", label: "Instructions", icon: "ph-file-text" },
  // testing pages
  { path: "/teststorage", label: "Test Storage", icon: "ph-file-text" },
];

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
      <Sidebar title="Dashboard" links={links} />

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Header */}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* Sidebar toggle button */}
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="ph-list text-2xl"></i>
          </button>

          {/* Spacer for alignment */}
          <div className="flex-1"></div>

          {/* User Email Display */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Welcome,</p>
            <p className="text-lg font-bold text-blue-400">{userEmail}</p>
          </div>
        </div>


        {/* Add your dashboard content here */}
        <div className="text-gray-300">
          <h1 className="text-3xl font-semibold mb-4">Dashboard Overview</h1>
          <p className="text-lg">This is the main dashboard page content.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
