import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "styles/tailwind.css";

// Firebase imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

// Component Imports
import { Sidebar } from 'components/Common';

// Mouse-Tracking Header Component
const DashboardHeader = ({ userEmail, handleLogout }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 flex items-center justify-between relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1), transparent)`
      }}
    >
      <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-md">
        Dashboard
      </h1>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-lg text-gray-300">Welcome</p>
          <p className="text-lg font-semibold text-blue-400 drop-shadow-sm">{userEmail}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Clients Carousel Component
const ClientsCarousel = ({ clients }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!clients || clients.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % clients.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [clients]);

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 text-center mt-6">
        <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md mb-4">
          Clients
        </h2>
        <p className="text-gray-300">No clients found.</p>
      </div>
    );
  }

  const currentClient = clients[currentIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 mt-6">
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 relative overflow-hidden">
        <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md mb-4">
          Clients
        </h2>
        <div className="p-4 bg-gray-700 rounded-lg shadow-md transition-all duration-500 ease-in-out">
          <p className="text-white font-semibold">
            Name: {currentClient.clientName || "Client Name"}
          </p>
          <p className="text-gray-300">
            Surname: {currentClient.clientSurname || "Client Surname"}
          </p>
          <p className="text-gray-300">
            Bank Name: {currentClient.bankName || "Bank Name"}
          </p>
          <p className="text-gray-400 text-sm">ID: {currentClient.id}</p>
        </div>
      </div>
    </div>
  );
};



{/* Dashboard Content similar look to DashboardHeader */}


const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail("Not logged in");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const links = [
    { path: "/addclient", label: "Add Client", icon: "ph-check-square" },
    { path: "/editclient", label: "Edit Client", icon: "ph-swap" },
    { path: "/viewclient", label: "View Client", icon: "ph-file-text" },
    { path: "/settings", label: "Settings", icon: "ph-globe" },
    { path: "/Help/Instructions", label: "Instructions", icon: "ph-file-text" },
  ];




  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar title="Dashboard" links={links} />

      {/* Main Content */}
      <div className="flex-1 p-6 text-gray-300">
        {/* Header */}
        <DashboardHeader userEmail={userEmail} handleLogout={handleLogout} />

      {/* Dashboard Content */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-4">
            <h2 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
              Total Clients
            </h2>
            <p className="text-3xl font-semibold text-blue-400 drop-shadow-sm">
              {clients.length}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4">
            <h2 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
              Pending Transactions
            </h2>
            <p className="text-3xl font-semibold text-blue-400 drop-shadow-sm">
              17
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4">
            <h2 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
              Uncategorized Entries
            </h2>
            <p className="text-3xl font-semibold text-blue-400 drop-shadow-sm">
              8
            </p>
          </div>
        </div>
      </div>



        {/* Clients Carousel */}
        <ClientsCarousel clients={clients} />
      </div>
    </div>
  );
};

export default Dashboard;
