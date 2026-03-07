import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // load user from localStorage on initial load
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // login function
  const login = (userData) => {
    setUser(userData);
    navigate("/dashboard"); // redirect after login
  };

  // logout function
  const logout = () => {
    setUser(null);
    navigate("/login"); // redirect after logout
  };

  // Axios instance with JWT in headers
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:5000/api",
    });

    // attach token if user exists
    instance.interceptors.request.use((config) => {
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    });

    return instance;
  }, [user]); // rebuild instance if user changes

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook to use context
export const useAuth = () => useContext(AuthContext);