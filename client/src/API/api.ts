import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      phoneNumber?: string;
      gender?: string;
      age?: number;
      birthday?: string;
      pronouns?: string;
      hint?: string;
      interests?: string[];
      musicPreferences?: string;
      favoriteShows?: string;
      memeVibe?: string;
      image?: string;
      community?: string;
      favoriteSpot?: string;
      loveLanguage?: string;
      quirkyFact?: string;
      fantasies?: string;
      idealDate?: string;
    };
    token: string;
  };
}

// What we send when logging in
interface LoginPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
}

// What we send when registering
interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  community?: string;
  birthday?: string;
  gender?: string;
  pronouns?: string;
  interests?: string[];
  musicPreferences?: string;
  favoriteShows?: string;
  memeVibe?: string;
  hint?: string;
}

/**
 * LOGIN USER
 * @param payload - Contains email/phone and password
 * @returns Promise with user data and token
 */
export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/login", payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * REGISTER NEW USER
 * @param payload - Contains email and password
 * @returns Promise with user data and token
 */
export const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/register", payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with an error (like email already exists)
      throw new Error(error.response.data.message || "Registration failed");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * GET CURRENT USER PROFILE
 * @param token - The JWT token from localStorage
 * @returns Promise with user data
 */
export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await api.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch profile");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * UPDATE USER PROFILE
 * Updates user profile with onboarding data
 * @param data - Profile data to update
 * @param token - JWT token for authentication
 * @returns Promise with updated user data
 */
export const updateUserProfile = async (
  data: any,
  token: string
): Promise<AuthResponse> => {
  try {
    const response = await api.put("/api/user/profile", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to update profile"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * UPDATE USER SETTINGS
 * Updates privacy and app preference settings
 * @param data - Settings payload
 * @param token - JWT token for authentication
 * @returns Promise with updated user data
 */
export const updateUserSettings = async (
  data: {
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    showActiveStatus?: boolean;
    hideDisplayPicture?: boolean;
  },
  token: string
): Promise<AuthResponse> => {
  try {
    const response = await api.put("/api/user/settings", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to update settings"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * CHANGE PASSWORD
 * Changes user password
 * @param data - Password change payload
 * @param token - JWT token for authentication
 * @returns Promise with success response
 */
export const changePassword = async (
  data: {
    currentPassword: string;
    newPassword: string;
  },
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put("/api/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to change password"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * GET POTENTIAL MATCHES
 * Fetches users you can swipe on
 * @param token - JWT token for authentication
 * @returns Promise with potential matches
 */
export const getPotentialMatches = async (token: string): Promise<any> => {
  try {
    const response = await api.get("/api/user/potential-matches", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch matches");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * SWIPE ON A USER
 * Swipes right (like) or left (pass) on a user
 * @param userId - The user ID to swipe on
 * @param action - "like" or "pass"
 * @param token - JWT token for authentication
 * @returns Promise with swipe result
 */
export const swipeUser = async (
  userId: string,
  action: "like" | "pass",
  token: string
): Promise<any> => {
  try {
    const response = await api.post(
      "/api/match/swipe",
      {
        targetUserId: userId,
        action: action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to swipe");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * CREATE CONFESSION
 * Creates a new confession
 * @param data - Confession data
 * @param token - JWT token for authentication
 * @returns Promise with confession data
 */
export const createConfession = async (
  data: {
    text: string;
  },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data?: {
    confession: any;
  };
}> => {
  try {
    const response = await api.post("/api/confessions", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to create confession"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * GET CONFESSIONS
 * Fetches confessions for the user's domain
 * @param token - JWT token for authentication
 * @param page - Page number for pagination
 * @param limit - Number of confessions per page
 * @returns Promise with confessions data
 */
export const getConfessions = async (
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data: {
    confessions: any[];
    currentPage: number;
    totalPages: number;
    totalConfessions: number;
  };
}> => {
  try {
    const response = await api.get("/api/confessions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
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

/**
 * LIKE CONFESSION
 * Likes a confession
 * @param confessionId - The confession ID to like
 * @param token - JWT token for authentication
 * @returns Promise with like result
 */
export const likeConfession = async (
  confessionId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    likesCount: number;
    hasLiked: boolean;
  };
}> => {
  try {
    const response = await api.post(
      `/api/confessions/${confessionId}/like`,
      {},
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
        error.response.data.message || "Failed to like confession"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * COMMENT ON CONFESSION
 * Adds a comment to a confession
 * @param confessionId - The confession ID to comment on
 * @param data - Comment data
 * @param token - JWT token for authentication
 * @returns Promise with comment result
 */
export const commentOnConfession = async (
  confessionId: string,
  data: {
    text: string;
  },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    comments: any[];
    commentsCount: number;
  };
}> => {
  try {
    const response = await api.post(
      `/api/confessions/${confessionId}/comment`,
      data,
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
        error.response.data.message || "Failed to comment on confession"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * LIKE COMMENT
 * Likes/unlikes a comment on a confession
 * @param confessionId - The confession ID
 * @param commentId - The comment ID to like
 * @param token - JWT token for authentication
 * @returns Promise with like result
 */
export const likeComment = async (
  confessionId: string,
  commentId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    likesCount: number;
    hasLiked: boolean;
  };
}> => {
  try {
    const response = await api.post(
      `/api/confessions/${confessionId}/comment/${commentId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to like comment");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * REPLY TO COMMENT
 * Adds a reply to a comment
 * @param confessionId - The confession ID
 * @param commentId - The comment ID to reply to
 * @param data - Reply data
 * @param token - JWT token for authentication
 * @returns Promise with reply result
 */
export const replyToComment = async (
  confessionId: string,
  commentId: string,
  data: {
    text: string;
  },
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    replies: any[];
    repliesCount: number;
  };
}> => {
  try {
    const response = await api.post(
      `/api/confessions/${confessionId}/comment/${commentId}/reply`,
      data,
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
        error.response.data.message || "Failed to reply to comment"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * LIKE REPLY
 * Likes/unlikes a reply on a comment
 * @param confessionId - The confession ID
 * @param commentId - The comment ID
 * @param replyId - The reply ID to like
 * @param token - JWT token for authentication
 * @returns Promise with like result
 */
export const likeReply = async (
  confessionId: string,
  commentId: string,
  replyId: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    likesCount: number;
    hasLiked: boolean;
  };
}> => {
  try {
    const response = await api.post(
      `/api/confessions/${confessionId}/comment/${commentId}/reply/${replyId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to like reply");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * GET CHAT ROOMS
 * Fetches all chat rooms for the current user
 * @param token - JWT token for authentication
 * @returns Promise with chats data
 */
export const getChatRooms = async (
  token: string
): Promise<{
  success: boolean;
  data: {
    chats: any[];
  };
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

/**
 * GET MESSAGES
 * Fetches messages for a specific chat
 * @param chatId - The chat ID to fetch messages for
 * @param token - JWT token for authentication
 * @returns Promise with messages data
 */
export const getMessages = async (
  chatId: string,
  token: string
): Promise<{
  success: boolean;
  data: {
    messages: any[];
    revealed: boolean;
  };
}> => {
  try {
    const response = await api.get(`/api/chat/${chatId}/messages`, {
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

/**
 * SEND MESSAGE
 * Sends a message to a chat
 * @param chatId - The chat ID to send message to
 * @param text - The message text
 * @param token - JWT token for authentication
 * @returns Promise with message data
 */
export const sendMessage = async (
  chatId: string,
  text: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    message: any;
  };
}> => {
  try {
    const response = await api.post(
      `/api/chat/${chatId}/message`,
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

/**
 * SUBMIT GUESS
 * Submits a guess for the identity guessing game
 * @param chatId - The chat ID to submit guess for
 * @param guess - The guess text
 * @param token - JWT token for authentication
 * @returns Promise with guess result
 */
export const submitGuess = async (
  chatId: string,
  guess: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  data: {
    guessSubmitted: boolean;
    bothGuessed: boolean;
    revealed: boolean;
    chat?: any;
  };
}> => {
  try {
    const response = await api.post(
      "/api/chat/guess",
      { chatId, guess },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to submit guess");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * GET REVEAL STATUS
 * Gets the reveal status of a chat
 * @param chatId - The chat ID to check reveal status for
 * @param token - JWT token for authentication
 * @returns Promise with reveal status
 */
export const getRevealStatus = async (
  chatId: string,
  token: string
): Promise<{
  success: boolean;
  data: {
    revealed: boolean;
    users: any[] | null;
  };
}> => {
  try {
    const response = await api.get(`/api/chat/${chatId}/reveal-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to get reveal status"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * CHECK ADMIN STATUS
 * Checks if the user is an admin
 * @param token - JWT token for authentication
 * @returns Promise with admin status
 */
export const checkAdminStatus = async (
  token: string
): Promise<{
  success: boolean;
  isAdmin: boolean;
  data: {
    isAdmin: boolean;
    role: string | null;
  };
}> => {
  try {
    const response = await api.get("/api/admin/check-status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to check admin status"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export default api;
