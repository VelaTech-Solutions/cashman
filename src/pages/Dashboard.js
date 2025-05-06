import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Sidebar } from 'components/Common';
import { Users, FileText, AlertTriangle, ClipboardList } from "lucide-react";

const DashboardHeader = ({ userEmail, handleLogout }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow flex justify-between items-center">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-gray-400">Welcome</p>
          <p className="text-blue-400 font-semibold">{userEmail}</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow hover:scale-105 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-800 p-5 rounded-lg shadow flex items-center gap-4">
    <Icon className="text-blue-400 w-6 h-6" />
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState("Not logged in");
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        // client 
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
      setUserEmail(user ? user.email : "Not logged in");
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
    { path: "/addclient", label: "Add Client" },
    { path: "/editclient", label: "Edit Client" },
    { path: "/viewclient", label: "View Client" },
    { path: "/settings", label: "Settings" },
    { path: "/Help/Instructions", label: "Instructions" },
    { path: "/DevelopPage", label: "Development Notes" },

  ];

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <Sidebar title="Dashboard" links={links} />
      <div className="flex-1 p-6 space-y-6">
        <DashboardHeader userEmail={userEmail} handleLogout={handleLogout} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Clients" value={clients.length} />
          <StatCard icon={FileText} label="Reports Completed" value={0} />
          <StatCard icon={ClipboardList} label="Clients Awaiting Review" value={0} />
          <StatCard icon={AlertTriangle} label="Clients Missing Data" value={0} />
          <StatCard icon={AlertTriangle} label="Flagged Transactions" value={0} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

