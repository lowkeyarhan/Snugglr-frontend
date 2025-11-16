import { useState } from "react";

export default function Comments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");

  const allComments = [
    {
      comment: "Totally agree! I saw them too, that smile is unforgettable.",
      confession:
        "I can't stop thinking about the person I saw at the library today... their smile was just so captivating.",
      community: "Stanford University",
      username: "@bookworm23",
      date: "2023-10-26",
    },
    {
      comment: "That's so cute! I hope they see this.",
      confession: "I'm so glad you like them!",
      community: "Stanford University",
      username: "@bookworm23",
      date: "2023-10-26",
    },
    {
      comment: "Let's go to the library together!",
      confession: "I'm so glad you like them!",
      community: "Stanford University",
      username: "@lowkeyarhan",
      date: "2023-10-26",
    },
    {
      comment:
        "Have you tried noise-cancelling headphones? They saved my life last semester.",
      confession:
        "My roommate snores like a freight train and I'm slowly losing my mind. Send help (and earplugs).",
      community: "NYU",
      username: "@silentNight",
      date: "2023-10-25",
    },
    {
      comment:
        "OMG that is hilarious and something I would totally do. You'll laugh about it later!",
      confession:
        "I accidentally called my professor 'mom' today. I think I need to transfer to a new university now.",
      community: "UC Berkeley",
      username: "@awkwardTurtle",
      date: "2023-10-25",
    },
    {
      comment: "You are brave for saying this out loud. #TeamPineapple",
      confession:
        "Hot take: Pineapple on pizza is amazing and I'm tired of pretending it's not.",
      community: "UT Austin",
      username: "@pizzaLover99",
      date: "2023-10-24",
    },
  ];

  const communities = [
    "All Communities",
    "Stanford University",
    "University of California, Berkeley",
    "NYU",
    "UT Austin",
  ];

  const filteredComments = allComments.filter((comment) => {
    const matchesSearch = comment.comment
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCommunity =
      selectedCommunity === "all" || comment.community === selectedCommunity;
    const matchesDate = !selectedDate || comment.date === selectedDate;
    const matchesUsername =
      !usernameQuery ||
      comment.username.toLowerCase().includes(usernameQuery.toLowerCase());

    return matchesSearch && matchesCommunity && matchesDate && matchesUsername;
  });

  const isUsernameFieldDisabled = selectedCommunity === "all";

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Comments Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and moderate anonymous user comments.
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
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          />
        </div>

        {/* Community Filter */}
        <select
          value={selectedCommunity}
          onChange={(e) => {
            setSelectedCommunity(e.target.value);
            if (e.target.value === "all") {
              setUsernameQuery("");
            }
          }}
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

        {/* Username Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              person
            </span>
          </div>
          <input
            type="text"
            placeholder={
              isUsernameFieldDisabled
                ? "Select community first"
                : "Search username..."
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

      {/* Comments Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Comments
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredComments.length}{" "}
            {filteredComments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  On Confession
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredComments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No comments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {comment.comment}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate text-sm italic">
                      &quot;{comment.confession}&quot;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                      {comment.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {comment.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {comment.date}
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
