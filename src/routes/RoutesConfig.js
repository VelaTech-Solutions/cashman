import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "components/ProtectedRoute";

// Pages
import Login from "pages/Login";
import Dashboard from "pages/Dashboard";
import Instructions from "pages/Help/Instructions";
import Budget from "pages/Budget";

// Client Pages
import AddClient from "pages/Client/ClientAddPage";
import EditClient from "pages/Client/ClientEditPage";
import ViewEditclient from "pages/Client/ViewEditclient";
import Viewclient from "pages/Client/Viewclient";
import Clientprofile from "pages/Client/ClientProfilePage";

// Transaction Pages
import TransactionsPage from "pages/Transactions/TransactionsPage";
import ViewTransactions from "pages/Transactions/ViewTransactions";
import EditTransactions from "pages/Transactions/EditTransactions";
import ExtractTransactions from "pages/Transactions/ExtractTransactions";
import CategorizeTransactions from "pages/Transactions/CategorizeTransactions";
import ViewReports from "pages/Reports/ViewReports";

// Settings Pages
import Settings from "pages/Settings";
import ViewSettings from "components/Settings/ViewSettings"
import EditSettings from "components/Settings/EditSettings"
import CategorySettings from "components/Settings/CategorySettings";
import ExtractSettings from "components/Settings/ExtractSettings";

import Developernotes from "pages/Developernotes";
import Profile from "pages/Profile";

// Help Pages
import HelpView from "components/Help/HelpView";
import HelpEdit from "components/Help/HelpEdit";
import HelpCategory from "components/Help/HelpCategory"
import HelpExtract from "components/Help/HelpExtract";
import HelpBudget from "components/Help/HelpBudget";


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
        <Route path="/client/:id/transactionspage" element={<TransactionsPage />} />
        <Route path="/client/:id/view-transactions" element={<ViewTransactions />} />
        <Route path="/client/:id/edit-transactions" element={<EditTransactions />} />
        <Route path="/client/:id/extract-transactions" element={<ExtractTransactions />} />
        <Route path="/client/:id/categorize-transactions" element={<CategorizeTransactions />} />
        <Route path="/client/:id/reports" element={<ViewReports />} />

        {/* Settings Pages */}
        <Route path="/viewsettings/:id" element={<ViewSettings />} />
        <Route path="/EditSettings" element={<EditSettings />} />
        <Route path="/categorysettings/:id" element={<CategorySettings />} />
        <Route path="/extractsettings/:id" element={<ExtractSettings />} />
        <Route path="/settings" element={<Settings />} />
        {/* <Route path="/developernotes" element={<Developernotes />} /> */}

        {/* Help pages */}
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/HelpView" element={<HelpView />} />
        <Route path="/HelpEdit" element={<HelpEdit />} />   
        <Route path="/HelpCategory" element={<HelpCategory />} />
        <Route path="/HelpExtract" element={<HelpExtract />} />
        <Route path="/HelpBudget" element={<HelpBudget />} />
      </Route>
    </Routes>
  );
};

export default RoutesConfig;
