import React, { useMemo } from "react";
import type { Chat } from "../../../hooks/useChat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string;
  onChatSelect: (id: string) => void;
  currentUser: any;
  revealStatus: { revealed: boolean };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  currentUser,
  revealStatus,
  searchQuery,
  onSearchChange,
  loading,
}) => {
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter((chat) => {
      const otherUser = chat.users.find(
        (user) => user._id?.toString() !== currentUser?.id?.toString()
      );
      return (
        otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [chats, searchQuery, currentUser]);

  return (
    <aside className="w-80 bg-white dark:bg-slate-900/50 border-r border-slate-200 dark:border-primary/20 flex flex-col h-full">
      <header className="p-4 border-b border-slate-200 dark:border-primary/20 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h1>
          <button className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">edit_square</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-[20px]">
            search
          </span>
        </div>
      </header>

      <div className="overflow-y-auto flex-grow">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const otherUser = chat.users.find(
              (user) => user._id?.toString() !== currentUser?.id?.toString()
            );
            if (!otherUser) return null;

            const isRevealed = chat.revealed || revealStatus.revealed;

            return (
              <div
                key={chat._id}
                onClick={() => onChatSelect(chat._id)}
                className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors ${chat._id === activeChatId
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/20"
                  }`}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    {otherUser.image &&
                      otherUser.image.trim() !== "" &&
                      otherUser.image !== "default-avatar.png" ? (
                      <img
                        src={otherUser.image}
                        alt={otherUser.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const nextElement = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="material-symbols-outlined text-2xl text-gray-400 dark:text-gray-600"
                      style={{
                        display:
                          otherUser.image &&
                            otherUser.image.trim() !== "" &&
                            otherUser.image !== "default-avatar.png"
                            ? "none"
                            : "flex",
                      }}
                    >
                      person
                    </span>
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold truncate text-slate-900 dark:text-white">
                    {isRevealed ? otherUser.name : otherUser.username}
                  </p>
                  <p className="text-sm truncate text-slate-600 dark:text-slate-400">
                    {chat.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p>No chats found</p>
          </div>
        )}
      </div>
    </aside>
  );
};
