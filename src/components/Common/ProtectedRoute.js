import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>; // Prevents rendering before auth loads

  return user ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default ProtectedRoute;
