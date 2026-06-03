"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../utils/api";
import { mergeGuestCart } from "../utils/cart";
import { useToast } from "../Components/ui/ToastContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  const setAuthCookies = (accessToken: string, role: string, username: string) => {
    const maxAge = 60 * 15;
    document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=${maxAge}; samesite=lax`;
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const data = response.data;

        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        if (data.userId) localStorage.setItem("userId", data.userId);
        if (data.email) localStorage.setItem("email", data.email);

        setAuthCookies(data.accessToken, data.role, data.username);

        showToast("Login successful!", "success");

        await mergeGuestCart();
        window.dispatchEvent(new Event("cart:updated"));

        // Check user role and redirect accordingly
        if (data.role === "admin") {
          await router.push("/admin"); // Admin page
        } else {
          await router.push("/"); // Home page
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      showToast("Invalid email or password", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-black light:bg-[#F9FAFB]">
      <div className="dark:bg-transparent dark:border dark:border-gray-50 light:bg-white light:border light:border-[#D1D5DB] shadow-2xl rounded-lg p-8 max-w-md w-full space-y-6">
        <h2 className="text-3xl font-extrabold text-center dark:text-white light:text-[#1F2937]">Login to MW Sports</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block dark:text-gray-300 light:text-[#6B7280] font-medium">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 dark:bg-transparent light:bg-[#F3F4F6] dark:text-gray-300 light:text-[#1F2937] dark:border-gray-50 light:border-[#D1D5DB] border rounded-lg dark:focus:outline-none light:focus:outline-none dark:focus:ring-2 light:focus:ring-2 dark:focus:ring-orange-500 light:focus:ring-orange-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block dark:text-gray-300 light:text-[#6B7280] font-medium">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 dark:bg-transparent light:bg-[#F3F4F6] dark:text-gray-300 light:text-[#1F2937] dark:border-gray-50 light:border-[#D1D5DB] border rounded-lg dark:focus:outline-none light:focus:outline-none dark:focus:ring-2 light:focus:ring-2 dark:focus:ring-orange-500 light:focus:ring-orange-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition duration-300"
          >
            Login
          </button>
          <div className="dark:text-gray-700 light:text-[#6B7280]">
            Don't have an account?{" "}
            <a href="/SignUp" className="text-orange-500 hover:underline">
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
