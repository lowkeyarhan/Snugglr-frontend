import { useState, useEffect } from "react";
import { getAllConfessions, deleteConfession } from "../adminAPI/api";

interface Confession {
  _id: string;
  confession: string;
  username: string;
  community: string;
  domain: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export default function Confessions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfessionModal, setShowConfessionModal] = useState(false);
  const [selectedConfession, setSelectedConfession] =
    useState<Confession | null>(null);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }
      const response = await getAllConfessions(token);
      setConfessions(response.data.confessions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch confessions");
      console.error("Error fetching confessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfession = async (confessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this confession?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }
      await deleteConfession(confessionId, token);
      setConfessions(confessions.filter((c) => c._id !== confessionId));
    } catch (err: any) {
      setError(err.message || "Failed to delete confession");
      console.error("Error deleting confession:", err);
    }
  };

  const communities = [
    "All Communities",
    ...Array.from(new Set(confessions.map((c) => c.community))).sort(),
  ];

  const filteredConfessions = confessions.filter((confession) => {
    const matchesSearch = confession.confession
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCommunity =
      selectedCommunity === "all" || confession.community === selectedCommunity;
    const confessionDate = new Date(confession.createdAt)
      .toISOString()
      .split("T")[0];
    const matchesDate = !selectedDate || confessionDate === selectedDate;

    return matchesSearch && matchesCommunity && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewConfession = (confession: Confession) => {
    setSelectedConfession(confession);
    setShowConfessionModal(true);
  };

  const handleCloseModal = () => {
    setShowConfessionModal(false);
    setSelectedConfession(null);
  };

  const getConfessionDetails = (confession: Confession) => {
    return [
      {
        label: "Username",
        value: confession.username,
        specialClass: "",
      },
      {
        label: "Community",
        value: confession.community,
        specialClass: "",
      },
      {
        label: "Posted Date",
        value: formatDateTime(confession.createdAt),
        specialClass: "",
      },
      {
        label: "MongoDB ID",
        value: confession._id,
        specialClass: "font-mono text-sm break-all",
      },
    ];
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

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
      </div>

      {/* Confessions Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Confessions
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {loading
              ? "Loading..."
              : `${filteredConfessions.length} ${
                  filteredConfessions.length === 1
                    ? "confession"
                    : "confessions"
                }`}
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
                  Engagement
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    Loading confessions...
                  </td>
                </tr>
              ) : filteredConfessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No confessions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredConfessions.map((confession) => (
                  <tr
                    key={confession._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                      {confession.confession}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                      {confession.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatDate(confession.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-block mr-3">
                        {confession.likesCount} likes
                      </span>
                      <span className="inline-block">
                        {confession.commentsCount} comments
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleViewConfession(confession)}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfession(confession._id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
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

      {/* Confession Details Modal */}
      {showConfessionModal && selectedConfession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/60"
            onClick={handleCloseModal}
          ></div>

          {/* Modal */}
          <div className="relative bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Confession Details
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-900/50 rounded-lg"
              >
                <span className="material-symbols-outlined text-2xl">
                  close
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Confession Text */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">description</span>
                  Confession
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap break-words">
                    {selectedConfession.confession}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              {selectedConfession &&
                (() => {
                  const details = getConfessionDetails(selectedConfession);

                  return (
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">info</span>
                        Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {details.map((detail, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                              {detail.label}
                            </label>
                            <p
                              className={`text-slate-900 dark:text-white ${
                                detail.specialClass || ""
                              }`}
                            >
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {/* Engagement Metrics */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_up</span>
                  Engagement
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedConfession.likesCount}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Likes
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedConfession.commentsCount}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Comments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleDeleteConfession(selectedConfession._id);
                  }}
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                  Delete Confession
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
