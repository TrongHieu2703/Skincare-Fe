// src/auth/AuthProvider.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token và user từ localStorage khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.role === "Admin");
          console.log("User authenticated from stored token:", userData.username);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAuth();

    // Lắng nghe sự kiện window.storage để cập nhật khi có thay đổi từ tab khác
    window.addEventListener('storage', checkAuth);
    
    // Lắng nghe sự kiện custom khi user update profile
    window.addEventListener('user-profile-updated', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('user-profile-updated', checkAuth);
    };
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === "Admin");
    console.log("User logged in:", userData.username, "Role:", userData.role);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    console.log("User logged out");
  }, []);

  // Thêm phương thức để kiểm tra token hết hạn
  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
      // Phân tích JWT token (cơ bản)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expTimestamp = payload.exp * 1000; // Chuyển từ giây sang milliseconds
      
      // Nếu token đã hết hạn
      if (Date.now() >= expTimestamp) {
        console.log("Token expired");
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return false;
    }
  }, [logout]);

  // Memoize the context value
  const authContextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    checkTokenExpiration
  }), [user, isAuthenticated, isAdmin, loading, login, logout, checkTokenExpiration]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
