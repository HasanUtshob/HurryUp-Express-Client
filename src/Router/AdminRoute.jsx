import React from "react";
import { Navigate, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user, userData } = useAuth();
  const location = useLocation();
  // Not admin or not logged in
  if (!user || userData?.role !== "admin") {
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
