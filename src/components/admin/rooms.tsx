import { useState, useEffect, useRef } from "react";
import { getAllChats, deleteChat } from "../../../api/admin/api";

interface ChatParticipant {
  _id: string;
  username: string;
  name: string;
}

interface Chat {
  _id: string;
  roomId: string;
  participants: ChatParticipant[];
  community: string;
  revealed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Rooms() {
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allRooms, setAllRooms] = useState<Chat[]>([]);
  const [communities, setCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const filteredRooms = allRooms.filter((room) => {
    const matchesCommunity =
      !selectedCommunity || room.community === selectedCommunity;
    const matchesSearch =
      !searchQuery ||
      room.participants.some((participant) =>
        participant.username.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      room.roomId.includes(searchQuery);

    return matchesCommunity && matchesSearch;
  });

  const isSearchFieldDisabled = !selectedCommunity;

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await getAllChats(token);
      const chats: Chat[] = (response?.data?.chats ?? []) as Chat[];
      setAllRooms(chats);

      // Extract unique communities
      const uniqueCommunities = Array.from(
        new Set(chats.map((chat: Chat) => chat.community))
      ).sort() as string[];
      setCommunities(uniqueCommunities);
    } catch (err: any) {
      setError(err.message || "Failed to fetch chat rooms");
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (chatId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat room?")) {
      return;
    }

    try {
      setDeleting(chatId);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      await deleteChat(chatId, token);
      setAllRooms(allRooms.filter((room) => room._id !== chatId));
    } catch (err: any) {
      setError(err.message || "Failed to delete chat room");
      console.error("Error deleting chat room:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <svg
            className="w-8 h-8 text-primary"
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
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

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
                    key={room._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs break-all">
                      {room.roomId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {room.participants.map((participant) => (
                          <span
                            key={participant._id}
                            className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full dark:bg-slate-700 dark:text-slate-300"
                          >
                            @{participant.username}
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
                        <button
                          disabled={deleting === room._id}
                          onClick={() => handleDeleteRoom(room._id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-xl">
                            {deleting === room._id ? "clock" : "delete"}
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
