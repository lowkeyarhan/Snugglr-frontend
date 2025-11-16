import { useState } from "react";

export default function Confessions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const allConfessions = [
    {
      confession:
        "I can't stop thinking about the person I saw at the library today... their smile was just so captivating.",
      community: "Stanford University",
      date: "2023-10-26",
      status: "approved",
    },
    {
      confession:
        "My roommate snores like a freight train and I'm slowly losing my mind. Send help (and earplugs).",
      community: "NYU",
      date: "2023-10-25",
      status: "pending",
    },
    {
      confession:
        "I accidentally called my professor 'mom' today. I think I need to transfer to a new university now.",
      community: "UC Berkeley",
      date: "2023-10-25",
      status: "approved",
    },
    {
      confession:
        "Hot take: Pineapple on pizza is amazing and I'm tired of pretending it's not.",
      community: "UT Austin",
      date: "2023-10-24",
      status: "deleted",
    },
  ];

  const communities = [
    "All Communities",
    "Stanford University",
    "University of California, Berkeley",
    "NYU",
    "UT Austin",
  ];

  const statuses = ["All Statuses", "Approved", "Pending", "Deleted"];

  const filteredConfessions = allConfessions.filter((confession) => {
    const matchesSearch = confession.confession
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCommunity =
      selectedCommunity === "all" || confession.community === selectedCommunity;
    const matchesDate = !selectedDate || confession.date === selectedDate;
    const matchesStatus =
      selectedStatus === "all" ||
      confession.status === selectedStatus.toLowerCase();

    return matchesSearch && matchesCommunity && matchesDate && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: {
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-800 dark:text-green-300",
        label: "Approved",
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/40",
        text: "text-yellow-800 dark:text-yellow-300",
        label: "Pending",
      },
      deleted: {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-800 dark:text-red-300",
        label: "Deleted",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-slate-100 dark:bg-slate-900/40",
      text: "text-slate-800 dark:text-slate-300",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Confessions Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and moderate anonymous user confessions.
        </p>
      </header>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder="Search confessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          />
        </div>

        {/* Community Filter */}
        <select
          value={selectedCommunity}
          onChange={(e) => setSelectedCommunity(e.target.value)}
          className="h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
        >
          {communities.map((community) => (
            <option
              key={community}
              value={community === "All Communities" ? "all" : community}
            >
              {community}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
        />

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
        >
          {statuses.map((status) => (
            <option
              key={status}
              value={status === "All Statuses" ? "all" : status.toLowerCase()}
            >
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Confessions Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Confessions
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredConfessions.length}{" "}
            {filteredConfessions.length === 1 ? "confession" : "confessions"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Confession
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredConfessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No confessions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredConfessions.map((confession, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                      {confession.confession}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                      {confession.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {confession.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(confession.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                          <span className="material-symbols-outlined text-xl">
                            visibility
                          </span>
                        </button>
                        <button className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
