// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Addclient from './pages/Addclient';
import Editclient from './pages/Editclient'; 
import Viewclient from './pages/Viewclient';
import Settings from './pages/Settings';
import Developernotes from './pages/Developernotes';
import Clientprofile from './pages/Clientprofile';

import Testpage from './testpages/Testpage';
import Teststorage from './testpages/Teststorage';
import Testfirestore from './testpages/Testfirestore';
import Testfunctions from './testpages/Testfunctions';
import Testdash from './testpages/Testdash';
import Testviewclient from './testpages/Testviewclient';
import Testclientprofile from './testpages/Testclientprofile';


import ProtectedRoute from './components/ProtectedRoute'; // Import the component



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/addclient" element={<Addclient />} />
        <Route path="/editclient" element={<Editclient />} />
        <Route path="/viewclient" element={<Viewclient />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/developernotes" element={<Developernotes />} />
        <Route path="/client/:id" element={<Clientprofile />} />

        <Route path="/testpage" element={<Testpage />} />
        <Route path="/teststorage" element={<Teststorage />} />
        <Route path="/testfirestore" element={<Testfirestore />} />
        <Route path="/testfunctions" element={<Testfunctions />} />
        <Route path="/testdash" element={<Testdash />} />
        <Route path="/testviewclient" element={<Testviewclient />} />
        <Route path="/testclientprofile/:id" element={<Testclientprofile />} />


      </Routes>
    </Router>
  );
}

export default App;
