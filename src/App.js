// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import RoutesConfig from "./routes/RoutesConfig"; // Import new routes config
import Loader from "components/Loader";
import { TemplateProvider } from "components/TemplateContext";  // Import the provider

const App = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {loading && <Loader />}
      <RoutesConfig />
    </div>
  );
};

// ✅ Wrap `App` inside `TemplateProvider`
const WrappedApp = () => (
  <TemplateProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </Router>
  </TemplateProvider>
);

export default WrappedApp;
