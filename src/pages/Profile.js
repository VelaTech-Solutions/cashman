// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import "styles/tailwind.css";

// Component Imports
import { Sidebar } from 'components/Common';

const links = [
  { path: "/dashboard", label: "Back to Dashboard", icon: "ph-home" },
  { path: "javascript:void(0)", label: "Back", icon: "ph-home" },
];

const Profile = () => {
  const [error, setError] = useState(null);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar title="Profile" links={links} />

      {/* Main content */}
      <div className="flex-1 p-8">
        <div
          className="space-y-8"
        >
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
              View Profile
            </h2>
            {/* Add your report rendering logic here */}
            <p className="text-lg text-gray-400">
              This is the placeholder for report rendering functionality.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
