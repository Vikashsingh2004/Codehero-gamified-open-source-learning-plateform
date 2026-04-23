import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error("Signup failed:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
