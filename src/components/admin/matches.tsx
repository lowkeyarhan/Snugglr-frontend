import { useState } from "react";

export default function Matches() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");

  const allMatches = [
    {
      user1: "@bookworm23",
      user2: "@libraryLove",
      community: "Stanford University",
      date: "2023-10-26",
    },
    {
      user1: "@silentNight",
      user2: "@dreamWeaver",
      community: "NYU",
      date: "2023-10-25",
    },
    {
      user1: "@awkwardTurtle",
      user2: "@classClown",
      community: "UC Berkeley",
      date: "2023-10-25",
    },
    {
      user1: "@pizzaLover99",
      user2: "@pineappleFan",
      community: "UT Austin",
      date: "2023-10-24",
    },
  ];

  const communities = [
    "Stanford University",
    "University of California, Berkeley",
    "New York University",
    "University of Texas at Austin",
  ];

  const filteredMatches = allMatches.filter((match) => {
    const matchesCommunity =
      !selectedCommunity || match.community === selectedCommunity;
    const matchesUsername =
      !usernameQuery ||
      match.user1.toLowerCase().includes(usernameQuery.toLowerCase()) ||
      match.user2.toLowerCase().includes(usernameQuery.toLowerCase());

    return matchesCommunity && matchesUsername;
  });

  const isUsernameFieldDisabled = !selectedCommunity;

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
        Matches Management
      </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and filter all matches between anonymous users.
        </p>
      </header>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Community Filter */}
        <div className="flex-grow md:flex-grow-0">
          <select
            value={selectedCommunity}
            onChange={(e) => {
              setSelectedCommunity(e.target.value);
              if (!e.target.value) {
                setUsernameQuery("");
              }
            }}
            className="w-full md:w-64 h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          >
            <option value="">Select a community...</option>
            {communities.map((community) => (
              <option key={community} value={community}>
                {community}
              </option>
            ))}
          </select>
        </div>

        {/* Username Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder={
              isUsernameFieldDisabled
                ? "Select a community to search usernames"
                : "Search usernames..."
            }
            value={usernameQuery}
            onChange={(e) => setUsernameQuery(e.target.value)}
            disabled={isUsernameFieldDisabled}
            className={`w-full h-12 pl-12 pr-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none ${
              isUsernameFieldDisabled
                ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                : "bg-white dark:bg-card-dark"
            }`}
          />
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Matches
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredMatches.length}{" "}
            {filteredMatches.length === 1 ? "match" : "matches"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Matched Users
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Match Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {selectedCommunity
                      ? "No matches found matching your filters."
                      : "Select a community to view matches."}
                  </td>
                </tr>
              ) : (
                filteredMatches.map((match, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {match.user1}
                        </span>
                        <span className="material-symbols-outlined text-primary text-base">
                          favorite
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {match.user2}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                      {match.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {match.date}
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
