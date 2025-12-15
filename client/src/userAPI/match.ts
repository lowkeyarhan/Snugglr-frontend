import { api } from "./http";

// join the match pool to find potential matches
export const joinMatchPool = async (
  mood: string,
  description: string | undefined,
  token: string
): Promise<{
  message: string;
}> => {
  try {
    const response = await api.post(
      "/api/match/pool/join",
      { mood, description },
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
        error.response.data.message || "Failed to join match pool"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// try to match with another user in the pool
export const tryMatch = async (
  token: string
): Promise<{
  matched: boolean;
  chatId?: string;
}> => {
  try {
    const response = await api.post(
      "/api/match/try",
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
      throw new Error(error.response.data.message || "Failed to attempt match");
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// submit an opening move choice for a locked chat
export const submitOpeningMove = async (
  chatId: string,
  choice: string,
  token: string
): Promise<{
  success: boolean;
}> => {
  try {
    const response = await api.post(
      "/api/match/opening-move",
      { chatId, choice },
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
        error.response.data.message || "Failed to submit opening move"
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
