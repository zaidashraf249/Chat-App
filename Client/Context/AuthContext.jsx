// Context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const BackendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = BackendUrl;
// ensure cookies are sent if backend uses them
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // will hold array of IDs (strings) or user objects depending on server
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios Authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    checkAuth(); // verify token & get user
  }, [token]);

  // Check auth on start / token change
  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/check");
      if (res?.data?.user) {
        setAuthUser(res.data.user);
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error?.response?.data || error);
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      const res = await axios.post(`/api/auth/${state}`, credentials);
      const { success, userData, token: newToken, message } = res.data;

      if (success) {
        setToken(newToken);
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        setAuthUser(userData);
        toast.success(message);
      } else {
        toast.error(message || "Login failed");
      }
    } catch (error) {
      console.error("Login/Signup error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully!");
  };

  // Update profile
  const updateProfile = async ({ name, bio, profilePic }) => {
    try {
      if (!authUser?._id) throw new Error("No authenticated user");
      const res = await axios.put(
        `/api/auth/update-profile/${authUser._id}`,
        { fullName: name, bio, profilePic },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setAuthUser((prev) => ({ ...prev, ...res.data.user }));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Connect socket when authUser is available, cleanup on change/unmount
  useEffect(() => {
    if (!authUser) return;

    // If already connected with same user, skip
    if (socket && socket.connected) {
      // optionally re-emit / re-attach if needed
      return;
    }

    // Create socket and attach listeners
    const s = io(BackendUrl, {
      query: { userId: authUser._id },
      transports: ["websocket", "polling"],
      // autoConnect: true by default
    });

    // set to state (so other components can use it)
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected ✅", s.id);
    });

    // IMPORTANT: listen for getOnlineUsers and log it
    s.on("getOnlineUsers", (userIds) => {
      console.log("📡 Received online users from server:", userIds);
      // backend may send array of IDs or array of user objects. Save as-is.
      setOnlineUsers(userIds.map(String));
    });

    s.on("disconnect", (reason) => {
      console.log("Socket disconnected ❌", reason);
      // keep onlineUsers cleared or leave as-is depending on UX
      setOnlineUsers([]);
    });

    // cleanup on unmount or authUser change
    return () => {
      try {
        s.off("getOnlineUsers");
        s.disconnect();
      } catch (err) {
        // ignore
      }
      setSocket(null);
      setOnlineUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]); // run when authUser becomes available or changes

  // Optional: if token removed (logout) ensure socket cleanup
  useEffect(() => {
    if (!token && socket) {
      socket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        axios,
        authUser,
        loading,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        setAuthUser, // optional: let other components update authUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
