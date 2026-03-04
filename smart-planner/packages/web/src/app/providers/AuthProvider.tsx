import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "student" | "parent" | "teacher";

export interface User {
  isAuthenticated: boolean;
  role: Role;
  paid: boolean; // only meaningful for student
  emailOrId?: string;
}

interface AuthContextValue {
  user: User;
  login: (params: { role: Role; paid?: boolean; emailOrId?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    isAuthenticated: false,
    role: "student",
    paid: false,
    emailOrId: "",
  });

  const login: AuthContextValue["login"] = ({ role, paid, emailOrId }) => {
    setUser({
      isAuthenticated: true,
      role,
      paid: role === "student" ? Boolean(paid) : false,
      emailOrId: emailOrId ?? "",
    });
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      role: "student",
      paid: false,
      emailOrId: "",
    });
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}