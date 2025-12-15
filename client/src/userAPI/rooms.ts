import { api } from "./http";

export interface ChatRoom {
  _id: string;
  institute: string;
  users: Array<
    | string
    | {
        _id: string;
        name?: string;
        username?: string;
        profilePicture?: string;
      }
  >;
  type: "personal" | "group";
  status?: "LOCKED" | "ACTIVE" | "EXPIRED";
  anonymous?: boolean;
  groupName?: string;
  openingMoveSession?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// "Inbox" chat view (backend: GET /api/chat, GET /api/chat/:chatId)
export type ChatListItem = {
  chatId: string;
  type: "personal" | "group";
  status: "LOCKED" | "ACTIVE" | "EXPIRED";
  anonymous: boolean;
  displayName: string | null;
  lastMessage: null | {
    text: string | null;
    createdAt: string;
  };
  expiresAt: string | null;
};

export type ChatMeta = {
  chatId: string;
  type: "personal" | "group";
  status: "LOCKED" | "ACTIVE" | "EXPIRED";
  anonymous: boolean;
  expiresAt: string | null;
  openingMoveSession: string | null;
};

// create a new personal chatroom (1-on-1 chat)
export const createPersonalChat = async (
  userIds: string[],
  token: string
): Promise<ChatRoom> => {
  try {
    const response = await api.post(
      "/api/room/personal",
      { userIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to create personal chat"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// create a new group chatroom
export const createGroupChat = async (
  userIds: string[],
  groupName: string,
  token: string
): Promise<ChatRoom> => {
  try {
    const response = await api.post(
      "/api/room/group",
      { userIds, groupName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to create group chat"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// add a user to a group chat
export const addUserToGroup = async (
  chatId: string,
  userIdToAdd: string,
  token: string
): Promise<ChatRoom> => {
  try {
    const response = await api.post(
      "/api/room/add-user",
      { chatId, userIdToAdd },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to add user to group"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// remove a user from a group chat
export const removeUserFromGroup = async (
  chatId: string,
  userIdToRemove: string,
  token: string
): Promise<ChatRoom> => {
  try {
    const response = await api.post(
      "/api/room/remove-user",
      { chatId, userIdToRemove },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to remove user from group"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// get all chatrooms for the logged-in user (instagram inbox)
export const getMyChats = async (token: string): Promise<ChatRoom[]> => {
  try {
    const response = await api.get("/api/room/my-chats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch chats");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// get a single chatroom by ID
export const getChatById = async (
  chatId: string,
  token: string
): Promise<ChatRoom> => {
  try {
    const response = await api.get(`/api/room/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch chat");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getUserChats = async (
  token: string
): Promise<{
  success: boolean;
  data: ChatListItem[];
}> => {
  try {
    const response = await api.get("/api/chat", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch chats");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getChatMeta = async (
  chatId: string,
  token: string
): Promise<{
  success: boolean;
  data: ChatMeta;
}> => {
  try {
    const response = await api.get(`/api/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch chat metadata"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
