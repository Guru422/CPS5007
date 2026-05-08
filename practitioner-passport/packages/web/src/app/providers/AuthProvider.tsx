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
  login: (params: { email?: string; password?: string }) => Promise<void>;
  signup: (params: {
    role: Role;
    fullName?: string;
    email?: string;
    studentId?: string;
    password?: string;
    confirmPassword?: string;
  }) => Promise<{ message: string; previewUrl: string | false | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId: string;
  isAuthenticated: true;
};

type ApiError = {
  message?: string;
  error?: string;
};

async function requestJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = "Request failed.";
    try {
      const data = (await response.json()) as ApiError;
      if (typeof data?.message === "string" && data.message.trim()) {
        errorMessage = data.message;
      } else if (typeof data?.error === "string" && data.error.trim()) {
        errorMessage = data.error;
      }
    } catch {
      // Ignore invalid error body and keep generic message.
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId: string;
  isAuthenticated: true;
};

type ApiError = {
  message?: string;
  error?: string;
};

async function requestJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = "Request failed.";
    try {
      const data = (await response.json()) as ApiError;
      if (typeof data?.message === "string" && data.message.trim()) {
        errorMessage = data.message;
      } else if (typeof data?.error === "string" && data.error.trim()) {
        errorMessage = data.error;
      }
    } catch {
      // Ignore invalid error body and keep generic message.
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

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

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    const data = await requestJson<{ user: ApiUser }>("/bff/auth/login", { email, password });

    setUser({
      id: data.user.id,
      isAuthenticated: data.user.isAuthenticated,
      role: data.user.role,
      fullName: data.user.fullName,
      email: data.user.email,
      studentId: data.user.studentId,
    });
  };

  const signup: AuthContextValue["signup"] = async ({
    role,
    fullName,
    email,
    studentId,
    password,
    confirmPassword,
  }) => {
    const result = await requestJson<{ message: string; previewUrl: string | false | null }>(
      "/bff/auth/signup-request",
      {
        role,
        fullName,
        email,
        studentId,
        password,
        confirmPassword,
        webBaseUrl: window.location.origin,
      },
    );

    setUser({
      id: undefined,
      isAuthenticated: false,
      role: "student",
      fullName: "",
      email: "",
      studentId: "",
    });

    return result;
  };

  const logout = () => {
    setUser({
      id: undefined,
      isAuthenticated: false,
      role: "student",
      fullName: "",
      email: "",
      studentId: "",
    });
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