"use client";

import { useState, useCallback } from "react";
import type { SafeUser, Role } from "@/types/indextypes";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
  locationName?: string;
  position?: string;
}

interface AuthResult {
  success: boolean;
  user?: SafeUser;
  accessToken?: string;
  error?: string;
}

async function loginRequest(input: LoginInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.message || "Login failed",
    };
  }

  return {
    success: true,
    user: data.user,
    accessToken: data.accessToken,
  };
}

async function registerRequest(input: RegisterInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.message || "Registration failed",
    };
  }

  return {
    success: true,
    user: data.user,
    accessToken: data.accessToken,
  };
}

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (input: LoginInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginRequest(input);

      if (result.success && result.user) {
        setUser(result.user);
        if (result.accessToken) {
          localStorage.setItem("accessToken", result.accessToken);
        }
        return true;
      }

      setError(result.error || "Login failed");
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerRequest(input);

      if (result.success && result.user) {
        setUser(result.user);
        if (result.accessToken) {
          localStorage.setItem("accessToken", result.accessToken);
        }
        return true;
      }

      setError(result.error || "Registration failed");
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
  }, []);

  return { user, isLoading, error, login, register, logout };
}
