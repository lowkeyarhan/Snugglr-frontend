export default function NotificationsPane() {
  const notifications = [
    {
      id: 1,
      type: "match",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      title: "New Match!",
      message: "You have a new match",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      type: "message",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
      title: "Mystery Girl",
      message: "sent you a message",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      type: "like",
      icon: "favorite",
      title: "Someone liked your confession",
      time: "3h ago",
      unread: false,
    },
    {
      id: 4,
      type: "hint",
      icon: "lightbulb",
      title: "New hint unlocked",
      message: "Check out your latest hint",
      time: "5h ago",
      unread: false,
    },
    {
      id: 5,
      type: "pool",
      icon: "groups",
      title: "Match Pool Update",
      message: "3 new people joined your pool",
      time: "1d ago",
      unread: false,
    },
  ];

  return (
    <aside className="hidden xl:flex w-80 flex-col border-l border-slate-200 dark:border-slate-800 h-screen bg-white dark:bg-slate-950 flex-shrink-0">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>
          <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {notifications.filter((n) => n.unread).length}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stay updated with your connections
        </p>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              className={`w-full p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all text-left group ${
                notification.unread
                  ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar or Icon */}
                {notification.avatar ? (
                  <div
                    className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0 ring-2 ring-white dark:ring-slate-950"
                    style={{
                      backgroundImage: `url("${notification.avatar}")`,
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {notification.icon}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {notification.time}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <button className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white transition-colors">
          View All Notifications
        </button>
      </div>
    </aside>
  );
}
