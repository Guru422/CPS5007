import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "student" | "mentor" | "teacher";

export interface User {
  isAuthenticated: boolean;
  role: Role;
  fullName?: string;
  email?: string;
  studentId?: string;
}

interface AuthContextValue {
  user: User;
  login: (params: {
    role: Role;
    fullName?: string;
    email?: string;
    studentId?: string;
  }) => void;
  signup: (params: {
    role: Role;
    fullName?: string;
    email?: string;
    studentId?: string;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    isAuthenticated: false,
    role: "student",
    fullName: "",
    email: "",
    studentId: "",
  });

  const login: AuthContextValue["login"] = ({ role, fullName, email, studentId }) => {
    setUser({
      isAuthenticated: true,
      role,
      fullName: fullName ?? "Demo User",
      email: email ?? "",
      studentId: studentId ?? "",
    });
  };

  const signup: AuthContextValue["signup"] = ({ role, fullName, email, studentId }) => {
    setUser({
      isAuthenticated: true,
      role,
      fullName: fullName ?? "New User",
      email: email ?? "",
      studentId: studentId ?? "",
    });
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      role: "student",
      fullName: "",
      email: "",
      studentId: "",
    });
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}