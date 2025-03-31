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
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            
            // Kiểm tra tính hợp lệ của token
            const isTokenValid = await validateToken(storedToken);
            
            if (isTokenValid) {
              setUser(userData);
              setIsAuthenticated(true);
              setIsAdmin(userData.role === "Admin");
              console.log("User authenticated from stored token:", userData.username);
              console.log("Current avatar URL:", userData.avatar);
            } else {
              console.log("Stored token is invalid or expired");
              clearAuthData();
            }
          } catch (error) {
            console.error("Error parsing stored user:", error);
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    // Helper function to clear auth data
    const clearAuthData = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    };

    // Simple token validation function
    const validateToken = async (token) => {
      try {
        // Phân tích JWT token (cơ bản)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return false;
        
        const payload = JSON.parse(atob(tokenParts[1]));
        const expTimestamp = payload.exp * 1000; // Chuyển từ giây sang milliseconds
        
        // Nếu token đã hết hạn
        if (Date.now() >= expTimestamp) {
          console.log("Token expired");
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    };

    checkAuth();

    // Lắng nghe sự kiện window.storage để cập nhật khi có thay đổi từ tab khác
    window.addEventListener('storage', checkAuth);
    
    // Lắng nghe sự kiện custom khi user update profile
    const handleProfileUpdate = () => {
      console.log("Profile update detected, refreshing user data");
      checkAuth();
    };
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const login = useCallback((userData, token) => {
    console.log("Login with userData:", userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === "Admin");
    setLoading(false);
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

  // Hàm cập nhật thông tin người dùng khi profile thay đổi
  const updateUserData = useCallback((updatedUserData) => {
    try {
      // Lấy userData hiện tại từ localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Cập nhật thông tin mới
        const newUserData = { 
          ...userData, 
          ...updatedUserData 
        };
        
        // Lưu lại vào localStorage
        localStorage.setItem("user", JSON.stringify(newUserData));
        // Cập nhật state
        setUser(newUserData);
        
        console.log("User data updated:", newUserData);
        // Thông báo cập nhật để các component khác nhận biết
        window.dispatchEvent(new CustomEvent('user-profile-updated'));
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
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
    updateUserData,
    checkTokenExpiration
  }), [user, isAuthenticated, isAdmin, loading, login, logout, updateUserData, checkTokenExpiration]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
