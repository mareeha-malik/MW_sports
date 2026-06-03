'use client';

import React, { useEffect, useState } from 'react';
import { Home, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { axiosInstance } from '../../utils/api';
import { getGuestCartItems } from '../../utils/cart';

const Mob_Nav = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-800 light:border-[#E5E7EB] border-t backdrop-blur-xl shadow-2xl z-40">
      <div className="flex justify-around items-center py-3 px-4 max-w-[500px] mx-auto w-full">
        {/* Home */}
        <Link href="/" className="flex flex-col items-center gap-1 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors duration-300">
          <Home className="w-6 h-6 stroke-2" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Wishlist */}
        <Link href="/Wishlist" className="relative flex flex-col items-center gap-1 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors duration-300">
          <div className="relative">
            <Heart className="w-6 h-6 stroke-2" />
            {wishlistCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-4 h-4 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {wishlistCount}
              </div>
            )}
          </div>
          <span className="text-xs font-medium">Saved</span>
        </Link>

        {/* Cart */}
        <Link href="/Cart" className="relative flex flex-col items-center gap-1 dark:text-gray-400 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors duration-300">
          <div className="relative">
            <ShoppingBag className="w-6 h-6 stroke-2" />
            {cartCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-BrightOrange rounded-full w-4 h-4 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {cartCount}
              </div>
            )}
          </div>
          <span className="text-xs font-medium">Cart</span>
        </Link>
      </div>
    </div>
  );
};

export default Mob_Nav;
