import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "components/ProtectedRoute";

// Pages
import Login from "pages/Login";
import Dashboard from "pages/Dashboard";
import Instructions from "pages/Help/Instructions";

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
import Transactiondatabase from "pages/Transactions/Transactiondatabase";

import ViewReports from "pages/Reports/ViewReports";

// Settings Pages
import Budget from "pages/Budget";
import Settings from "pages/Settings";
// import ViewSettings from "settings/ViewSettings"
// import EditSettings from "settings/EditSettings"
import ExtractSettings from "settings/ExtractSettings";
import CategorySettings from "settings/CategorySettings";


import Developernotes from "pages/Developernotes";
import Profile from "pages/Profile";

// Help Pages
// import HelpView from "help/HelpView";
// import HelpEdit from "help/HelpEdit";
import HelpExtract from "help/HelpExtract";
import HelpCategory from "help/HelpCategory"
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

        <Route path="/client/:id/transactionspage" element={<TransactionsPage />} />
        <Route path="/client/:id/view-transactions" element={<ViewTransactions />} />
        <Route path="/client/:id/edit-transactions" element={<EditTransactions />} />
        <Route path="/client/:id/extract-transactions" element={<ExtractTransactions />} />
        <Route path="/client/:id/categorize-transactions" element={<CategorizeTransactions />} />
        <Route path="/transactiondatabase/:id" element={<Transactiondatabase />} />

        <Route path="/client/:id/reports" element={<ViewReports />} />
        {/* <Route path="/viewsettings/:id" element={<ViewSettings />} />
        <Route path="/editsettings/:id" element={<EditSettings />} /> */}
        <Route path="/extractsettings/:id" element={<ExtractSettings />} />
        <Route path="/categorysettings/:id" element={<CategorySettings />} />
        <Route path="/settings" element={<Settings />} />
        {/* <Route path="/developernotes" element={<Developernotes />} /> */}

        {/* Help pages */}
        <Route path="/instructions" element={<Instructions />} />
        {/* <Route path="/HelpView" element={<HelpView />} />
        <Route path="/HelpEdit" element={<HelpEdit />} />    */}
        <Route path="/HelpExtract" element={<HelpExtract />} />
        <Route path="/HelpCategory" element={<HelpCategory />} />
        <Route path="/HelpBudget" element={<HelpBudget />} />
      </Route>
    </Routes>
  );
};

export default RoutesConfig;
