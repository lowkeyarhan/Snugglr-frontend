import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/user/auth";
import Dashboard from "../adminComp/dashboard";
import Community from "../adminComp/community";
import Confessions from "../adminComp/confessions";
import Comments from "../adminComp/comments";
import Matches from "../adminComp/matches";
import Users from "../adminComp/users";
import Rooms from "../adminComp/rooms";
import Reports from "../adminComp/reports";

type ViewType =
  | "dashboard"
  | "community"
  | "confessions"
  | "comments"
  | "matches"
  | "users"
  | "rooms"
  | "reports";

export default function Admin() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { icon: "home", label: "Home", view: null, isHome: true },
    { icon: "dashboard", label: "Dashboard", view: "dashboard" as ViewType },
    { icon: "hub", label: "Community", view: "community" as ViewType },
    {
      icon: "record_voice_over",
      label: "Confessions",
      view: "confessions" as ViewType,
    },
    { icon: "comment", label: "Comments", view: "comments" as ViewType },
    { icon: "favorite", label: "Matches", view: "matches" as ViewType },
    { icon: "group", label: "Users", view: "users" as ViewType },
    { icon: "room", label: "Rooms", view: "rooms" as ViewType },
    { icon: "flag", label: "Reports", view: "reports" as ViewType },
  ];

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-screen flex-shrink-0 overflow-hidden">
        <div className="flex flex-col flex-1">
          <div className="px-6 py-8 flex items-center gap-3">
            <div className="flex flex-col">
              <h1
                className="text-3xl font-light tracking-tight"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                Snugglr
              </h1>
            </div>
          </div>
          <nav className="flex flex-col gap-2 px-2 pb-4 pt-2">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view || item.label}
                  onClick={() => {
                    if (item.isHome) {
                      navigate("/home");
                    } else {
                      setActiveView(item.view!);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-normal transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </span>
                  <p className="text-sm font-medium leading-normal">
                    {item.label}
                  </p>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 text-left w-full"
          >
            <span className="material-symbols-outlined text-[28px]">
              settings
            </span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-200 text-left w-full"
          >
            <span className="material-symbols-outlined text-[28px]">
              logout
            </span>
            <p className="text-sm font-medium leading-normal">Log Out</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Page Content */}
        <div className="p-8 bg-background-light dark:bg-background-dark min-h-full">
          {activeView === "dashboard" && <Dashboard />}
          {activeView === "community" && <Community />}
          {activeView === "confessions" && <Confessions />}
          {activeView === "comments" && <Comments />}
          {activeView === "matches" && <Matches />}
          {activeView === "users" && <Users />}
          {activeView === "rooms" && <Rooms />}
          {activeView === "reports" && <Reports />}
        </div>
      </main>
    </div>
  );
}
