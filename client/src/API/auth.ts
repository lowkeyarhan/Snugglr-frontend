export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

export const getCurrentUserFromStorage = (): any | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

export const clearAuth = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Clear admin status cache
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("adminCheckTimestamp");
};
