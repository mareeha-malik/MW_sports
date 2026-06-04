"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Hero from "./Components/ui/Hero";
import Products from "./Components/ui/Products";
import Testimonial from "./Components/ui/Testimonial";
import Mob_Nav from "./Components/ui/Mob_Nav";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsAdmin(role === "admin");
  }, []);

  if (isAdmin) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="rounded-2xl dark:border-orange-500/30 light:border-orange-200 border dark:bg-gradient-to-r dark:from-[#111] dark:to-[#1b0d05] light:bg-gradient-to-r light:from-orange-50 light:to-orange-100 p-10 text-center">
          <p className="dark:text-orange-400 light:text-orange-600 uppercase tracking-[4px] text-xs">Admin Mode</p>
          <h1 className="text-3xl md:text-4xl font-semibold dark:text-white light:text-[#1F2937] mt-3">
            Welcome back, Admin
          </h1>
          <p className="dark:text-gray-300 light:text-[#6B7280] mt-3">
            The customer homepage is hidden for admin accounts. Use the dashboard to manage products and users.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/admin"
              className="bg-BrightOrange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isAdmin === null) {
    return <main className="min-h-screen" />;
  }

  return (
    <main className="dark:bg-BgWalaBlack light:bg-[#F9FAFB]">
      <Hero />
      <Products />
      {/* <Testimonial /> */}
      <Mob_Nav />
    </main>
  );
}
