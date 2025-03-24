import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = ({ links }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === "javascript:void(0)") {
      navigate(-1); // Go back to the previous page
    } else {
      navigate(path); // Navigate to the specified path
    }
  };

  return (
    <motion.div
      className="lg:w-64 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6 space-y-8 shadow-xl hidden lg:block"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 pt-4">
        <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">
          Cash Flow Manager
        </h1>
      </div>

      {/* Divider */}
      <div className="w-full h-0.5 bg-gray-700"></div>

      <nav className="space-y-6">
  {links && links.length > 0 ? (
    links.map((link, index) => {
      if (link.type === "divider") {
        return <div key={index} className="w-full h-0.5 bg-gray-700" />;
      }

      if (link.type === "custom") {
        return <div key={index}>{link.content}</div>;
      }

      if (link.path === "javascript:void(0)") {
        return (
          <button
            key={index}
            className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md w-full"
            onClick={() => handleNavigation(link.path)}
          >
            <i className={`${link.icon} text-xl text-blue-400`}></i>
            <span className="text-white">{link.label}</span>
          </button>
        );
      }

      return (
        <Link
          key={index}
          to={link.path}
          className="flex items-center space-x-3 py-2 px-3 rounded-lg bg-gray-800 hover:bg-blue-500 transition hover:shadow-md w-full"
        >
          <i className={`${link.icon} text-xl text-blue-400`}></i>
          <span className="text-white">{link.label}</span>
        </Link>
      );
    })
  ) : (
    <p className="text-gray-500">No navigation links provided.</p>
  )}
</nav>


      {/* Divider */}
      <div className="w-full h-0.5 bg-gray-700"></div>

      {/* Footer */}
      <div className="mt-auto text-left text-gray-500 text-sm">
        Integra Wealth ©<br />
        All Rights Reserved 2025
      </div>
    </motion.div>
  );
};

export default Sidebar;
