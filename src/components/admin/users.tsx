import { useState, useEffect, useRef } from "react";
import { getAllUsers, deleteUser } from "../../../api/admin/api";
import { getAllCommunities } from "../../../api/admin/api";
import { getAuthToken } from "../../../api/user/auth";

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  birthday?: string;
  gender?: string;
  pronouns?: string;
  age: number;
  interests?: string[];
  musicPreferences?: string;
  favoriteShows?: string;
  memeVibe?: string;
  image?: string;
  community: string;
  favoriteSpot?: string;
  loveLanguage?: string;
  quirkyFact?: string;
  fantasies?: string;
  idealDate?: string;
  hint?: string;
  settings?: {
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  privacy?: {
    showActiveStatus: boolean;
    hideDisplayPicture: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Community {
  _id: string;
  institutionName: string;
  domain: string;
  isActive: boolean;
}

export default function Users() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchInitialData = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const communityResponse = await getAllCommunities(token);
        setCommunities(communityResponse.data.domains);

        setLoading(true);
        const usersResponse = await getAllUsers(token);
        setAllUsers(usersResponse.data.users);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Update domain when community selection changes
  useEffect(() => {
    if (!selectedCommunity) {
      setSelectedDomain("");
      return;
    }

    const selected = communities.find(
      (community) => community.institutionName === selectedCommunity
    );
    if (selected) {
      setSelectedDomain(selected.domain);
    }
  }, [selectedCommunity, communities]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      await deleteUser(userId, token);
      setAllUsers(allUsers.filter((user) => user._id !== userId));
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      console.error("Error deleting user:", err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const genders = ["male", "female", "non-binary", "other"];

  const ageRanges = ["18-21", "22-25", "26-30", "30+"];

  const getAgeRange = (age: number) => {
    if (age >= 18 && age <= 21) return "18-21";
    if (age >= 22 && age <= 25) return "22-25";
    if (age >= 26 && age <= 30) return "26-30";
    return "30+";
  };

  const filteredUsers = allUsers.filter((user) => {
    // Check if user's email domain matches the selected domain
    let matchesCommunity = true;
    if (selectedDomain) {
      const userEmailDomain = user.email?.split("@")[1] || "";
      matchesCommunity = userEmailDomain === selectedDomain;
    }

    // Normalize gender comparison (case-insensitive)
    const userGender = user.gender?.toLowerCase() || "";
    const selectedGenderLower = selectedGender?.toLowerCase() || "";
    const matchesGender = !selectedGender || userGender === selectedGenderLower;

    const matchesAge = !selectedAge || getAgeRange(user.age) === selectedAge;

    // Only apply search if community is selected
    const matchesSearch =
      !selectedDomain ||
      !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCommunity && matchesGender && matchesAge && matchesSearch;
  });

  const isSearchFieldDisabled = !selectedCommunity;

  return (
    <>
      <header className="mb-6">
        <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">
        User Management
      </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-normal leading-normal">
          View, search, and filter all registered users.
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
              <option key={community._id} value={community.institutionName}>
                {community.institutionName}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="flex-grow">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          >
            <option value="">Filter by gender...</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>

        {/* Age Filter */}
        <div className="flex-grow">
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-[15px] px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:ring-primary/30 dark:focus:border-primary/50 transition-all shadow-sm hover:shadow-md dark:shadow-none"
          >
            <option value="">Filter by age...</option>
            {ageRanges.map((range) => (
              <option key={range} value={range}>
                {range}
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
                ? "Select community to search"
                : "Search users..."
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft dark:shadow-none overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
            All Users
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Real Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Community
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
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {selectedCommunity
                      ? "No users found matching your filters."
                      : "Select a community to view users."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-sm">
                      {user._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {user.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {user.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {user.community}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={deletingUserId === user._id}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-xl">
                            {deletingUserId === user._id
                              ? "hourglass_empty"
                              : "delete"}
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/60"
            onClick={handleCloseModal}
          ></div>

          {/* Modal */}
          <div className="relative bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  User Details
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
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Full Name
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Username
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Email
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Age
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.age}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Birthday
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(selectedUser.birthday)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Gender
                    </label>
                    <p className="text-slate-900 dark:text-white capitalize">
                      {selectedUser.gender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Pronouns
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.pronouns || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Community
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.community}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interests & Preferences */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">interests</span>
                  Interests & Preferences
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Interests
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.interests &&
                      selectedUser.interests.length > 0
                        ? selectedUser.interests.join(", ")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Music Preferences
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.musicPreferences || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Favorite Shows
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.favoriteShows || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Meme Vibe
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.memeVibe || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campus Life */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">school</span>
                  Campus Life
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Favorite Spot
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.favoriteSpot || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Love Language
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.loveLanguage || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Quirky Fact
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.quirkyFact || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dreams & Desires */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">favorite</span>
                  Dreams & Desires
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Fantasies
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.fantasies || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Ideal Date
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.idealDate || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* The Mystery */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">help</span>
                  The Mystery
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Hint
                  </label>
                  <p className="text-slate-900 dark:text-white">
                    {selectedUser.hint || "N/A"}
                  </p>
                </div>
              </div>

              {/* Settings & Privacy */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">settings</span>
                  Settings & Privacy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Push Notifications
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.settings?.pushNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Email Notifications
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.settings?.emailNotifications
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Show Active Status
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.privacy?.showActiveStatus ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Hide Display Picture
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.privacy?.hideDisplayPicture ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span>
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      User ID
                    </label>
                    <p className="text-slate-900 dark:text-white font-mono text-sm">
                      {selectedUser._id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Profile Image
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {selectedUser.image || "default-avatar.png"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Created At
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Last Updated
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(selectedUser.updatedAt)}
      </p>
    </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-center bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-800 p-6">
              <button
                onClick={handleCloseModal}
                className=" px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
