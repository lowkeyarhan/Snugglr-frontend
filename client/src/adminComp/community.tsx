import { useState, useEffect, useRef } from "react";
import {
  getAllCommunities,
  deleteCommunity,
  updateCommunity,
  addCommunity,
} from "../adminAPI/api";
import { getAuthToken } from "../API/auth";

interface Community {
  _id: string;
  institutionName: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
}

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    institutionName: string;
    domain: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    institutionName: "",
    domain: "",
    isActive: true,
  });
  const [addingCommunity, setAddingCommunity] = useState(false);
  const hasFetched = useRef(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await getAllCommunities(token);
      setCommunities(response.data.domains);
    } catch (err: any) {
      setError(err.message || "Failed to fetch communities");
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCommunities();
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this community?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      await deleteCommunity(id, token);
      setCommunities(communities.filter((c) => c._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete community");
      console.error("Error deleting community:", err);
    }
  };

  const handleEditClick = (community: Community) => {
    setEditingId(community._id);
    setEditingData({
      institutionName: community.institutionName,
      domain: community.domain,
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingData) return;

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      await updateCommunity(id, editingData, token);

      // Update local state
      setCommunities(
        communities.map((c) =>
          c._id === id
            ? {
                ...c,
                institutionName: editingData.institutionName,
                domain: editingData.domain,
              }
            : c
        )
      );
      setEditingId(null);
      setEditingData(null);
    } catch (err: any) {
      setError(err.message || "Failed to update community");
      console.error("Error updating community:", err);
    }
  };

  const filteredCommunities = communities.filter((community) =>
    community.institutionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCommunity.institutionName.trim() || !newCommunity.domain.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setAddingCommunity(true);
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await addCommunity(newCommunity, token);

      // Add new community to list
      setCommunities([...communities, response.data.domain]);

      // Reset form and close modal
      setNewCommunity({ institutionName: "", domain: "", isActive: true });
      setShowAddModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to add community");
      console.error("Error adding community:", err);
    } finally {
      setAddingCommunity(false);
    }
  };

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
          Community Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          Manage communities and university groups.
        </p>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Search and Add Section */}
      <div className="flex gap-3 mb-6 items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="h-12 bg-primary text-white font-semibold px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all text-[15px] whitespace-nowrap shadow-sm hover:shadow-md active:shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span>Add New Community</span>
        </button>
      </div>

      {/* Add Community Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/60"
            onClick={() => setShowAddModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Add New Community
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCommunity} className="space-y-4">
              {/* Institution Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Stanford University"
                  value={newCommunity.institutionName}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      institutionName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Domain Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g., stanford.edu"
                  value={newCommunity.domain}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      domain: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newCommunity.isActive}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Active Community
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCommunity}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                >
                  {addingCommunity ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        check
                      </span>
                      Add Community
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communities Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Communities
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredCommunities.length}{" "}
            {filteredCommunities.length === 1 ? "community" : "communities"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Date Created
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-slate-600 dark:text-slate-400">
                        Loading communities...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCommunities.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No communities found
                  </td>
                </tr>
              ) : (
                filteredCommunities.map((community) => (
                  <tr
                    key={community._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-white font-medium">
                      {editingId === community._id ? (
                        <input
                          type="text"
                          value={editingData?.institutionName || ""}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              institutionName: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      ) : (
                        community.institutionName
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-sm">
                      {editingId === community._id ? (
                        <input
                          type="text"
                          value={editingData?.domain || ""}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData!,
                              domain: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      ) : (
                        community.domain
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {formatDate(community.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          community.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {community.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        {editingId === community._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(community._id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Save"
                            >
                              <span className="material-symbols-outlined text-xl">
                                check
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingData(null);
                              }}
                              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-xl">
                                close
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(community)}
                              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-xl">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(community._id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-xl">
                                delete
                              </span>
                            </button>
                          </>
                        )}
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
