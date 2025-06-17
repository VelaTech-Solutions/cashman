import * as React from 'react';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import MainGrid from '../components/MainGrid';
import SideMenu from '../components/SideMenu';
import AppTheme from '../pages/shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';


import { useState, useEffect } from 'react';

import AddClient from '../pages/Client/ClientAddPage'
import ViewClient from '../pages/Client/ClientViewPage'
import ClientProfilePage from '../pages/Client/ClientProfilePage';

import DevelopPage from '../pages/DevelopPage';
import Instructions from '../components/Help/Instructions'

import BudgetPage from '../pages/BudgetPage';
import Budget from '../components/Budget/Budget';
import InsuranceBreakdown from '../components/Budget/InsuranceBreakdown';
import BudgetSummary from "../components/Budget/BudgetSummary";
import HelpBudget from '../components/Help/HelpBudget';

import TransactionsPage from '../pages/TransactionsPage';
import ViewTransactions from '../components/Transactions/ViewTransactions/ViewTransactions';
import EditTransactions from '../components/Transactions/EditTransactions/EditTransactions';
import CategorizeTransactions from '../components/Transactions/CategorizeTransactions/CategorizeTransactions';
import ExtractTransactions from '../components/Transactions/ExtractTransactions/ExtractTransactions';
import HelpTransactions from '../components/Help/HelpTransactions';

import ArchivePage from '../pages/ArchivePage';
import ArchivedData from '../components/ArchivedData/ArchivedData';

import SettingsPage from './SettingsPage';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};



export default function Dashboard(props) {
  const [activePage, setActivePage] = useState("Home");
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  return (
    <AppTheme >
    {/* <AppTheme {...props} themeComponents={xThemeComponents}> */}
      {/* <CssBaseline enableColorScheme /> */}
      <Box sx={{ display: 'flex', color: 'text.primary' }}>
        <SideMenu 
        setActivePage={setActivePage} 
        setActiveSubPage={setActiveSubPage}
        activePage={activePage}
        selectedClientId={selectedClientId}
        />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            height: '100vh',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {/* <MainGrid /> */}
            {activePage === 'Home' && <MainGrid />}
            {activePage === 'Add Client' && <AddClient />}
            {activePage === 'Clients' && (
              <ViewClient 
              setActivePage={setActivePage} 
              setSelectedClientId={setSelectedClientId} />
            )}
            {activePage === 'Development Notes' && (<DevelopPage /> )}
            {/* Instructions */}
            {activePage === 'Instructions' && (<Instructions /> )}
   
            {activePage === 'ClientProfile' && selectedClientId && (
              <ClientProfilePage clientId={selectedClientId} />
              )}

            {/* render this if Budget Report is selected */}
            {activePage === 'Budget Report' && (
              <>
                <BudgetPage
                  clientId={selectedClientId}
                  setActiveSubPage={setActiveSubPage}
                />
                  {activeSubPage === 'View' && <Budget clientId={selectedClientId}/>}
                  {activeSubPage === 'Insurance' && <InsuranceBreakdown clientId={selectedClientId}/>}
                  {activeSubPage === 'Summary' && <BudgetSummary clientId={selectedClientId}/>}
                  {activeSubPage === 'Help' && <HelpBudget />}
              </>
            )}

            {/* render this if Transactions is selected */}
            {activePage === 'Transactions' && (
              <>
                <TransactionsPage
                  clientId={selectedClientId}
                  setActiveSubPage={setActiveSubPage}
                />
                {activeSubPage === 'View' && <ViewTransactions clientId={selectedClientId} />}
                {activeSubPage === 'Edit' && <EditTransactions clientId={selectedClientId} />}
                {activeSubPage === 'Categorize' && <CategorizeTransactions clientId={selectedClientId} />}
                {activeSubPage === 'Extract' && <ExtractTransactions clientId={selectedClientId} />}
                {activeSubPage === 'Help' && <HelpTransactions />}
              </>
            )}

            {/* render Archive */}
            {activePage === 'Archive Data' && (
              <>
                <ArchivePage
                  clientId={selectedClientId}
                  setActiveSubPage={setActiveSubPage}
                />
                  {activeSubPage === 'View' && <ArchivedData clientId={selectedClientId}/>}

              </>
            )}
            {/* {activePage === 'Archive' && <ArchivePage clientId={selectedClientId}/>} */}

            {activePage === 'Settings' && <SettingsPage />}


            
            {/* after clicking the client how to render the client profile page here too */}
            {!activePage && <>Problems???</>}


          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}


