import { useState } from "react";

export default function Rooms() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allRooms = [
    {
      id: "CR-7812",
      participants: ["@dreamyPoet", "@sunsetChaser"],
      community: "Stanford University",
      revealed: true,
    },
    {
      id: "CR-7813",
      participants: ["@midnightRider", "@coffeeLover"],
      community: "New York University",
      revealed: false,
    },
    {
      id: "CR-7814",
      participants: ["@techWhiz", "@caliDreamer"],
      community: "UC Berkeley",
      revealed: true,
    },
    {
      id: "CR-7815",
      participants: ["@loneStar", "@foodieExplorer"],
      community: "UT Austin",
      revealed: false,
    },
  ];

  const communities = [
    "Stanford University",
    "University of California, Berkeley",
    "New York University",
    "University of Texas at Austin",
  ];

  const filteredRooms = allRooms.filter((room) => {
    const matchesCommunity =
      !selectedCommunity || room.community === selectedCommunity;
    const matchesSearch =
      !searchQuery ||
      room.participants.some((participant) =>
        participant.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      room.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCommunity && matchesSearch;
  });

  const isSearchFieldDisabled = !selectedCommunity;

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Chat Rooms Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and filter all anonymous chat rooms.
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
              isSearchFieldDisabled
                ? "Select community to search by username"
                : "Search by username..."
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

      {/* Rooms Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Chat Rooms
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredRooms.length}{" "}
            {filteredRooms.length === 1 ? "room" : "rooms"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Room ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Revealed
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {selectedCommunity
                      ? "No rooms found matching your filters."
                      : "Select a community to view rooms."}
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-sm">
                      #{room.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {room.participants.map((participant, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full dark:bg-slate-700 dark:text-slate-300"
                          >
                            {participant}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {room.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.revealed
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}
                      >
                        {room.revealed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                          <span className="material-symbols-outlined text-xl">
                            history
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
