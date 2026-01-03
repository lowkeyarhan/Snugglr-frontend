import { api } from "./http";

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
  type?: "text" | "system";
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      totalMessages: number;
      totalPages: number;
    };
    chatStatus: "LOCKED" | "ACTIVE" | "EXPIRED";
    anonymous: boolean;
  };
}

// get messages for a chatroom
export const getMessages = async (
  chatId: string,
  token: string,
  page?: number,
  limit?: number
): Promise<MessagesResponse> => {
  try {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await api.get(`/api/message/${chatId}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch messages"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// send a new message to a chatroom
export const sendMessage = async (
  chatId: string,
  text: string,
  token: string
): Promise<{
  success: boolean;
  data: {
    message: Message;
  };
}> => {
  try {
    const response = await api.post(
      `/api/message/${chatId}`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to send message");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
