"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { logout, user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ClockHub Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome{user?.name ? `, ${user.name}` : ""}!</h2>
          <p>You have successfully logged in.</p>
          {user && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
