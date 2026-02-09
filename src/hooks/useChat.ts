import { useState, useEffect, useRef, useMemo } from "react";
import { getAuthToken } from "../../api/user/auth";
import {
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
} from "../../api/user/messages";
import { getMyChats as getMyChatsApi } from "../../api/user/rooms";
import { getMyProfile as getMyProfileApi } from "../../api/user/user";

// Types
export interface Chat {
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
    text: string | null;
    sender: string;
    createdAt: string;
  };
}

export interface Message {
  _id: string;
  chatId?: string;
  sender:
    | null
    | string
    | {
        _id: string;
        name?: string;
        username?: string;
        image?: string;
      };
  text: string | null;
  createdAt: string;
}

const resolveWsEndpoint = () => {
  const base =
    import.meta.env.VITE_WS_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080";
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;

  if (trimmed.startsWith("ws://") || trimmed.startsWith("wss://")) {
    return trimmed.endsWith("/ws") ? trimmed : `${trimmed}/ws`;
  }

  if (trimmed.startsWith("https://")) {
    const host = trimmed.slice("https://".length);
    const url = `wss://${host}`;
    return url.endsWith("/ws") ? url : `${url}/ws`;
  }

  if (trimmed.startsWith("http://")) {
    const host = trimmed.slice("http://".length);
    const url = `ws://${host}`;
    return url.endsWith("/ws") ? url : `${url}/ws`;
  }

  return trimmed.endsWith("/ws") ? trimmed : `ws://${trimmed}/ws`;
};

const WS_ENDPOINT = resolveWsEndpoint();

// Mock API calls for guess/reveal since backend endpoints might not be exposed as standard exports yet
// In a real refactor, these should be in the API layer
const submitGuessApi = async (
  _chatId: string,
  _guess: string,
  _token: string,
) => {
  // This is a placeholder for the actual API call logic
  // You would replace this with actual axios call if available
  // For now, mirroring the logic from the original Chat.tsx which seemed to mock or use local logic
  return { data: { revealed: false, chat: null } as any };
};

const getRevealStatusApi = async (_chatId: string, _token: string) => {
  return { data: { revealed: false, users: null } as any };
};

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [revealStatus, setRevealStatus] = useState<{
    revealed: boolean;
    users: any[] | null;
  }>({ revealed: false, users: null });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeChatRef = useRef<string>("");

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const userResponse = await getMyProfileApi(token);
        const user: any = userResponse.data;
        setCurrentUser({
          ...user,
          id: user?._id ?? user?.id,
          guesses: user?.guesses ?? [],
        });

        const chatsData = await getMyChatsApi(token);
        const normalizedChats: any = (chatsData || []).map((c: any) => ({
          ...c,
          revealed: c?.revealed ?? false,
        }));
        setChats(normalizedChats);

        if (normalizedChats.length > 0) {
          setActiveChatId(normalizedChats[0]._id);
        }
      } catch (error) {
        console.error("Error loading chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    let shouldReconnect = true;

    const connect = () => {
      const socket = new WebSocket(
        `${WS_ENDPOINT}?token=${encodeURIComponent(token)}`,
      );
      wsRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: "joinNotifications" }));
        if (activeChatRef.current) {
          socket.send(
            JSON.stringify({
              type: "joinChat",
              chatId: activeChatRef.current,
            }),
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type: string;
            data?: { message: Message; chatId: string };
          };
          if (payload.type === "chat:message") {
            const { message, chatId } = payload.data || {};
            if (!message || !chatId) return;

            setChats((prevChats) => {
              let found = false;
              const updated = prevChats.map((chat) => {
                if (chat._id !== chatId) return chat;
                found = true;
                return {
                  ...chat,
                  updatedAt: message.createdAt,
                  lastMessage: {
                    text: message.text,
                    sender:
                      typeof message.sender === "string"
                        ? message.sender
                        : message.sender?._id || "",
                    createdAt: message.createdAt,
                  },
                };
              });
              return found ? updated : prevChats;
            });

            if (activeChatRef.current === chatId) {
              setMessages((prevMessages) => {
                if (prevMessages.some((msg) => msg._id === message._id)) {
                  return prevMessages;
                }
                return [...prevMessages, message];
              });
            }
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      socket.onerror = () => socket.close();
      socket.onclose = () => {
        if (!shouldReconnect) return;
        reconnectTimerRef.current = setTimeout(connect, 1500);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Manage Active Chat Socket Rooms
  useEffect(() => {
    const socket = wsRef.current;
    const previousChat = activeChatRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      if (previousChat && previousChat !== activeChatId) {
        socket.send(
          JSON.stringify({ type: "leaveChat", chatId: previousChat }),
        );
      }
      if (activeChatId && activeChatId !== previousChat) {
        socket.send(JSON.stringify({ type: "joinChat", chatId: activeChatId }));
      }
    }
    activeChatRef.current = activeChatId || "";
  }, [activeChatId]);

  // Load Messages & Reveal Status
  useEffect(() => {
    if (!activeChatId) return;

    const fetchData = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const [msgRes, revealRes] = await Promise.all([
          getMessagesApi(activeChatId, token),
          getRevealStatusApi(activeChatId, token),
        ]);

        setMessages(msgRes.data.messages);
        setRevealStatus(revealRes.data);
      } catch (error) {
        console.error("Error fetching chat details:", error);
      }
    };

    fetchData();
  }, [activeChatId]);

  // Sync reveal status from chat list
  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId),
    [chats, activeChatId],
  );

  useEffect(() => {
    if (activeChat) {
      setRevealStatus((prev) => ({
        ...prev,
        revealed: activeChat.revealed || false,
        users: activeChat.revealed ? activeChat.users : prev.users,
      }));
    }
  }, [activeChat]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeChatId) return;
    setSendingMessage(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      await sendMessageApi(activeChatId, text.trim(), token);

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChatId
            ? { ...chat, updatedAt: new Date().toISOString() }
            : chat,
        ),
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const submitGuess = async (guess: string) => {
    if (!guess.trim() || !activeChatId) return null;
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await submitGuessApi(activeChatId, guess, token);
      if (response.data.revealed) {
        setRevealStatus({
          revealed: true,
          users: response.data.chat?.users || null,
        });

        // Update chats list locally
        setChats((prev) =>
          prev.map((c) =>
            c._id === activeChatId ? { ...c, revealed: true } : c,
          ),
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error submitting guess:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) return;
    const userResponse = await getMyProfileApi(token);
    const user: any = userResponse.data;
    setCurrentUser({
      ...user,
      id: user?._id ?? user?.id,
      guesses: user?.guesses ?? [],
    });
  };

  return {
    chats,
    messages,
    activeChatId,
    activeChat,
    setActiveChatId,
    loading,
    currentUser,
    revealStatus,
    sendMessage,
    sendingMessage,
    submitGuess,
    refreshUser,
  };
};
