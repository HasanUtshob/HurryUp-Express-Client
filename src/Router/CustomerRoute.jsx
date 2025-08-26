import React from "react";
import useAuth from "../hooks/useAuth";
import Loading from "../Loading/Loading";
import { Navigate, useLocation } from "react-router";

const CustomerRoute = ({ children }) => {
  const { user, loading, userData } = useAuth();
  const location = useLocation();

  if (loading || !userData) return <Loading />;

  if (!user || userData.role !== "customer") {
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  return children;
};

export default CustomerRoute;
