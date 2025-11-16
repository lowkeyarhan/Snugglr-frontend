import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { isAuthenticated, getAuthToken } from "../API/auth";
import { checkAdminStatus } from "../API/api";

interface AdminRouteProps {
  children: ReactElement;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (token) {
          const response = await checkAdminStatus(token);
          setIsAdmin(response.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
