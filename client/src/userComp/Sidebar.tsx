import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthToken, getUser } from "../../api/user/auth";

const NAV_ITEMS = [
  { icon: "home", label: "Home", path: "/home", filled: true },
  { icon: "favorite", label: "Matches", path: "/matches" },
  { icon: "post", label: "Confessions", path: "/confessions" },
  { icon: "message", label: "Chat", path: "/chat", badge: 3 },
  { icon: "person", label: "Profile", path: "/profile" },
  { icon: "settings", label: "Settings", path: "/settings" },
  { icon: "help", label: "Help", path: "/help" },
  { icon: "report", label: "Report", path: "/report" },
];

// Sidebar component
export default function Sidebar({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const userProfileImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjIcuSOD-Ap7aaa6mWBGypWocGljcoVbglK_S9R2fFpl5b4AoZ-MFsPqZ6F0qoHv7ZulJKcRtePhIhngpu-dY4e_gB3Bp1_hNjNYGEmIZPwXDXh--Qn8dpcLNOD9gt_HWRQ_XTdcrTbtEkEiHANPXA1WNEcm8OfTsy5z5HCGdY69aYXrK0ly6T0R_vmQwZn8wUI8cHy5hSIvubwVZHrtmGo6my5NBcbl5QX3HvbsLoZDzeiQj4bXjz-6jqr4V4-Ofv4rjgLu0vqB6a";

  // Check if user is admin
  useEffect(() => {
    if (getAuthToken()) {
      const role = getUser()?.role;
      setIsAdmin(role === "admin" || role === "superadmin");
    }
  }, []);

  // Navigation items
  const items = isAdmin
    ? [
        ...NAV_ITEMS,
        { icon: "admin_panel_settings", label: "Admin", path: "/admin" },
      ]
    : NAV_ITEMS;

  // Render the sidebar
  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-65"
      } hidden lg:flex flex-col border-r border-gray-100 dark:border-gray-800 h-screen bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md flex-shrink-0 transition-all duration-300`}
    >
      {/* Logo and branding */}
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

      {/* Navigation links */}
      <nav
        className={`flex flex-col gap-2 ${
          collapsed ? "px-1" : "px-2"
        } pb-4 pt-2 flex-1`}
      >
        {items.map(({ icon, label, path, filled, badge }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
              className={`flex items-center ${
                collapsed ? "justify-center px-3" : "gap-4 px-4"
              } py-3 rounded-2xl transition-all duration-200 text-slate-900 dark:text-slate-100 cursor-pointer group ${
                isActive
                  ? "bg-black/10 dark:bg-slate-900/50"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              <span className="relative">
                <span
                  className={`material-symbols-outlined text-[28px] group-hover:scale-105 transition-transform ${
                    isActive || filled ? "fill-current" : ""
                  }`}
                >
                  {icon}
                </span>
                {badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span
                  className={`text-sm ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile card */}
      {!collapsed ? (
        <div className="flex flex-col gap-4 p-4 border-t border-gray-100 dark:border-gray-800">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-full select-none bg-[#f1f3f8] dark:bg-[#1c1d23] border border-black/5 dark:border-white/5 shadow-[10px_10px_20px_rgba(0,0,0,0.08),_-10px_-10px_20px_rgba(255,255,255,0.9)] dark:shadow-[10px_10px_20px_rgba(0,0,0,0.55),_-10px_-10px_20px_rgba(255,255,255,0.04)] hover:shadow-[12px_12px_22px_rgba(0,0,0,0.10),_-12px_-12px_22px_rgba(255,255,255,0.95)] dark:hover:shadow-[12px_12px_22px_rgba(0,0,0,0.60),_-12px_-12px_22px_rgba(255,255,255,0.05)] transition-shadow duration-300"
          >
            <div className="shrink-0 p-[3px] rounded-full bg-[#f1f3f8] dark:bg-[#1c1d23] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-2px_-2px_6px_rgba(255,255,255,0.04)]">
              <div
                className="h-11 w-11 rounded-full bg-cover bg-center border border-black/5 dark:border-white/5 shadow-[6px_6px_12px_rgba(0,0,0,0.12),_-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.6),_-6px_-6px_12px_rgba(255,255,255,0.04)]"
                style={{ backgroundImage: `url("${userProfileImage}")` }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Alex Doe
              </span>
              <span className="text-xs text-gray-500">@alex_ui</span>
            </div>
            <span className="ml-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#f1f3f8] dark:bg-[#1c1d23] border border-black/5 dark:border-white/5 shadow-[6px_6px_12px_rgba(0,0,0,0.08),_-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.55),_-6px_-6px_12px_rgba(255,255,255,0.04)]">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">
                more_horiz
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex justify-center">
          <button
            className="w-10 h-10 rounded-full bg-cover bg-center hover:ring-2 hover:ring-primary transition-all"
            style={{ backgroundImage: `url("${userProfileImage}")` }}
            onClick={() => navigate("/profile")}
            title="Profile"
          />
        </div>
      )}
    </aside>
  );
}
