import React, { createContext, useContext, useState, useEffect } from "react";

import { userService } from "@/services/userService";

import { authService } from "../services/authService";

export const AuthContext = createContext(null);

// ✅ Optional hook for cleaner access in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth called outside of AuthProvider");
    console.trace();
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //console.log('AuthProvider initialized');

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    //console.log('AuthContext: Loading stored user data:', storedUser);

    if (storedUser) {
      /* console.log('AuthContext: Setting user from localStorage:', {
        id: storedUser._id,
        name: storedUser.name,
        photo: storedUser.photo,
        imagesUrl: storedUser.imagesUrl
      }); */
      setUser(storedUser);
    } else {
      console.log("AuthContext: No stored user data found");
    }
    setLoading(false);
  }, []);

  // Ensure children is provided
  if (!children) {
    console.error("AuthProvider requires children");
    return null;
  }

  const login = async (email, password) => {
    const result = await authService.login({ email, password });

    if (result.success) {
      const userData = result.data.data.user;
      const token = result.data.token;

      authService.storeAuthData(token, userData);
      setUser(userData);

      return { success: true, user: userData };
    }

    return result;
  };

  const signup = async (userData) => {
    const result = await authService.signup(userData);

    if (result.success) {
      // Signup only returns success message, no user data or token
      // User needs to verify email first before they can login
      return { success: true, message: result.data.message };
    }

    return result;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      authService.clearAuthData();
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = { ...user, ...profileData };
      const result = await userService.updateMe(updatedUser);
      console.log("😅😅😅😅😄")
      authService.storeAuthData(false, result.data.data.user);
      setUser(result.data.data.user);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserPhoto = async (photoData) => {
    try {
      // If photoData is a complete user object from backend, use it directly
      if (photoData && typeof photoData === "object" && photoData._id) {
        // This is a complete user object from backend
        setUser(photoData);
        authService.storeAuthData(false, photoData); // Use consistent storage method
        return { success: true, user: photoData };
      } else {
        // This is just photo data, merge with existing user
        const updatedUser = { ...user, ...photoData };
        setUser(updatedUser);
        authService.storeAuthData(false, updatedUser); // Use consistent storage method
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    try {
      const result = await userService.getMe();
      if (result.success && result.data?.data?.user) {
        const freshUserData = result.data.data.user;
        setUser(freshUserData);
        authService.storeAuthData(false, freshUserData); // Use consistent storage method
        return { success: true, user: freshUserData };
      }
      return { success: false, error: "Failed to refresh user data" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (password, currentPassword, passwordConfirm) => {
    const result = await authService.updatePassword(
      password,
      currentPassword,
      passwordConfirm
    );
    if (result.success) {
      const userData = result.data.data.user;
      const token = result.data.token;

      authService.storeAuthData(token, userData);
      setUser(userData);

      return { success: true, user: userData };
    }

    return result;
  };

  const forgotPassword = async (email) => {
    const result = await authService.forgotPassword(email);
    return result;
  };

  const resetPassword = async (token, password, passwordConfirm) => {
    const result = await authService.resetPassword(
      token,
      password,
      passwordConfirm
    );
    if (result.success) {
      const userData = result.data.data.user;
      const tokenStr = result.data.token;
      authService.storeAuthData(tokenStr, userData);
      setUser(userData);
      return { success: true, user: userData };
    }
    return result;
  };

  const verifyEmail = async (userId) => {
    const result = await authService.verifyEmail(userId);
    if (result.success && result.data?.token) {
      const userData = result.data.data.user;
      const tokenStr = result.data.token;
      authService.storeAuthData(tokenStr, userData);
      setUser(userData);
    }
    return result;
  };

  const sendVerification = async (userId) => {
    const result = await authService.sendVerification(userId);
    return result;
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    updateUserPhoto,
    refreshUserData,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    sendVerification,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isEmployee: user?.role === "employee",
    isAdminOrEmployee: user?.role === "admin" || user?.role === "employee",
    isSeller: user?.role === "seller",
    isBuyer: user?.role === "buyer",
    isAgent: user?.role === "agent",
  };

  console.log("AuthProvider rendering with value:", {
    user: !!user,
    loading,
    isAuthenticated: !!user,
  });

  // Ensure the context value is properly structured
  if (!value || typeof value !== "object") {
    console.error("AuthProvider value is not properly structured:", value);
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
