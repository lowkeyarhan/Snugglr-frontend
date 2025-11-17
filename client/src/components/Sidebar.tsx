import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import universityLogo from "../assets/university-logo.png";
import { checkAdminStatus } from "../API/api";
import { getAuthToken } from "../API/auth";

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
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_iPJIQrt9-mW5A2ydCh3Yxc4LvljOrKyoltkptN-cVP6DbgD5zAnr4dEs77kaw5Z8IqCaskYDyn_nJ-7e1EQD6Mb6OXgIyrvFZGK4vcEV_4flgPXBJhCJYP4RWJgmdloYhBZdEczYdkPD91Lbxip2szT9kOihSNg5cv4LAw4gFIEslHasQHpUQwZvWBs8cSEUqlKhDBI0KtNhHEcGz1lzukeOzUbX5Zg0W62uoUsmn7g8g5pIk7t8OIfrlI8EmzJYYxJH5A9BR92";

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
            const response = await checkAdminStatus(token);
            setIsAdmin(response.isAdmin);
            localStorage.setItem("isAdmin", response.isAdmin.toString());
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

  const allNavItems = [
    { icon: "home", label: "Home", path: "/home" },
    { icon: "chat_bubble", label: "Chats", path: "/chat" },
    { icon: "lightbulb", label: "Hints", path: "/hints" },
    { icon: "add_box", label: "Create", path: "/create" },
    { icon: "settings", label: "Settings", path: "/settings" },
    { icon: "account_circle", label: "Profile", path: "/profile" },
    {
      icon: "admin_panel_settings",
      label: "Admin",
      path: "/admin",
      adminOnly: true,
    },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const notifications = [
    {
      id: 1,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      title: "Sarah",
      message: "sent you a message",
      time: "2m ago",
    },
    {
      id: 2,
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
      title: "New Match!",
      message: "You matched with someone",
      time: "1h ago",
    },
    {
      id: 3,
      icon: "favorite",
      title: "Someone liked your confession",
      time: "3h ago",
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 h-screen bg-white dark:bg-slate-950 flex-shrink-0 transition-all duration-300`}
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
                collapsed ? "justify-center px-3" : "gap-4 px-3"
              } py-3.5 text-base font-normal rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 text-slate-900 dark:text-slate-100 cursor-pointer group ${
                isActive ? "bg-slate-100 dark:bg-slate-900/50" : ""
              }`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined text-[28px] group-hover:scale-105 transition-transform">
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* University Logo Button */}
        <button
          className={`flex items-center ${
            collapsed ? "justify-center px-3" : "justify-center px-3"
          } py-3.5 text-base font-normal rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 cursor-pointer group`}
          title="University"
        >
          <div className="w-full h-50 flex-shrink-0  transition-transform">
            <img
              src={universityLogo}
              alt="University Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </button>
      </nav>

      {/* Notifications Pane */}
      {!collapsed && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
            Notifications
          </h3>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className="w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {notification.avatar ? (
                    <div
                      className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url("${notification.avatar}")`,
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">
                        {notification.icon}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">
                      {notification.message ? (
                        <>
                          <span className="font-semibold">
                            {notification.title}
                          </span>{" "}
                          {notification.message}
                        </>
                      ) : (
                        notification.title
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Profile (collapsed mode only) */}
      {collapsed && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex justify-center">
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
