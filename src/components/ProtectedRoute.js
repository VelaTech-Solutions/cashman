import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebase";

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while Firebase checks auth
  }

  if (!user) {
    return <Navigate to="/" />; // Redirect to login page if not authenticated
  }

  return children; // Render the protected component
}

export default ProtectedRoute;
