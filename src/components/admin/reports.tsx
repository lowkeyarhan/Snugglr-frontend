import { useState } from "react";

export default function Reports() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allReports = [
    {
      id: "REP-10234",
      reporter: "@dreamyPoet",
      reportedType: "User",
      reportedItem: "@sunsetChaser",
      community: "Stanford University",
      reason: "Harassment",
      date: "2023-10-26",
    },
    {
      id: "REP-10235",
      reporter: "@midnightRider",
      reportedType: "Confession",
      reportedItem: "#C-5582",
      community: "NYU",
      reason: "Spam",
      date: "2023-10-25",
    },
    {
      id: "REP-10238",
      reporter: "@techGuru",
      reportedType: "Bug",
      reportedItem: "Login Issue",
      community: "N/A",
      reason: "Technical Issue",
      date: "2023-10-25",
    },
    {
      id: "REP-10236",
      reporter: "@caliDreamer",
      reportedType: "Comment",
      reportedItem: "#CM-9102",
      community: "UC Berkeley",
      reason: "Hate Speech",
      date: "2023-10-25",
    },
    {
      id: "REP-10237",
      reporter: "@loneStar",
      reportedType: "Chat Room",
      reportedItem: "#CR-7815",
      community: "UT Austin",
      reason: "Inappropriate Content",
      date: "2023-10-24",
    },
  ];

  const communities = [
    "Stanford University",
    "University of California, Berkeley",
    "New York University",
    "University of Texas at Austin",
    "Community Independent",
  ];

  const filteredReports = allReports.filter((report) => {
    const matchesCommunity =
      !selectedCommunity ||
      report.community === selectedCommunity ||
      (selectedCommunity === "Community Independent" &&
        report.community === "N/A");
    const matchesSearch =
      !searchQuery ||
      report.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCommunity && matchesSearch;
  });

  const isSearchFieldDisabled = !selectedCommunity;

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Reports Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and filter all types of reports including misconduct,
          bugs, and content violations.
        </p>
      </header>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        {/* Community Filter */}
        <div className="flex-grow">
          <select
            value={selectedCommunity}
            onChange={(e) => {
              setSelectedCommunity(e.target.value);
              if (!e.target.value) {
                setSearchQuery("");
              }
            }}
            className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          >
            <option value="">Filter by community...</option>
            {communities.map((community) => (
              <option key={community} value={community}>
                {community}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder={
              isSearchFieldDisabled
                ? "Select a community to search"
                : "Search reports..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearchFieldDisabled}
            className={`w-full h-12 pl-12 pr-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none ${
              isSearchFieldDisabled
                ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                : "bg-white dark:bg-card-dark"
            }`}
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Reports
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredReports.length}{" "}
            {filteredReports.length === 1 ? "report" : "reports"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Reported Item/Issue
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Date Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {selectedCommunity
                      ? "No reports found matching your filters."
                      : "Select a community to view reports."}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-sm">
                      #{report.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      {report.reporter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      <span className="font-mono text-sm">
                        {report.reportedType}:
                      </span>{" "}
                      {report.reportedItem}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {report.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {report.date}
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
