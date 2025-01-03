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
import Testpage from './pages/Testpage';
import Teststorage from './pages/Teststorage';
import Testfirestore from './pages/Testfirestore';
import Testfunctions from './pages/Testfunctions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addclient" element={<Addclient />} />
        <Route path="/editclient" element={<Editclient />} />
        <Route path="/viewclient/:idNumber" element={<Viewclient />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/developernotes" element={<Developernotes />} />
        <Route path="/testpage" element={<Testpage />} />
        <Route path="/teststorage" element={<Teststorage />} />
        <Route path="/testfirestore" element={<Testfirestore />} />
        <Route path="/testfunctions" element={<Testfunctions />} />

      </Routes>
    </Router>
  );
}

export default App;
