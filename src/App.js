import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Instructions from "./pages/Instructions";
import Addclient from "./pages/Addclient";
import Editclient from "./pages/Editclient";
import ViewEditclient from "./pages/ViewEditclient";

import Viewclient from "./pages/Viewclient";
import Clientprofile from "./pages/Clientprofile";
import Profile from "./pages/Profile";
import ViewTransactions from "./pages/ViewTransactions";
import EditTransactions from "./pages/EditTransactions";
import CategorizeTransactions from "./pages/CategorizeTransactions";
import Transactiondatabase from "./pages/Transactiondatabase";
import ExtractTransactions from "./pages/ExtractTransactions";
import ViewReports from "./pages/ViewReports";
import Budget from "./pages/Budget"

import Settings from "./pages/Settings";
import CategorySettings from "./pages/CategorySettings";
import Developernotes from "./pages/Developernotes";

// Help
import HelpExtract from "./help/HelpExtract";
import HelpBudget from "./help/HelpBudget";


import ProtectedRoute from "./components/ProtectedRoute"; 
import Loader from "./components/Loader";

const App = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation(); // Detect route changes

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Simulate loading delay
    return () => clearTimeout(timer);
  }, [location.pathname]); // Trigger on every route change

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {loading && <Loader />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/instructions" element={<Instructions />} />

        <Route path="/addclient" element={<Addclient />} />
        <Route path="/editclient" element={<Editclient />} />
        <Route path="/vieweditclient/:id" element={<ViewEditclient />} />
        <Route path="/viewclient" element={<Viewclient />} />
        <Route path="/client/:id" element={<Clientprofile />} />
        <Route path="/client/:id/profile" element={<Profile />} />
        <Route path="/budget/:id" element={<Budget/>}/>
        <Route path="/client/:id/transactions" element={<ViewTransactions />} />
        <Route path="/client/:id/edit-transactions" element={<EditTransactions />} />
        <Route path="/client/:id/categorize" element={<CategorizeTransactions />} />
        <Route path="/client/:id/reports" element={<ViewReports />} />

        <Route path="/transactiondatabase/:id" element={<Transactiondatabase />} />
        <Route path="/ExtractTransactions/:id" element={<ExtractTransactions />} />
        
        <Route path="/HelpExtract" element={<HelpExtract />} />
        <Route path="/HelpBudget" element={<HelpBudget />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/categorysettings" element={<CategorySettings />} />
        {/* <Route path="/developernotes" element={<Developernotes />} /> */}
        
      </Routes>
    </div>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
