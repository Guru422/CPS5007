import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "student" | "mentor" | "teacher";

export interface User {
  id?: string;
  isAuthenticated: boolean;
  role: Role;
  fullName?: string;
  email?: string;
  studentId?: string;
}

interface AuthContextValue {
  user: User;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultUser: User = {
  id: undefined,
  isAuthenticated: false,
  role: "student",
  fullName: "",
  email: "",
  studentId: ""
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  const login = (loggedInUser: User) => {
    setUser({
      ...loggedInUser,
      isAuthenticated: true
    });
  };

  const signup = (newUser: User) => {
    setUser({
      ...newUser,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setUser(defaultUser);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}