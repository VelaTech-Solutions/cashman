// RoutesConfig.js

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "components/Common/ProtectedRoute";
import AppLayout from "components/Common/AppLayout";
// Pages
import Login from "pages/Login";
//import Dashboard from "pages/DashboardPage";
import Dashboard from "pages/Dashboard";
// import Instructions from "pages/Help/Instructions";
import Budget from "pages/BudgetPage";
import DevelopPage from "pages/DevelopPage";
import ArchivePage from "pages/ArchivePage"; // main

// Client Pages
import AddClient from "pages/Client/ClientAddPage";
import EditClient from "pages/Client/ClientEditPage";
import ViewEditclient from "pages/Client/ViewEditclient";
import Viewclient from "pages/Client/ClientViewPage";
import Clientprofile from "pages/Client/ClientProfilePage";

// Transaction Pages
import TransactionsPage from "pages/TransactionsPage";
import ViewTransactions from "components/Transactions/ViewTransactions/ViewTransactions";
import EditTransactions from "components/Transactions/EditTransactions/EditTransactions";
import ExtractTransactions from "components/Transactions/ExtractTransactions/ExtractTransactions";
import CategorizeTransactions from "components/Transactions/CategorizeTransactions/CategorizeTransactions";
import ViewReports from "pages/Reports/ViewReports";

// Settings Pages
import Settings from "pages/SettingsPage";
import ViewSettings from "components/Settings/ViewSettings/ViewSettings";
import EditSettings from "components/Settings/EditSettings/EditSettings";
import CategorySettings from "components/Settings/CategorySettings/CategorySettingsPage";
import ExtractSettings from "components/Settings/ExtractSettings/ExtractSettingsPage";
import DatabaseSettings from "components/Settings/DatabaseSettings/DatabaseSettingsPage";
import BudgetSettingsPage from "components/Settings/BudgetSettings/BudgetSettingsPage";

// Help Pages
import HelpTransactions from "components/Help/HelpTransactions";
import HelpBudget from "components/Help/HelpBudget";


const RoutesConfig = () => {
  return (

    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
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
            <Route path="/budget/:id" element={<Budget />} />
            <Route path="/client/:id/transactionspage" element={<TransactionsPage />} />
            <Route path="/client/:id/view-transactions" element={<ViewTransactions />} />
            <Route path="/client/:id/edit-transactions" element={<EditTransactions />} />
            <Route path="/client/:id/extract-transactions" element={<ExtractTransactions />} />
            <Route path="/client/:id/categorize-transactions" element={<CategorizeTransactions />} />
            <Route path="/client/:id/reports" element={<ViewReports />} />

            {/* Archive Pages */}
            <Route path="/client/:id/archive" element={<ArchivePage />} />

            {/* Settings Pages */}
            <Route path="/viewsettings/:id" element={<ViewSettings />} />
            <Route path="/EditSettings" element={<EditSettings />} />
            <Route path="/categorysettings/:id" element={<CategorySettings />} />
            <Route path="/extractsettings/:id" element={<ExtractSettings />} />
            <Route path="/databasesettings" element={<DatabaseSettings />} />
            <Route path="/budgetsettings" element={<BudgetSettingsPage />} />
            <Route path="/settings" element={<Settings />} />

            {/* Help pages */}
            <Route path="/DevelopPage" element={<DevelopPage />} />
            {/* <Route path="/Help/instructions" element={<Instructions />} /> */}
            <Route path="/HelpTransactions" element={<HelpTransactions />} />
            <Route path="/HelpBudget" element={<HelpBudget />} />
          </Route>
        </Route>
    </Routes>

  );
};

export default RoutesConfig;
