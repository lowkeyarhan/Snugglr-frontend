import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getAuthToken, getUser } from "../userAPI/auth";

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(() => {
    const cached = localStorage.getItem("isAdmin");
    return cached === "true";
  });
  const hasCheckedAdmin = useRef(false);

  const userProfileImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjIcuSOD-Ap7aaa6mWBGypWocGljcoVbglK_S9R2fFpl5b4AoZ-MFsPqZ6F0qoHv7ZulJKcRtePhIhngpu-dY4e_gB3Bp1_hNjNYGEmIZPwXDXh--Qn8dpcLNOD9gt_HWRQ_XTdcrTbtEkEiHANPXA1WNEcm8OfTsy5z5HCGdY69aYXrK0ly6T0R_vmQwZn8wUI8cHy5hSIvubwVZHrtmGo6my5NBcbl5QX3HvbsLoZDzeiQj4bXjz-6jqr4V4-Ofv4rjgLu0vqB6a";

  useEffect(() => {
    if (hasCheckedAdmin.current) return;

    const checkAdmin = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const lastCheck = localStorage.getItem("adminCheckTimestamp");
          const now = Date.now();
          const cacheExpiry = 5 * 60 * 1000;

          if (!lastCheck || now - parseInt(lastCheck) > cacheExpiry) {
            hasCheckedAdmin.current = true;
            const u = getUser();
            const role = u?.role;
            const nextIsAdmin = role === "admin" || role === "superadmin";
            setIsAdmin(nextIsAdmin);
            localStorage.setItem("isAdmin", nextIsAdmin.toString());
            localStorage.setItem("adminCheckTimestamp", now.toString());
          } else {
            hasCheckedAdmin.current = true;
            console.log("Using cached admin status");
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        hasCheckedAdmin.current = true;
      }
    };

    checkAdmin();
  }, []);

  interface NavItem {
    icon: string;
    label: string;
    path: string;
    filled?: boolean;
    badge?: number;
    adminOnly?: boolean;
  }

  const allNavItems: NavItem[] = [
    { icon: "home", label: "Home", path: "/home", filled: true },
    { icon: "favorite", label: "Matches", path: "/matches" },
    { icon: "forum", label: "Confessions", path: "/confessions" },
    { icon: "mail", label: "Chat", path: "/chat", badge: 3 },
    { icon: "person", label: "Profile", path: "/profile" },
    { icon: "settings", label: "Settings", path: "/settings" },
    { icon: "help", label: "Help", path: "/help" },
    { icon: "report", label: "Report", path: "/report" },
  ];

  const adminNavItems: NavItem[] = [
    {
      icon: "admin_panel_settings",
      label: "Admin",
      path: "/admin",
      adminOnly: true,
    },
  ];

  const navItems = [...allNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } hidden lg:flex flex-col border-r border-gray-100 dark:border-gray-800 h-screen bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md flex-shrink-0 transition-all duration-300`}
    >
      {/* Branding */}
      <div
        className={`flex items-center gap-3 ${
          collapsed ? "px-4 py-8 justify-center" : "px-6 py-8"
        }`}
      >
        {!collapsed && (
          <h1
            className="text-3xl font-light tracking-tight"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Snugglr
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex flex-col gap-2 ${
          collapsed ? "px-1" : "px-2"
        } pb-4 pt-2 flex-1`}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`flex items-center ${
                collapsed ? "justify-center px-3" : "gap-4 px-4"
              } py-3 rounded-2xl transition-all duration-200 text-slate-900 dark:text-slate-100 cursor-pointer group ${
                isActive
                  ? "bg-black/10 dark:bg-slate-900/50"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span
                className={`material-symbols-outlined text-[28px] group-hover:scale-105 transition-transform ${
                  isActive || item.filled ? "fill-current" : ""
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span
                    className={`text-sm ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="flex flex-col gap-4 p-4 border-t border-gray-100 dark:border-gray-800">
          {/* Premium Button */}
          <button className="w-full flex items-center justify-center gap-2 bg-black shadow-lg shadow-black/30 text-white p-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02]">
            <span className="text-sm font-bold tracking-wide">Go Premium</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>

          {/* User Profile */}
          <div
            className="flex items-center gap-3 px-2 py-2 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
            onClick={() => navigate("/profile")}
          >
            <div
              className="h-10 w-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700"
              style={{
                backgroundImage: `url("${userProfileImage}")`,
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Alex Doe
              </span>
              <span className="text-xs text-gray-500">@alex_ui</span>
            </div>
            <span className="material-symbols-outlined ml-auto text-gray-400 text-sm">
              more_horiz
            </span>
          </div>
        </div>
      )}

      {/* User Profile (collapsed mode only) */}
      {collapsed && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex justify-center">
          <button
            className="w-10 h-10 rounded-full bg-cover bg-center hover:ring-2 hover:ring-primary transition-all"
            style={{
              backgroundImage: `url("${userProfileImage}")`,
            }}
            onClick={() => navigate("/profile")}
            title="Profile"
          />
        </div>
      )}
    </aside>
  );
}
