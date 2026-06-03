"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "../Components/ui/Product_Card";
import { axiosInstance } from "../utils/api";

const wishlistKey = "wishlist_items";

const readWishlistIds = () => {
  if (typeof window === "undefined") return [] as number[];
  const raw = localStorage.getItem(wishlistKey);
  return raw ? (JSON.parse(raw) as number[]) : [];
};

const WishlistPage = () => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = () => {
      setWishlistIds(readWishlistIds());
    };

    loadWishlist();
    const handler = () => loadWishlist();
    window.addEventListener("wishlist:updated", handler);
    return () => window.removeEventListener("wishlist:updated", handler);
  }, []);

  const wishlistIdSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get("/product/all");
        const allProducts = response.data || [];
        const filtered = allProducts.filter((product: any) => wishlistIdSet.has(product.id));
        setProducts(filtered);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds, wishlistIdSet]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white light:text-[#1F2937]">Your Wishlist</h1>
          <p className="dark:text-gray-400 light:text-[#6B7280]">Save your favorites and come back anytime.</p>
        </div>
        <Link
          href="/"
          className="text-sm dark:text-white light:text-[#1F2937] dark:border-white light:border-[#D1D5DB] border rounded-lg px-4 py-2 dark:hover:bg-white dark:hover:text-black light:hover:bg-[#F3F4F6] light:hover:text-[#1F2937] transition"
        >
          Continue shopping
        </Link>
      </div>

      {loading ? (
        <div className="dark:text-gray-300 light:text-[#6B7280]">Loading wishlist...</div>
      ) : wishlistIds.length === 0 ? (
        <div className="dark:text-gray-300 light:text-[#6B7280]">Your wishlist is empty.</div>
      ) : products.length === 0 ? (
        <div className="dark:text-gray-300 light:text-[#6B7280]">No wishlist items found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {products.map((product) => (
            <div key={product.id} className="flex justify-center">
              <ProductCard
                img={product.img}
                title={product.title}
                desc={product.description}
                rating={product.rating}
                price={product.price}
                oldPrice={product.oldPrice}
                id={product.id}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
