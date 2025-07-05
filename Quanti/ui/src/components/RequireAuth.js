import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const access = localStorage.getItem("access");
  const location = useLocation();
  if (!access) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}