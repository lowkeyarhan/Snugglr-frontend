import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { isAuthenticated } from "../../../api/user/auth";

// Public route props
interface PublicRouteProps {
  children: ReactElement;
}

// Public route component
export default function PublicRoute({ children }: PublicRouteProps) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
