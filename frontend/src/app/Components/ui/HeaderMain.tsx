'use client';
import React, { useEffect, useState } from 'react';
import { Search, Heart, ShoppingBag, LogOut, Menu, X, Bell, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { axiosInstance } from '../../utils/api';
import { getGuestCartItems } from '../../utils/cart';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import ThemeToggle from './ThemeToggle';

const HeaderMain = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: number | null;
    displayOrder: number;
    children?: Category[];
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/category');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      buildTree(data);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const buildTree = (cats: Category[]) => {
    const parentMap = new Map<number | undefined, Category[]>();
    cats.forEach((cat) => {
      const parent = cat.parentId || undefined;
      if (!parentMap.has(parent)) {
        parentMap.set(parent, []);
      }
      parentMap.get(parent)!.push(cat);
    });

    const buildNode = (cat: Category): Category => {
      const children = parentMap.get(cat.id);
      return { ...cat, children: children?.map(buildNode) };
    };

    return cats.filter((c) => !c.parentId).map(buildNode);
  };

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentId).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      return;
    }

    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error('Error decoding token', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadCartCount = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axiosInstance.get('/cart');
          const count = (response.data || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(count);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        const items = getGuestCartItems();
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    };

    loadCartCount();
    const handler = () => loadCartCount();
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
  }, []);

  useEffect(() => {
    const loadWishlistCount = () => {
      const raw = localStorage.getItem('wishlist_items');
      const items = raw ? (JSON.parse(raw) as number[]) : [];
      setWishlistCount(items.length);
    };

    loadWishlistCount();
    const handler = () => loadWishlistCount();
    window.addEventListener('wishlist:updated', handler);
    return () => window.removeEventListener('wishlist:updated', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      document.cookie = 'access_token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'role=; path=/; max-age=0; samesite=lax';
      document.cookie = 'username=; path=/; max-age=0; samesite=lax';
      setUsername(null);
      window.location.href = '/';
    }
  };

  return (
    <div className="sticky top-0 z-50 dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-800 light:border-[#E5E7EB] border-b shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dugqqxf20/image/upload/v1780647207/Logo_ytxswr.svg"
                alt="Logo"
                width={50}
                height={50}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-orange-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-black text-lg sm:text-xl italic tracking-wide">
                MW
              </span>
              <span className="text-orange-500 font-bold text-xs tracking-widest">
                SPORTS
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 mx-4 lg:mx-6">
            <div className="w-full relative group">
              <input
                className="w-full dark:bg-BgWalaBlack light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] rounded-full px-5 py-3 pl-5 pr-12 dark:text-gray-300 light:text-[#1F2937] dark:placeholder-gray-600 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange focus:ring-2 focus:ring-BrightOrange/20 transition-all duration-300"
                type="text"
                placeholder="Search products..."
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-gray-500 light:text-[#6B7280] w-5 h-5 pointer-events-none group-focus-within:text-BrightOrange transition-colors" />
            </div>
          </div>

          {/* Desktop Icons and Auth */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Wishlist */}
            <Link
              href="/Wishlist"
              className="relative dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors duration-300 hover:scale-110 transform"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 stroke-2" />
              {wishlistCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-5 h-5 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {wishlistCount}
                </div>
              )}
            </Link>

            {/* Notifications */}
            {username && (
              <NotificationBell onClick={() => setNotificationPanelOpen(!notificationPanelOpen)} />
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <Link
              href="/Cart"
              className="relative dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors duration-300 hover:scale-110 transform"
            >
              <ShoppingBag className="w-6 h-6 stroke-2" />
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-5 h-5 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {cartCount}
                </div>
              )}
            </Link>

            {/* Auth Section */}
            {username ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-BrightOrange flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {getInitials(username)}
                </div>

                {/* Orders Button */}
                <Link href="/orders">
                  <button className="px-4 py-2 rounded-lg dark:bg-BgWalaBlack light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] dark:text-gray-300 light:text-[#1F2937] text-sm font-medium dark:hover:border-BrightOrange light:hover:border-BrightOrange dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-all duration-300">
                    Orders
                  </button>
                </Link>

                {/* Settings Button */}
                <Link href="/settings">
                  <button className="p-2 text-gray-400 hover:text-BrightOrange transition-colors duration-300" title="Settings">
                    <Settings className="w-5 h-5 stroke-2" />
                  </button>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-BrightOrange transition-colors duration-300"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 stroke-2" />
                </button>
              </div>
            ) : (
              <Link href="/LoginPage">
                <button className="px-6 py-2 rounded-lg border-2 border-BrightOrange text-BrightOrange font-semibold text-sm hover:bg-BrightOrange hover:text-white transition-all duration-300">
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            {/* Mobile Cart Badge */}
            <Link href="/Cart" className="relative dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors">
              <ShoppingBag className="w-6 h-6 stroke-2" />
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-4 h-4 text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-2" />
              ) : (
                <Menu className="w-6 h-6 stroke-2" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 dark:bg-BgWalaBlack light:bg-[#F9FAFB] dark:border-gray-800 light:border-[#E5E7EB] border-t max-h-[80vh] overflow-y-auto">
            {/* Search Bar Mobile */}
            <div className="mb-4 p-3">
              <div className="w-full relative">
                <input
                  className="w-full dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-700 light:border-[#E5E7EB] border rounded-full px-5 py-3 pl-5 pr-12 dark:text-gray-300 light:text-[#1F2937] dark:placeholder-gray-600 light:placeholder-[#9CA3AF] focus:outline-none dark:focus:border-BrightOrange light:focus:border-BrightOrange text-sm transition-all"
                  type="text"
                  placeholder="Search..."
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 dark:text-gray-500 light:text-[#6B7280] w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1 mb-4">
              <Link
                href="/"
                className="block px-6 py-3 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange dark:hover:bg-HeaderWalaBlack light:hover:bg-[#F3F4F6] transition-all"
              >
                Home
              </Link>

              {/* Dynamic Categories */}
              {!categoriesLoading && getParentCategories().length > 0 ? (
                getParentCategories().map((cat) => (
                  <div key={cat.id}>
                    {cat.children && cat.children.length > 0 ? (
                      <>
                        <button
                          onClick={() =>
                            setExpandedCategoryId(
                              expandedCategoryId === cat.id ? null : cat.id
                            )
                          }
                          className="w-full text-left px-6 py-3 text-gray-400 hover:text-BrightOrange hover:bg-HeaderWalaBlack transition-all flex items-center justify-between group"
                        >
                          <span>{cat.name}</span>
                          <ChevronDown 
                            size={18}
                            className={`transition-transform duration-300 ${expandedCategoryId === cat.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {expandedCategoryId === cat.id && (
                          <div className="bg-[#0a0a0a] border-l-2 border-BrightOrange animate-in slide-in-from-top duration-200">
                            {cat.children.map((subCat, index) => (
                              <Link
                                key={subCat.id}
                                href={`/category/${subCat.slug}`}
                                className={`block px-12 py-3 text-gray-500 hover:text-BrightOrange hover:bg-HeaderWalaBlack transition-all text-sm ${
                                  index !== cat.children!.length - 1 ? 'border-b border-gray-700/20' : ''
                                }`}
                              >
                                {subCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={`/category/${cat.slug}`}
                        className="block px-6 py-3 text-gray-400 hover:text-BrightOrange hover:bg-HeaderWalaBlack transition-all"
                      >
                        {cat.name}
                      </Link>
                    )}
                  </div>
                ))
              ) : !categoriesLoading ? null : (
                <div className="px-6 py-3 text-gray-500 text-sm">Loading categories...</div>
              )}

              <Link
                href="/AboutUs"
                className="block px-6 py-3 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange dark:hover:bg-HeaderWalaBlack light:hover:bg-[#F3F4F6] transition-all"
              >
                About Us
              </Link>
            </div>

            {/* Mobile Auth Section */}
            <div className="dark:border-gray-800 light:border-[#E5E7EB] border-t dark:pt-4 light:pt-4 px-3 space-y-2">
              {username ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-BrightOrange flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(username)}
                    </div>
                    <span className="text-gray-300 font-medium text-sm">{username}</span>
                  </div>
                  <Link href="/orders" className="block">
                    <button className="w-full px-4 py-2 rounded-lg bg-HeaderWalaBlack border border-gray-700 text-gray-400 text-sm font-medium hover:border-BrightOrange hover:text-BrightOrange transition-all">
                      Orders
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 rounded-lg border border-gray-700 text-gray-400 text-sm font-medium hover:border-BrightOrange hover:text-BrightOrange transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/LoginPage" className="block">
                  <button className="w-full px-4 py-2 rounded-lg bg-BrightOrange text-white font-semibold text-sm hover:opacity-90 transition-all">
                    Login
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Icons */}
            <div className="border-t border-gray-800 mt-4 pt-4 px-3 flex justify-around">
              <Link href="/Wishlist" className="flex flex-col items-center gap-1">
                <div className="relative">
                  <Heart className="w-6 h-6 stroke-2 text-gray-400 hover:text-BrightOrange transition-colors" />
                  {wishlistCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-4 h-4 text-white text-xs font-bold flex items-center justify-center">
                      {wishlistCount}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">Wishlist</span>
              </Link>
              <Link href="/Notifications" className="flex flex-col items-center gap-1">
                <Bell className="w-6 h-6 stroke-2 text-gray-400 hover:text-BrightOrange transition-colors" />
                <span className="text-xs text-gray-500">Notifications</span>
              </Link>
            </div>
          </div>
        )}

        {/* Notification Panel */}
        <NotificationPanel isOpen={notificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
      </div>
    </div>
  );
};

export default HeaderMain;
