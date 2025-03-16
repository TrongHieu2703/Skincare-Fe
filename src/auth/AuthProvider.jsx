// src/auth/AuthProvider.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        console.log("User authenticated from stored token");
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    console.log("User logged in:", userData.username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    console.log("User logged out");
  }, []);

  // Memoize the context value
  const authContextValue = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout
  }), [user, isAuthenticated, login, logout]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
