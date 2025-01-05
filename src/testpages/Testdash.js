// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import '../styles/tailwind.css';

// firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../firebase/firebase'; // Ensure this is the correct path
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Testdash = () => {
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


  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const clientsSnapshot = await getDocs(collection(db, "clients"));
      setClientCount(clientsSnapshot.size);
    };
    fetchData();
  }, []);
  

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`lg:w-64 w-72 bg-gray-800 p-4 space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center space-x-3 pb-4">
          <img src="https://assets.codepen.io/285131/almeria-logo.svg" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold text-white">Cash Flow Manager</h1>
        </div>
        <nav className="flex-grow space-y-4">
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
        </nav>


        {/* Can we move this to the foot of the siderbar */}
        <div className="mt-auto text-center text-gray-500 text-sm">
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Welcome  {userEmail} </span>
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
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <div className="flex items-center justify-between">
              <div className="relative flex-grow">
                <i className="ph-magnifying-glass absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

              </div>
            </div>

            {/* display Number of clients in db */}
            <div className="mt-4">
                <p className="text-gray-400">Number of clients: {clientCount}</p>
            </div>


            {/*  Reports Incomplete*/}
            <div className="mt-4">
              <p className="text-gray-400">Reports Incomplete: 0</p>
            </div>
            {/*  Reports Completed*/}
            <div className="mt-4">
              <p className="text-gray-400">Reports Completed: 0</p>
            </div>
          </section>
        </div>

        <footer className="mt-auto text-center text-gray-500 text-sm">

        </footer>
      </div>
    </div>
  );
};

export default Testdash;
