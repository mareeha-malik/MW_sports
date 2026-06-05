"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaRegHeart,
  FaHeart,
  FaStar,
  FaRegStar,
  FaShoppingCart,
  FaCheck,
} from "react-icons/fa";
import { axiosInstance } from "../../utils/api";
import { addGuestCartItem } from "../../utils/cart";

interface PropsType {
  id: number;
  img?: string | null;
  title: string;
  desc: string;
  rating: number;
  price: number | string;
  oldPrice?: number | string;
  isFavorite?: boolean;
  badge?: string; // e.g. "NEW", "HOT", "SALE"
  category?: string | { name?: string };
}

const ProductCard: React.FC<PropsType> = ({
  id,
  img,
  title,
  desc,
  rating,
  price,
  oldPrice,
  isFavorite,
  badge,
  category,
}) => {
  const [isLiked, setIsLiked] = useState(isFavorite ?? false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wishlistKey = "wishlist_items";

  const readWishlist = () => {
    if (typeof window === "undefined") return [] as number[];
    const raw = localStorage.getItem(wishlistKey);
    return raw ? (JSON.parse(raw) as number[]) : [];
  };

  const writeWishlist = (ids: number[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(wishlistKey, JSON.stringify(ids));
  };

  useEffect(() => {
    if (isFavorite !== undefined) return;
    const ids = readWishlist();
    setIsLiked(ids.includes(id));
  }, [id, isFavorite]);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isLiked;
    const ids = readWishlist();
    const updated = next
      ? Array.from(new Set([...ids, id]))
      : ids.filter((itemId) => itemId !== id);
    writeWishlist(updated);
    setIsLiked(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("wishlist:updated"));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    try {
      if (token) {
        await axiosInstance.post("/cart/add", { productId: id, quantity: 1 });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart:updated"));
        }
      } else {
        addGuestCartItem(id, 1);
      }

      setShowAdded(true);
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
      addedTimeoutRef.current = setTimeout(() => setShowAdded(false), 1500);
    } catch (error) {
      console.error("Failed to add item to cart", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toNumber = (value: number | string | undefined) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const priceNum = toNumber(price);
  const oldPriceNum = toNumber(oldPrice) ?? (priceNum !== null ? priceNum + 50 : null);
  const displayPrice = priceNum !== null ? priceNum.toFixed(0) : String(price);

  return (
    <Link
      href={`/product/${id}`}
      className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl
        border dark:border-[#222] light:border-[#E5E7EB] dark:bg-[#111] light:bg-white transition-all duration-300
        hover:-translate-y-1 dark:hover:border-orange-500 light:hover:border-orange-500
        dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgb(249,115,22)] light:hover:shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_0_1px_rgb(249,115,22)]"
    >
      {/* Image area */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0d0d0d] light:bg-gradient-to-br light:from-[#F3F4F6] light:to-[#E5E7EB] sm:h-40 lg:h-48">

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-12 dark:bg-gradient-to-t dark:from-[#111] light:bg-gradient-to-t light:from-white light:to-white/0 dark:to-transparent z-10 pointer-events-none" />

        {/* Badge */}
        {badge && (
          <span className="absolute left-3 top-3 z-20 rounded-[4px] bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1.5px] text-white">
            {badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={toggleLike}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full
            border border-[#333] bg-black/70 text-sm text-orange-500 transition hover:bg-orange-500/10"
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* Product image */}
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none"
          />
        ) : (
          <div className="text-xs text-[#444] tracking-widest uppercase">No Image</div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3">

        {/* Category label */}
        {category && (
          <p className="text-[7px] font-semibold uppercase tracking-[1.5px] text-orange-500 sm:text-[8px]">
            {typeof category === 'string' ? category : category.name}
          </p>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-[12px] font-semibold leading-tight text-white sm:text-[13px] lg:text-[14px]">
          {title}
        </h3>

        {/* Divider */}
        <div
          className="my-0.5 h-px opacity-30"
          style={{
            background: "linear-gradient(to right, transparent, #F97316, transparent)",
          }}
        />

        {/* Description
        <p className="text-[9px] text-[#666] leading-relaxed line-clamp-1">
          {desc || "No description available."}
        </p> */}

        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) =>
            i < Math.floor(Number(rating) || 0)
              ? <FaStar key={i} className="text-[9px] text-orange-500" />
              : <FaRegStar key={i} className="text-[9px] text-[#333]" />
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[12px] font-semibold text-white sm:text-[13px] lg:text-[14px]">
              Rs {displayPrice}
            </span>
            {oldPriceNum !== null && (
              <span className="text-[8px] text-[#444] line-through sm:text-[9px]">
                Rs {oldPriceNum}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold tracking-[0.5px] text-white transition-all duration-150 active:scale-95 sm:h-8 sm:w-8
              ${showAdded ? "bg-orange-500 hover:bg-orange-600" : "bg-orange-500 hover:bg-orange-600"}
              ${isAddingToCart ? "opacity-80 cursor-wait" : ""}`}
          >
            {showAdded ? <FaCheck /> : <FaShoppingCart />}
          </button>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;