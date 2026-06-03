"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/app/utils/api";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { accessToken, role } = response.data;

        if (role !== "admin") {
          setError("Access denied. Admin role required.");
          return;
        }

        // Set httpOnly cookie via Set-Cookie header (handled by backend)
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("role", role);

        // Set document cookies for middleware
        document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 15}; samesite=lax`;
        document.cookie = `role=${encodeURIComponent(role)}; path=/; max-age=${60 * 15}; samesite=lax`;

        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-8 space-y-6">
          {/* Logo / Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">MW Sports</h1>
            <p className="text-gray-400 text-sm">Admin Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition mt-6"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-400">
            <p>
              Not an admin?{" "}
              <Link href="/" className="text-[#F97316] hover:underline">
                Return home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
