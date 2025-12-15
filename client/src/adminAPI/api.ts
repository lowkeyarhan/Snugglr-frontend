import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// =========================
// Domains / Communities
// =========================

export const getAllCommunities = async (token: string): Promise<any> => {
  const response = await api.get("/api/admin/domains", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteCommunity = async (
  id: string,
  token: string
): Promise<any> => {
  const response = await api.delete(`/api/admin/domains/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateCommunity = async (
  id: string,
  data: { institutionName?: string; domain?: string; isActive?: boolean },
  token: string
): Promise<any> => {
  const response = await api.put(`/api/admin/domains/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addCommunity = async (
  data: { institutionName: string; domain: string; isActive?: boolean },
  token: string
): Promise<any> => {
  const response = await api.post("/api/admin/domains", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// =========================
// Users
// =========================

export const getAllUsers = async (token: string): Promise<any> => {
  const response = await api.get("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUser = async (
  userId: string,
  token: string
): Promise<any> => {
  const response = await api.delete(`/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// =========================
// Chatrooms (Admin)
// Admin UI expects: response.data.chats
// Backend returns: response.data.chatrooms
// =========================

export const getAllChats = async (token: string): Promise<any> => {
  const response = await api.get("/api/admin/chatrooms", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const chatrooms = response.data?.data?.chatrooms || [];
  const chats = chatrooms.map((c: any) => ({
    _id: c._id,
    roomId: c._id,
    participants: (c.users || []).map((u: any) => ({
      _id: u?._id,
      username: u?.username || "",
      name: u?.name || "",
    })),
    community:
      c.institute?.institutionName ||
      c.institute?.name ||
      c.institute?.domain ||
      "",
    revealed: false,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return { success: true, data: { chats } };
};

export const deleteChat = async (
  chatId: string,
  token: string
): Promise<any> => {
  const response = await api.delete(`/api/admin/chatrooms/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// =========================
// Confessions / Comments (Admin UI)
// Backend routes are not currently present in `server/routes/adminRoute.ts`.
// Provide safe stubs so imports don't crash the app.
// =========================

export const getAllConfessions = async (_token: string): Promise<any> => {
  return { success: true, data: { confessions: [] } };
};

export const deleteConfession = async (
  _confessionId: string,
  _token: string
) => {
  return { success: true };
};

export const getAllComments = async (_token: string): Promise<any> => {
  return { success: true, data: { confessions: [] } };
};

export const deleteCommentAdmin = async (
  _confessionId: string,
  _commentId: string,
  _token: string
) => {
  return { success: true };
};

export default api;
