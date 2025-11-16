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

//get community by id
export const getCommunityById = async (
  id: string,
  token: string
): Promise<{
  success: boolean;
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
    const response = await api.get(`/api/admin/domains/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch community"
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

//get users by community (for admin)
export const getUsersByCommunity = async (
  community: string,
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
    const response = await api.get(`/api/admin/users/community/${community}`, {
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

export default api;
