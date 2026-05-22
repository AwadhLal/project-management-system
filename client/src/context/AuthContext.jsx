import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../configs/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Socket Connection Management
  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_BASEURL || "http://localhost:5000";
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected client-side 🔌");
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      console.error("Fetch user failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, image) => {
    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
        image,
      });
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getToken = async () => {
    return localStorage.getItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded: !loading,
        loading,
        login,
        register,
        logout,
        getToken,
        setUser,
        socket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const useUser = () => useAuth();
export const useClerk = () => {
  const auth = useAuth();
  return {
    openUserProfile: () => {
      toast.success("Profile Settings functionality can be added here!");
    },
    signOut: auth.logout,
  };
};
