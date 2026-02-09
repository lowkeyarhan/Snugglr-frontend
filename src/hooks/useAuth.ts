import { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  logout as logoutApi,
  getUser,
  isAuthenticated as checkAuth,
  setAuthToken,
  setUser as setStorageUser,
} from "../../api/user/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const isAuth = checkAuth();
      setAuthenticated(isAuth);
      if (isAuth) {
        setUser(getUser());
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: {
    email?: string;
    phoneNumber?: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await loginUser(data);
      if (response.data) {
        setAuthToken(response.data.token);
        setStorageUser(response.data.user);
        setUser(response.data.user);
        setAuthenticated(true);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      if (response.data) {
        setAuthToken(response.data.token);
        setStorageUser(response.data.user);
        setUser(response.data.user);
        setAuthenticated(true);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    setAuthenticated(false);
  };

  return {
    user,
    loading,
    authenticated,
    login,
    register,
    logout,
    checkAuth, // expose for non-hook usage if needed, though usually hook state is better
  };
};
