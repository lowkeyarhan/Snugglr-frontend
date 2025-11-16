import { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  getChatRooms,
  getMessages,
  sendMessage,
  submitGuess,
  getRevealStatus,
  getCurrentUser,
} from "../API/api";
import { getAuthToken } from "../API/auth";

// Types
interface Chat {
  _id: string;
  users: Array<{
    _id: string;
    name: string;
    username: string;
    image?: string;
    interests?: string[];
    guesses?: Array<{
      chatId: string;
      guess: string;
    }>;
  }>;
  revealed: boolean;
  updatedAt: string;
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
}

interface Message {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    image?: string;
  };
  text: string;
  createdAt: string;
}

export default function Chat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [submittingGuess, setSubmittingGuess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [revealStatus, setRevealStatus] = useState<{
    revealed: boolean;
    users: any[] | null;
  }>({ revealed: false, users: null });
  const [currentUserGuess, setCurrentUserGuess] = useState<string>("");
  const [otherUserGuess, setOtherUserGuess] = useState<string>("");
  const [showRevealSuccess, setShowRevealSuccess] = useState<boolean>(false);

  const userProfileImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_iPJIQrt9-mW5A2ydCh3Yxc4LvljOrKyoltkptN-cVP6DbgD5zAnr4dEs77kaw5Z8IqCaskYDyn_nJ-7e1EQD6Mb6OXgIyrvFZGK4vcEV_4flgPXBJhCJYP4RWJgmdloYhBZdEczYdkPD91Lbxip2szT9kOihSNg5cv4LAw4gFIEslHasQHpUQwZvWBs8cSEUqlKhDBI0KtNhHEcGz1lzukeOzUbX5Zg0W62uoUsmn7g8g5pIk7t8OIfrlI8EmzJYYxJH5A9BR92";

  // Load current user and chats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        // Load current user
        const userResponse = await getCurrentUser(token);
        setCurrentUser(userResponse.data?.user);

        // Load chats
        const chatsResponse = await getChatRooms(token);
        setChats(chatsResponse.data.chats);

        // Set first chat as active if available
        if (chatsResponse.data.chats.length > 0) {
          setActiveChatId(chatsResponse.data.chats[0]._id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await getMessages(activeChatId, token);
        setMessages(response.data.messages);
        setRevealStatus({ revealed: response.data.revealed, users: null });
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [activeChatId]);

  // Load reveal status when active chat changes
  useEffect(() => {
    const loadRevealStatus = async () => {
      if (!activeChatId) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await getRevealStatus(activeChatId, token);
        setRevealStatus(response.data);
      } catch (error) {
        console.error("Error loading reveal status:", error);
      }
    };

    loadRevealStatus();
  }, [activeChatId]);

  // Get active chat object
  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId),
    [chats, activeChatId]
  );

  // Load guess status when active chat changes
  useEffect(() => {
    const loadGuessStatus = async () => {
      if (!activeChatId || !currentUser || !activeChat) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        // Get current user's guess for this chat - check localStorage first for persistence
        const guessKey = `guess_${activeChatId}`;
        const localGuessData = localStorage.getItem(guessKey);

        if (localGuessData) {
          try {
            const parsedData = JSON.parse(localGuessData);
            // Use localStorage guess if available
            setCurrentUserGuess(parsedData.guess || "");
          } catch (error) {
            // Fallback for old format (just string)
            setCurrentUserGuess(localGuessData);
          }
        } else {
          // Fall back to backend data
          const currentUserGuessForChat = currentUser.guesses?.find(
            (guess: any) => guess.chatId?.toString() === activeChatId
          );
          setCurrentUserGuess(currentUserGuessForChat?.guess || "");
        }

        // Get other user's guess for this chat
        const otherUserInChat = activeChat.users.find(
          (user) => user._id?.toString() !== currentUser.id?.toString()
        );
        if (otherUserInChat) {
          const otherUserGuessForChat = otherUserInChat.guesses?.find(
            (guess: any) => guess.chatId?.toString() === activeChatId
          );
          setOtherUserGuess(otherUserGuessForChat?.guess || "");
        }
      } catch (error) {
        console.error("Error loading guess status:", error);
      }
    };

    loadGuessStatus();
  }, [activeChatId, currentUser, activeChat]);

  // Sync reveal status with active chat's revealed field
  useEffect(() => {
    if (activeChat) {
      setRevealStatus({
        revealed: activeChat.revealed || false,
        users: activeChat.revealed ? activeChat.users : null,
      });
    }
  }, [activeChat]);

  // Get the other user in the chat
  const otherUser = useMemo(() => {
    if (!activeChat || !currentUser) return null;
    return activeChat.users.find(
      (user) => user._id?.toString() !== currentUser.id?.toString()
    );
  }, [activeChat, currentUser]);

  // Filter chats based on search query
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

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await sendMessage(
        activeChatId,
        messageInput.trim(),
        token
      );

      // Add the new message to the messages list
      setMessages((prev) => [...prev, response.data.message]);
      setMessageInput("");

      // Update the chat list to show the new last message
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === activeChatId
            ? { ...chat, updatedAt: new Date().toISOString() }
            : chat
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle making a guess
  const handleGuess = async () => {
    if (!guessInput.trim() || !activeChatId || submittingGuess) return;

    const guessText = guessInput.trim();
    setSubmittingGuess(true);

    // Immediately update UI
    setCurrentUserGuess(guessText);

    // Store guess in localStorage for persistence with timestamp
    const guessKey = `guess_${activeChatId}`;
    const guessData = {
      guess: guessText,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(guessKey, JSON.stringify(guessData));

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await submitGuess(activeChatId, guessText, token);

      if (response.data.revealed) {
        // Identities revealed! Update reveal status from response
        setRevealStatus({
          revealed: true,
          users: response.data.chat?.users || null,
        });
        setShowRevealSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowRevealSuccess(false);
        }, 3000);
      }

      // Refresh current user data to get updated guesses
      const userResponse = await getCurrentUser(token);
      setCurrentUser(userResponse.data?.user);

      // Refresh chats to get updated revealed status
      const chatsResponse = await getChatRooms(token);
      setChats(chatsResponse.data.chats);

      setGuessInput("");
    } catch (error) {
      console.error("Error submitting guess:", error);
      // Revert UI changes on error
      setCurrentUserGuess("");
      localStorage.removeItem(guessKey);
    } finally {
      setSubmittingGuess(false);
    }
  };

  // Handle reveal button click
  const handleReveal = async () => {
    if (!currentUserGuess || !otherUserGuess || !activeChatId) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      // The backend will automatically check if both guesses are correct
      // and reveal identities if they match
      const response = await submitGuess(activeChatId, currentUserGuess, token);

      if (response.data.revealed) {
        // Identities revealed! Update reveal status from response
        setRevealStatus({
          revealed: true,
          users: response.data.chat?.users || null,
        });
        setShowRevealSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowRevealSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error revealing identities:", error);
    }
  };

  // Bubble radius utility to mimic Instagram/iMessage grouping
  const getBubbleRadius = (
    type: "sent" | "received",
    isFirstInGroup: boolean,
    isLastInGroup: boolean
  ) => {
    let classes = "rounded-3xl";
    if (type === "sent") {
      if (!isFirstInGroup) classes += " rounded-tr-md"; // connect top-right
      if (!isLastInGroup) classes += " rounded-br-md"; // connect bottom-right
    } else {
      if (!isFirstInGroup) classes += " rounded-tl-md"; // connect top-left
      if (!isLastInGroup) classes += " rounded-bl-md"; // connect bottom-left
    }
    return classes;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Navigation Sidebar (Icon Only) */}
      <Sidebar collapsed />

      {/* Left Sidebar - Chat List */}
      <aside className="w-80 bg-white dark:bg-slate-900/50 border-r border-slate-200 dark:border-primary/20 flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-primary/20 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <button className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat._id)}
                  className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors ${
                    chat._id === activeChatId
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
                            if (nextElement) {
                              nextElement.style.display = "flex";
                            }
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
                    <p className="font-bold truncate">
                      {revealStatus.revealed
                        ? otherUser.name
                        : otherUser.username}
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

      {/* Main Chat Area */}
      <main className="flex-1 grid grid-cols-[1fr,400px]">
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          {activeChat && otherUser && (
            <header className="flex items-center justify-between p-4 border-b border-primary/10 dark:border-primary/20 bg-white dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
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
                        if (nextElement) {
                          nextElement.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <span
                    className="material-symbols-outlined text-xl text-gray-400 dark:text-gray-600"
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
                <div>
                  <h2 className="text-lg font-bold">
                    {revealStatus.revealed
                      ? otherUser.name
                      : otherUser.username}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {revealStatus.revealed ? "Identity revealed" : "Anonymous"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">call</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
            </header>
          )}

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-2 bg-slate-50 dark:bg-slate-950">
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const prev = messages[index - 1];
                const next = messages[index + 1];
                const isFromCurrentUser =
                  message.sender._id?.toString() ===
                  currentUser?.id?.toString();

                const isPrevSame =
                  prev &&
                  prev.sender._id?.toString() ===
                    message.sender._id?.toString();
                const isNextSame =
                  next &&
                  next.sender._id?.toString() ===
                    message.sender._id?.toString();
                const isFirstInGroup = !isPrevSame;
                const isLastInGroup = !isNextSame;

                const bubbleRadius = getBubbleRadius(
                  isFromCurrentUser ? "sent" : "received",
                  isFirstInGroup,
                  isLastInGroup
                );

                if (isFromCurrentUser) {
                  return (
                    <div key={message._id} className="flex justify-end">
                      <div
                        className={`max-w-[70%] px-4 py-2.5 ${bubbleRadius} bg-primary text-white text-[15px] leading-relaxed`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={message._id} className="flex justify-start">
                      <div
                        className={`max-w-[70%] px-4 py-2.5 ${bubbleRadius} bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 text-[15px] leading-relaxed`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <div className="flex flex-col w-full text-center items-center justify-center h-full py-20">
                <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500 mb-4">
                  chat_bubble_outline
                </span>
                <h3 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">
                  No messages yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                  Start the conversation! Send your first message to begin
                  chatting with {otherUser?.username}.
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          {activeChat && (
            <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-primary/10 dark:border-primary/20 shrink-0">
              <div className="relative">
                <input
                  className="w-full h-12 pr-28 pl-12 rounded-full bg-slate-50 border-primary/10 dark:bg-slate-950 border focus:outline-none focus:border-primary/10 focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Type a message..."
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !sendingMessage) {
                      handleSendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />
                <button className="absolute left-3 top-1/2 -translate-y-1/2 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">
                    add_circle
                  </span>
                </button>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">
                      mood
                    </span>
                  </button>
                  <button className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">
                      mic
                    </span>
                  </button>
                  <button className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">
                      image
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Profile & Guessing Game */}
        {activeChat && otherUser && (
          <aside className="bg-white dark:bg-slate-900/50 border-l border-slate-200 dark:border-primary/20 flex flex-col overflow-y-auto">
            {/* Profile Section */}
            <div className="p-6 border-b border-slate-200 dark:border-primary/20">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-3">
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
                        if (nextElement) {
                          nextElement.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <span
                    className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-600"
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
                <h2 className="text-xl font-bold text-center">
                  {revealStatus.revealed ? otherUser.name : otherUser.username}
                </h2>
                <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                  {revealStatus.revealed ? "Identity revealed" : "Anonymous"}
                </p>
              </div>
            </div>

            {/* Shared Interests */}
            {otherUser.interests && otherUser.interests.length > 0 && (
              <div className="p-6 border-b border-slate-200 dark:border-primary/20">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {otherUser.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Guessing Game */}
            {!revealStatus.revealed && (
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  The Guessing Game
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Think you know who's behind the mask? Make a guess! If you're
                  both right, you can unmask.
                </p>

                {/* Guess Input */}
                <div className="relative mb-4">
                  <input
                    className="w-full h-11 pl-11 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm"
                    placeholder="Enter your guess..."
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !submittingGuess) {
                        handleGuess();
                      }
                    }}
                    disabled={submittingGuess}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-[20px]">
                    person_search
                  </span>
                </div>

                {/* Guess Status */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div
                      className="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage: `url('${userProfileImage}')`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Your Guess
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {submittingGuess
                          ? "Submitting..."
                          : currentUserGuess
                          ? `"${currentUserGuess}"`
                          : "Make your guess above"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                            if (nextElement) {
                              nextElement.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <span
                        className="material-symbols-outlined text-lg text-gray-400 dark:text-gray-600"
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {otherUser.username}'s Guess
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {otherUserGuess
                          ? `"${otherUserGuess}"`
                          : "Hasn't guessed yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reveal Button */}
                <div className="mt-auto">
                  <button
                    disabled={!currentUserGuess || !otherUserGuess}
                    onClick={handleReveal}
                    className={`w-full h-12 flex items-center justify-center rounded-lg font-semibold text-sm ${
                      currentUserGuess && otherUserGuess
                        ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                        : "bg-primary/50 text-white cursor-not-allowed"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mr-2">
                      {currentUserGuess && otherUserGuess
                        ? "visibility"
                        : "lock"}
                    </span>
                    Reveal Identity
                  </button>
                  <p className="text-center text-xs mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
                    {currentUserGuess && otherUserGuess
                      ? "Both have guessed! Click to reveal if correct"
                      : "Enabled when both make guesses"}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showRevealSuccess && (
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="material-symbols-outlined text-green-500 text-4xl mr-3">
                    check_circle
                  </span>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      Identities Revealed! 🎉
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Both guesses were correct!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Revealed Identity */}
            {revealStatus.revealed && (
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Identity Revealed! 🎉
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Congratulations! You both guessed correctly and your
                  identities have been revealed.
                </p>

                <div className="flex items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="material-symbols-outlined text-green-500 text-4xl mr-3">
                    check_circle
                  </span>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      Identities Revealed!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You can now see each other's real names
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
}
