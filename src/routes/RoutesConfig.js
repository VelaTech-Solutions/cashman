import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "components/ProtectedRoute";

// Pages
import Login from "pages/Login";
import Dashboard from "pages/Dashboard";
import Instructions from "pages/Instructions";

import AddClient from "pages/AddClient";
import EditClient from "pages/EditClient";
import ViewEditclient from "pages/ViewEditclient";
import Viewclient from "pages/Viewclient";
import Clientprofile from "pages/Clientprofile";
import Profile from "pages/Profile";
import ViewTransactions from "pages/ViewTransactions";
import EditTransactions from "pages/EditTransactions";
import CategorizeTransactions from "pages/CategorizeTransactions";
import Transactiondatabase from "pages/Transactiondatabase";
import ExtractTransactions from "pages/ExtractTransactions";
import ExtractSettings from "pages/ExtractSettings";
import ViewReports from "pages/ViewReports";
import Budget from "pages/Budget";
import Settings from "pages/Settings";
import CategorySettings from "pages/CategorySettings";
import Developernotes from "pages/Developernotes";

// Help Pages
import HelpExtract from "help/HelpExtract";
import HelpBudget from "help/HelpBudget";


const RoutesConfig = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* ✅ Protect All Routes in One Block */}
      <Route element={<ProtectedRoute />}>
        {/* Landing Page */}
        <Route path="/dashboard" element={<Dashboard />}/>

        {/* Client Pages */}
        <Route path="/addclient" element={<AddClient />} />
        <Route path="/editclient" element={<EditClient />} />

        <Route path="/vieweditclient/:id" element={<ViewEditclient />} />
        <Route path="/viewclient" element={<Viewclient />} />
        <Route path="/client/:id" element={<Clientprofile />} />
        <Route path="/client/:id/profile" element={<Profile />} />
        <Route path="/budget/:id" element={<Budget />} />
        <Route path="/client/:id/transactions" element={<ViewTransactions />} />
        <Route path="/client/:id/edit-transactions" element={<EditTransactions />} />
        <Route path="/client/:id/categorize" element={<CategorizeTransactions />} />
        <Route path="/client/:id/reports" element={<ViewReports />} />

        <Route path="/transactiondatabase/:id" element={<Transactiondatabase />} />
        <Route path="/ExtractTransactions/:id" element={<ExtractTransactions />} />
        <Route path="/ExtractSettings/:id" element={<ExtractSettings />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/categorysettings" element={<CategorySettings />} />
        {/* <Route path="/developernotes" element={<Developernotes />} /> */}
        {/* Help pages */}
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/HelpExtract" element={<HelpExtract />} />
        <Route path="/HelpBudget" element={<HelpBudget />} />
      </Route>
    </Routes>
  );
};

export default RoutesConfig;
