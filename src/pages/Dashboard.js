// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Component Imports
import Sidebar from "components/Sidebar";
import "styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";


const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  if (error) return <div>Error: {error}</div>;
  
  const links = [
    { path: "/addclient", label: "Add Client", icon: "ph-check-square" },
    { path: "/editclient", label: "Edit Client", icon: "ph-swap" },
    { path: "/viewclient", label: "View Client", icon: "ph-file-text" },
    { path: "/settings", label: "Settings", icon: "ph-globe" },
    { path: "/instructions", label: "Instructions", icon: "ph-file-text" },
  ];
  
  return (

    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar title="Dashboard" links={links} />

      {/* Main Content */}
      <div className="flex-1 p-6 text-gray-300">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard Overview</h1>
          </div>
          <div className="text-right space-y-2">
            <p className="text-xl text-gray-400">Welcome</p>
            <p className="text-lg font-bold text-blue-500">{userEmail}</p>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg hover:shadow-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <p className="text-lg">This is the main dashboard page content.</p>
      </div>
    </div>

  );
};

export default Dashboard;
