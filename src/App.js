// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

import Settings from "./pages/Settings";
import CategorySettings from "./pages/CategorySettings";
import Developernotes from "./pages/Developernotes";

import Testpage from "./testpages/Testpage";
import Teststorage from "./testpages/Teststorage";
// import Testfirestore from './testpages/Testfirestore';
import Testfunctions from "./testpages/Testfunctions";
import Testdash from "./testpages/Testdash";
import Testviewclient from "./testpages/Testviewclient";
import Testclientprofile from "./testpages/Testclientprofile";

import ProtectedRoute from "./components/ProtectedRoute"; // Import the component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/instructions" element={<Instructions />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/addclient" element={<Addclient />} />

        <Route path="/editclient" element={<Editclient />} />
        <Route path="/vieweditclient/:id" element={<ViewEditclient />} />

        <Route path="/viewclient" element={<Viewclient />} />
        <Route path="/client/:id" element={<Clientprofile />} />
        <Route path="/client/:id/profile" element={<Profile />} />
        <Route path="/client/:id/transactions" element={<ViewTransactions />} />
        <Route
          path="/client/:id/edit-transactions"
          element={<EditTransactions />}
        />
        <Route
          path="/client/:id/categorize"
          element={<CategorizeTransactions />}
        />
        <Route path="/client/:id/reports" element={<ViewReports />} />

        <Route
          path="/transactiondatabase/:id"
          element={<Transactiondatabase />}
        />
        <Route
          path="/ExtractTransactions/:id"
          element={<ExtractTransactions />}
        />

        <Route path="/settings" element={<Settings />} />
        <Route path="/categorysettings" element={<CategorySettings />} />
        <Route path="/developernotes" element={<Developernotes />} />

        {/* TEST PAGES */}
        <Route path="/testpage" element={<Testpage />} />
        <Route path="/teststorage" element={<Teststorage />} />
        {/* <Route path="/testfirestore" element={<Testfirestore />} /> */}
        <Route path="/testfunctions" element={<Testfunctions />} />
        <Route path="/testdash" element={<Testdash />} />
        <Route path="/testviewclient" element={<Testviewclient />} />
        <Route path="/testclientprofile/:id" element={<Testclientprofile />} />
      </Routes>
    </Router>
  );
}

export default App;
