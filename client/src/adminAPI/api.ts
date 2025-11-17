import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

//get all communities/domains
export const getAllCommunities = async (
  token: string
): Promise<{
  success: boolean;
  count: number;
  data: {
    domains: Array<{
      _id: string;
      institutionName: string;
      domain: string;
      isActive: boolean;
      createdAt: string;
    }>;
  };
}> => {
  try {
    const response = await api.get("/api/admin/domains", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch communities"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//delete community
export const deleteCommunity = async (
  id: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(`/api/admin/domains/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete community"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//update community
export const updateCommunity = async (
  id: string,
  data: { institutionName?: string; domain?: string; isActive?: boolean },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    domain: {
      _id: string;
      institutionName: string;
      domain: string;
      isActive: boolean;
      createdAt: string;
    };
  };
}> => {
  try {
    const response = await api.put(`/api/admin/domains/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to update community"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//add community
export const addCommunity = async (
  data: { institutionName: string; domain: string; isActive?: boolean },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    domain: {
      _id: string;
      institutionName: string;
      domain: string;
      isActive: boolean;
      createdAt: string;
    };
  };
}> => {
  try {
    const response = await api.post("/api/admin/domains", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to add community");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//get all users (for admin)
export const getAllUsers = async (
  token: string
): Promise<{
  success: boolean;
  data: {
    users: Array<{
      _id: string;
      username: string;
      name: string;
      age: number;
      gender: string;
      community: string;
      email: string;
    }>;
  };
}> => {
  try {
    const response = await api.get(`/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch users");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//delete user (for admin)
export const deleteUser = async (
  userId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(`/api/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to delete user");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//get all chat rooms (for admin)
export const getAllChats = async (
  token: string
): Promise<{
  success: boolean;
  count: number;
  data: {
    chats: Array<{
      _id: string;
      roomId: string;
      participants: Array<{
        _id: string;
        username: string;
        name: string;
      }>;
      community: string;
      revealed: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}> => {
  try {
    const response = await api.get("/api/admin/chats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch chat rooms"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//delete chat room (for admin)
export const deleteChat = async (
  chatId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(`/api/admin/chats/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete chat room"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//get all confessions (for admin)
export const getAllConfessions = async (
  token: string
): Promise<{
  success: boolean;
  count: number;
  data: {
    confessions: Array<{
      _id: string;
      confession: string;
      username: string;
      community: string;
      domain: string;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
    }>;
  };
}> => {
  try {
    const response = await api.get("/api/admin/confessions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch confessions"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//delete confession (for admin)
export const deleteConfession = async (
  confessionId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(
      `/api/admin/confessions/${confessionId}`,
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
        error.response.data.message || "Failed to delete confession"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//get all comments (for admin)
export const getAllComments = async (
  token: string
): Promise<{
  success: boolean;
  count: number;
  data: {
    confessions: Array<{
      _id: string;
      confession: string;
      username: string;
      community: string;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
      comments: Array<{
        _id: string;
        username: string;
        userId?: string;
        text: string;
        createdAt: string;
        likesCount: number;
        repliesCount: number;
        replies: Array<{
          _id: string;
          text: string;
          createdAt: string;
          username: string;
          userId?: string;
          likesCount: number;
        }>;
      }>;
    }>;
  };
}> => {
  try {
    const response = await api.get("/api/admin/comments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch comments"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

//delete comment (for admin)
export const deleteCommentAdmin = async (
  confessionId: string,
  commentId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete(
      `/api/admin/comments/${confessionId}/${commentId}`,
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
        error.response.data.message || "Failed to delete comment"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export default api;
