import { api } from "./http";

// get the authentication jwt token from the local storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// set the authentication jwt token to the local storage
export const setAuthToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// remove the authentication jwt token from the local storage
export const removeAuthToken = (): void => {
  localStorage.removeItem("token");
};

// get the user from the local storage
export const getUser = (): any | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

// set the user to the local storage
export const setUser = (user: any): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

// remove the user from the local storage
export const removeUser = (): void => {
  localStorage.removeItem("user");
};

// logout the user by removing the authentication jwt token and the user from the local storage
export const logout = (): void => {
  removeAuthToken();
  removeUser();
  window.location.href = "/";
};

// check if the user is authenticated by checking if the authentication jwt token is in the local storage
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// register a new user
export const registerUser = async (data: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      collegeName: string;
      institution: string;
      role: string;
    };
    token: string;
  };
}> => {
  try {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to register. Please try again."
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// login user
export const loginUser = async (data: {
  email?: string;
  phoneNumber?: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      phoneNumber?: string;
      gender?: string;
      collegeName: string;
      institution: string;
      role: string;
    };
    token: string;
  };
}> => {
  try {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to login. Please try again."
      );
    } else if (error.request) {
      throw new Error("Cannot connect to server. Please try again.");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
