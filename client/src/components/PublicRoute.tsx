import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { isAuthenticated } from "../API/auth";

interface PublicRouteProps {
  children: ReactElement;
}

/**
 * PublicRoute Component
 * Wraps public routes (auth page) that should redirect to home if user is already logged in
 * This prevents authenticated users from accessing login/signup pages
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
