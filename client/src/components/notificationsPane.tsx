import type { ReactNode } from "react";

interface Notification {
  id: string;
  type: "match" | "profile_view" | "party" | "trending";
  user?: string;
  message: string;
  time: string;
  actionText?: string;
  icon?: ReactNode;
  iconBg?: string;
}

export default function NotificationsPane() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "match",
      user: "Sarah M.",
      message: "replied to your confession.",
      time: "2 min ago",
      iconBg: "bg-black",
      icon: (
        <span className="material-symbols-outlined text-[18px] text-white">
          favorite
        </span>
      ),
    },
    {
      id: "2",
      type: "profile_view",
      user: "GymCrush",
      message: "viewed your profile.",
      time: "5 min ago",
      iconBg: "bg-black",
      icon: (
        <span className="material-symbols-outlined text-[18px] text-white">
          notifications
        </span>
      ),
    },
    {
      id: "3",
      type: "party",
      message: "3 friends joined Beta House Party.",
      time: "1h ago",
      actionText: "Beta House Party",
      iconBg: "bg-black",
      icon: (
        <span className="material-symbols-outlined text-[18px] text-white">
          group
        </span>
      ),
    },
  ];

  const trending = [
    { id: "1", name: "Starbucks", count: "84 people here", icon: "☕" },
    { id: "2", name: "Main Library", count: "62 people here", icon: "📚" },
  ];

  const match = {
    user: "Alex",
    message: "Someone liked your profile.",
    timeLeft: "24h left",
  };

  return (
    <aside className="hidden xl:flex w-80 flex-col h-full bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md border-l border-gray-100 dark:border-gray-800 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-gray-900 dark:text-white text-2xl">
            Notifications
          </h2>
          <span className="material-symbols-outlined text-gray-400">
            notifications
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Match Card */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative rounded-3xl p-4 overflow-hidden bg-[#f4f5f7] dark:bg-[#14161a] border border-black/5 dark:border-white/5 shadow-[10px_10px_22px_rgba(0,0,0,0.10),_-10px_-10px_22px_rgba(255,255,255,0.95)] dark:shadow-[10px_10px_22px_rgba(0,0,0,0.65),_-10px_-10px_22px_rgba(255,255,255,0.04)]">
            {/* subtle top highlight for "3D" */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 to-transparent dark:from-white/5" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-full bg-black flex items-center justify-center shadow-[6px_6px_14px_rgba(0,0,0,0.25)]">
                    <span className="material-symbols-outlined text-white text-[22px] fill-current">
                      favorite
                    </span>
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[#f4f5f7] dark:ring-[#14161a]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                      MATCH
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      It’s a Match
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/5">
                  {match.timeLeft}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {match.user}
                </span>
                <span className="text-gray-600 dark:text-gray-300"> — </span>
                {match.message}
              </p>

              <button className="mt-4 w-full rounded-2xl bg-black text-white text-sm font-semibold py-2.5 shadow-[8px_8px_18px_rgba(0,0,0,0.18),_-8px_-8px_18px_rgba(255,255,255,0.35)] hover:opacity-95 active:scale-[0.99] transition">
                Reveal now
              </button>
            </div>
          </div>
        </div>

        {/* Trending Section */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Trending
            </span>
          </div>
          <div className="space-y-2">
            {trending.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-lg shadow-[6px_6px_12px_rgba(0,0,0,0.06),_-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.55),_-6px_-6px_12px_rgba(255,255,255,0.03)]">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 dark:text-white text-sm">
                    {item.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {item.count}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Recent
            </span>
          </div>
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full ${notification.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[6px_6px_14px_rgba(0,0,0,0.18)]`}
                >
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                    {notification.user && <span>{notification.user} </span>}
                    <span className="text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </span>
                    {notification.actionText && (
                      <span className="text-gray-900 dark:text-white">
                        {" "}
                        {notification.actionText}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
