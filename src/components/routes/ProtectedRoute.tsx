import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { isAuthenticated } from "../../../api/user/auth";

// Protected route props
interface ProtectedRouteProps {
  children: ReactElement;
}

// Protected route component
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
