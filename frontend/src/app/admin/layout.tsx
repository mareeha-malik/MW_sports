"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { SessionTimeoutModal } from "./components/SessionTimeoutModal";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Layers,
  Boxes,
  Star,
  Zap,
  BarChart3,
  Settings,
  Menu,
  Bell,
  LogOut,
  ChevronLeft,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../Components/ui/ThemeProvider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: <LayoutDashboard size={18} /> },
  { label: "Products",   href: "/admin/products",   icon: <Package size={18} /> },
  { label: "Orders",     href: "/admin/orders",     icon: <ShoppingCart size={18} /> },
  { label: "Customers",  href: "/admin/customers",  icon: <Users size={18} /> },
  { label: "Categories", href: "/admin/categories", icon: <Layers size={18} /> },
  { label: "Inventory",  href: "/admin/inventory",  icon: <Boxes size={18} /> },
  { label: "Reviews",    href: "/admin/reviews",    icon: <Star size={18} /> },
  { label: "Promotions", href: "/admin/promotions", icon: <Zap size={18} /> },
  { label: "Reports",    href: "/admin/reports",    icon: <BarChart3 size={18} /> },
  { label: "Settings",   href: "/admin/settings",   icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername]     = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";
      router.push("/admin/login");
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen dark:bg-[#0a0a0a] light:bg-[#F9FAFB] dark:text-white light:text-[#1F2937] overflow-hidden">
      <SessionTimeoutModal onLogout={handleLogout} />

      {/* ── Desktop Sidebar ── */}
      <aside
        style={{ width: collapsed ? "68px" : "240px" }}
        className="hidden lg:flex flex-col relative z-30 dark:bg-[#111] light:bg-white dark:border-white/10 light:border-[#E5E7EB] border-r transition-[width] duration-300 ease-in-out shrink-0 overflow-visible"
      >
        {/* ── Logo Section ── */}
        <div className="flex items-center gap-3 px-4 py-5 dark:border-white/10 light:border-[#E5E7EB] border-b shrink-0 overflow-hidden">
          <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0">
            MW
          </div>
          <span
            className="font-semibold dark:text-white light:text-[#1F2937] text-sm tracking-wide whitespace-nowrap transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1 }}
          >
            MW Sports
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  group relative flex items-center gap-3 rounded-lg transition-all duration-150
                  ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                  ${active
                    ? "bg-[#F97316] text-white"
                    : "dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937]"}
                `}
              >
                <span className="shrink-0">{item.icon}</span>

                {/* Label — hidden via width+opacity so it never pushes layout */}
                <span
                  className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200"
                  style={{
                    maxWidth: collapsed ? "0px" : "200px",
                    opacity: collapsed ? 0 : 1,
                  }}
                >
                  {item.label}
                </span>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="
                    pointer-events-none absolute left-full ml-3 z-50
                    dark:bg-[#1e1e1e] light:bg-[#F3F4F6] dark:text-white light:text-[#1F2937] text-xs font-medium
                    px-2.5 py-1.5 rounded-md shadow-xl dark:border-white/10 light:border-[#E5E7EB] border
                    opacity-0 group-hover:opacity-100
                    translate-x-1 group-hover:translate-x-0
                    transition-all duration-150 whitespace-nowrap
                  ">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="dark:border-white/10 light:border-[#E5E7EB] border-t dark:px-3 light:px-3 py-4 flex items-center gap-3 shrink-0 overflow-hidden"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {username.charAt(0).toUpperCase() || "A"}
          </div>
          <div
            className="flex-1 min-w-0 transition-all duration-200 overflow-hidden"
            style={{ maxWidth: collapsed ? "0px" : "200px", opacity: collapsed ? 0 : 1 }}
          >
            <p className="text-sm font-medium dark:text-white light:text-[#1F2937] truncate">{username || "Admin"}</p>
            <p className="text-xs dark:text-gray-500 light:text-[#6B7280]">Administrator</p>
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-red-400 light:hover:text-red-600 transition shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        {/* Collapse toggle on the edge */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full dark:bg-[#1e1e1e] light:bg-[#F3F4F6] dark:border-white/10 light:border-[#E5E7EB] border flex items-center justify-center dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937] dark:hover:bg-[#2a2a2a] light:hover:bg-[#E5E7EB] transition-all duration-150 shadow-md z-50"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={13}
            className="transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </aside>

      {/* ── Mobile Drawer ── */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-60 z-50 lg:hidden dark:bg-[#111] light:bg-white dark:border-white/10 light:border-[#E5E7EB] border-r flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 bg-[#F97316] rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0">
            MW
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">MW Sports</span>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  active
                    ? "bg-[#F97316] text-white"
                    : "dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937] dark:hover:bg-white/5 light:hover:bg-[#F3F4F6]"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="dark:border-white/10 light:border-[#E5E7EB] border-t dark:px-3 light:px-3 py-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {username.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium dark:text-white light:text-[#1F2937] truncate">{username || "Admin"}</p>
            <p className="text-xs dark:text-gray-500 light:text-[#6B7280]">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-red-400 light:hover:text-red-600 transition shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="dark:bg-[#111] light:bg-white dark:border-white/10 light:border-[#E5E7EB] border-b px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937] transition"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search..."
              className="w-full dark:bg-[#1a1a1a] light:bg-[#F3F4F6] dark:border-white/10 light:border-[#E5E7EB] border rounded-lg px-4 py-2 text-sm dark:text-gray-300 light:text-[#1F2937] dark:placeholder-gray-600 light:placeholder-[#6B7280] dark:focus:border-[#F97316] light:focus:border-[#F97316] focus:outline-none transition"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937] transition">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#F97316] rounded-full" />
            </button>
            
            {/* Theme Toggle */}
            {isClient && mounted && (
              <button
                onClick={toggleTheme}
                className="dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937] transition p-1.5 dark:hover:bg-white/5 light:hover:bg-[#F3F4F6] rounded-lg"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-slate-700" />
                )}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-red-400 light:hover:text-red-600 transition text-sm"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto dark:bg-[#0a0a0a] light:bg-[#F9FAFB]">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}