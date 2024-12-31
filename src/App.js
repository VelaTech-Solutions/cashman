// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';  // Import the Login component
import Dashboard from './pages/Dashboard';  // Import the Dashboard page (add this later)
import Addclient from './pages/Addclient';
import Editclient from './pages/Editclient'; 
import Viewclient from './pages/Viewclient';
import Settings from './pages/Settings';
import Developernotes from './pages/Developernotes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addclient" element={<Addclient />} />
        <Route path="/editclient" element={<Editclient />} />
        <Route path="/viewclient" element={<Viewclient />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/developernotes" element={<Developernotes />} />
      </Routes>
    </Router>
  );
}

export default App;
