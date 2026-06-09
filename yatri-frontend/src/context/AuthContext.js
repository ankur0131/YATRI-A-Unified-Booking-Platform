import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "yatri-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = readStorage(AUTH_STORAGE_KEY, {
      isAuthenticated: false,
      user: null,
    });
    const token = localStorage.getItem("token");
    
    // If token exists but no user data, try to restore from token
    if (token && token !== "" && token !== "undefined" && !stored.user) {
      // For now, we'll consider token valid if it exists
      // In production, you might want to validate the token with the backend
      return {
        isAuthenticated: true,
        user: { name: "User", email: "user@example.com", role: "user" }, // Fallback user data
      };
    }
    
    return stored;
  });

  useEffect(() => {
    writeStorage(AUTH_STORAGE_KEY, authState);
  }, [authState]);

  const login = useCallback((user) => {
    setAuthState({
      isAuthenticated: true,
      user: {
        ...user,
        role: user?.role || "user",
      },
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("yatri-post-login-path");
    localStorage.removeItem("token");
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      login,
      logout,
    }),
    [authState.isAuthenticated, authState.user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
