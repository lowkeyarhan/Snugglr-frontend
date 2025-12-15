import { Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import { isAuthenticated, getAuthToken } from "../userAPI/auth";
import { getUser } from "../userAPI/auth";

interface AdminRouteProps {
  children: ReactElement;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const verifyAdmin = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (token) {
          // Check cache first
          const lastCheck = localStorage.getItem("adminCheckTimestamp");
          const now = Date.now();
          const cacheExpiry = 5 * 60 * 1000; // 5 minutes
          const cachedAdmin = localStorage.getItem("isAdmin");

          if (
            lastCheck &&
            cachedAdmin !== null &&
            now - parseInt(lastCheck) < cacheExpiry
          ) {
            // Use cached value
            setIsAdmin(cachedAdmin === "true");
            setLoading(false);
            return;
          }

          // Determine admin locally from stored user role
          const u = getUser();
          const role = u?.role;
          const nextIsAdmin = role === "admin" || role === "superadmin";
          setIsAdmin(nextIsAdmin);
          localStorage.setItem("isAdmin", nextIsAdmin.toString());
          localStorage.setItem("adminCheckTimestamp", now.toString());
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
