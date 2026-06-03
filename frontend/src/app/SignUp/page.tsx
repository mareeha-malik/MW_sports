"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../utils/api";
import { useToast } from "../Components/ui/ToastContext";

const SignUpPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { showToast } = useToast();

    const handleSignUp = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        try {
            await axiosInstance.post("/auth/signup", { username, email, password });
            showToast("Signup successful! Please log in.", "success");
            router.push("/LoginPage");
        } catch (error) {
            console.error("Error signing up:", error);
            showToast("Unable to sign up. Please try again.", "error");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen dark:bg-black light:bg-[#F9FAFB]">
            <div className="dark:bg-transparent dark:border dark:border-gray-50 light:bg-white light:border light:border-[#D1D5DB] shadow-2xl rounded-lg p-8 max-w-md w-full space-y-6">
                <h2 className="text-3xl font-extrabold text-center dark:text-white light:text-[#1F2937]">Sign Up for MW Sports</h2>
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block dark:text-gray-300 light:text-[#6B7280] font-medium">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full p-3 dark:bg-transparent light:bg-[#F3F4F6] dark:text-gray-300 light:text-[#1F2937] dark:border-gray-50 light:border-[#D1D5DB] border rounded-lg dark:focus:outline-none light:focus:outline-none dark:focus:ring-2 light:focus:ring-2 dark:focus:ring-orange-500 light:focus:ring-orange-500"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
