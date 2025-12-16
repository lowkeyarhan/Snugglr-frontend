import { api } from "./http";

// create a new confession
export const createConfession = async (
  text: string,
  token: string
): Promise<{
  success: boolean;
  data: {
    _id: string;
    confession: string;
    user: string;
    institution: string;
    likesCount: number;
    createdAt: string;
  };
}> => {
  try {
    const response = await api.post(
      "/api/confession",
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

// get all confessions for the user's institution
export const getConfessions = async (
  token: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data: {
    confessions: Array<{
      _id: string;
      confession: string;
      user: any;
      institution: string;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
      isLikedByMe?: boolean;
    }>;
    currentPage: number;
    totalPages: number;
    totalConfessions: number;
  };
}> => {
  try {
    const response = await api.get("/api/confession", {
      params: { page, limit },
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

// like or unlike a confession
export const likeConfession = async (
  confessionId: string,
  token: string
): Promise<{
  success: boolean;
  liked: boolean;
}> => {
  try {
    const response = await api.post(
      `/api/confession/${confessionId}/like`,
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

// get all comments for a confession
export const getCommentsForConfession = async (
  confessionId: string,
  token: string
): Promise<{
  success: boolean;
  data: Array<{
    _id: string;
    text: string;
    user: {
      _id: string;
      username: string;
      name?: string;
    };
    confession: string;
    parentComment: string | null;
    likesCount: number;
    createdAt: string;
    isLikedByMe?: boolean;
    replies?: any[];
  }>;
}> => {
  try {
    const response = await api.get(`/api/confession/${confessionId}/comments`, {
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

// comment on a confession
export const commentOnConfession = async (
  confessionId: string,
  text: string,
  token: string
): Promise<{
  success: boolean;
  data: any;
}> => {
  try {
    const response = await api.post(
      `/api/confession/${confessionId}/comment`,
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
      throw new Error(error.response.data.message || "Failed to post comment");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// reply to a comment
export const replyToComment = async (
  confessionId: string,
  commentId: string,
  text: string,
  token: string
): Promise<{
  success: boolean;
  data: any;
}> => {
  try {
    const response = await api.post(
      `/api/confession/${confessionId}/comment/${commentId}/reply`,
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
      throw new Error(error.response.data.message || "Failed to post reply");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// like or unlike a comment
export const likeComment = async (
  commentId: string,
  token: string
): Promise<{
  success: boolean;
  liked: boolean;
}> => {
  try {
    const response = await api.post(
      `/api/confession/comment/${commentId}/like`,
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
