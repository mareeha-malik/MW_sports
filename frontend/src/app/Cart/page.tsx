"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../utils/api";
import { useToast } from "../Components/ui/ToastContext";
import {
  getGuestCartItems,
  removeGuestCartItem,
  updateGuestCartItem,
} from "../utils/cart";
import CheckoutModal from "../Components/ui/CheckoutModal";

interface Product {
  id: number;
  title: string;
  price: number;
  img: string;
}

interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
}

const CartPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuth(Boolean(token));
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const response = await axiosInstance.get("/cart");
          setItems(response.data || []);
        } else {
          const guestItems = getGuestCartItems();
          if (!guestItems.length) {
            setItems([]);
            setLoading(false);
            return;
          }
          const productsResponse = await axiosInstance.get("/product/all");
          const products: Product[] = productsResponse.data || [];
          const merged = guestItems
            .map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return product
                ? { product, quantity: item.quantity }
                : null;
            })
            .filter(Boolean) as CartItem[];
          setItems(merged);
        }
      } catch (error) {
        console.error("Failed to load cart", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
    const handler = () => loadCart();
    window.addEventListener("cart:updated", handler);
    return () => window.removeEventListener("cart:updated", handler);
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    if (quantity < 1) return;
    if (isAuth && item.id) {
      const response = await axiosInstance.put(`/cart/item/${item.id}`, { quantity });
      setItems((prev) => prev.map((i) => (i.id === item.id ? response.data : i)));
      return;
    }

    updateGuestCartItem(item.product.id, quantity);
    setItems((prev) => prev.map((i) => (i.product.id === item.product.id ? { ...i, quantity } : i)));
  };

  const handleRemove = async (item: CartItem) => {
    if (isAuth && item.id) {
      await axiosInstance.delete(`/cart/item/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      return;
    }

    removeGuestCartItem(item.product.id);
    setItems((prev) => prev.filter((i) => i.product.id !== item.product.id));
  };

  if (loading) {
    return <div className="container py-12 dark:text-white light:text-[#1F2937]">Loading cart...</div>;
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-6 dark:text-white light:text-[#1F2937]">Your Cart</h1>
          {!items.length ? (
            <p className="dark:text-gray-400 light:text-[#6B7280]">Your cart is empty.</p>
          ) : (
            <div className="space-y-3 md:space-y-6">
              {items.map((item) => (
                <>
                  <div key={item.id ?? item.product.id} className="md:hidden rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm dark:border-[#222] dark:bg-[#111]">
                    <div className="flex items-start gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] dark:bg-black/20">
                        {item.product.img ? (
                          <img
                            src={item.product.img}
                            alt={item.product.title}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500 dark:text-gray-300">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold text-[#1F2937] dark:text-white">
                          {item.product.title}
                        </h2>
                        <p className="mt-1 text-xs text-[#6B7280] dark:text-gray-400">Rs {item.product.price}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D1D5DB] text-[#1F2937] transition hover:bg-[#F3F4F6] dark:border-[#333] dark:text-white dark:hover:bg-[#1a1a1a]"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="min-w-4 text-center text-sm font-medium text-[#1F2937] dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#D1D5DB] text-[#1F2937] transition hover:bg-[#F3F4F6] dark:border-[#333] dark:text-white dark:hover:bg-[#1a1a1a]"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          >
                            +
                          </button>

                          <div className="ml-auto text-right">
                            <p className="text-xs font-semibold text-[#1F2937] dark:text-white">Rs {item.product.price * item.quantity}</p>
                            <button
                              className="mt-1 text-[11px] font-medium text-red-500 hover:text-red-400"
                              onClick={() => handleRemove(item)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div key={`${item.id ?? item.product.id}-desktop`} className="hidden flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 dark:border-[#333] dark:bg-HeaderWalaBlack md:flex md:flex-row">
                    <div className="h-32 w-full overflow-hidden rounded-lg dark:bg-black/20 light:bg-[#F3F4F6] md:w-32">
                      {item.product.img ? (
                        <img
                          src={item.product.img}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-300 light:text-gray-600 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 light:bg-gradient-to-br light:from-gray-200 light:to-gray-100">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-medium dark:text-white light:text-[#1F2937]">{item.product.title}</h2>
                      <p className="dark:text-gray-400 light:text-[#6B7280]">Rs {item.product.price}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          className="rounded border px-3 py-1 dark:border-gray-600 dark:text-white light:border-[#D1D5DB] light:text-[#1F2937] dark:hover:bg-[#222] light:hover:bg-[#F3F4F6]"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="dark:text-white light:text-[#1F2937]">{item.quantity}</span>
                        <button
                          className="rounded border px-3 py-1 dark:border-gray-600 dark:text-white light:border-[#D1D5DB] light:text-[#1F2937] dark:hover:bg-[#222] light:hover:bg-[#F3F4F6]"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-between md:items-end">
                      <span className="font-semibold dark:text-white light:text-[#1F2937]">Rs {item.product.price * item.quantity}</span>
                      <button
                        className="mt-2 text-red-400 hover:text-red-300"
                        onClick={() => handleRemove(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 dark:bg-HeaderWalaBlack light:bg-white dark:rounded-xl light:rounded-xl p-6 h-fit dark:border dark:border-[#333] light:border light:border-[#E5E7EB]">
          <h2 className="text-xl font-semibold mb-4 dark:text-white light:text-[#1F2937]">Order Summary</h2>
          <div className="flex justify-between dark:text-gray-400 light:text-[#6B7280]">
            <span>Subtotal</span>
            <span>Rs {total}</span>
          </div>
          <div className="flex justify-between dark:text-gray-400 light:text-[#6B7280] mt-2">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="dark:border-gray-700 light:border-[#E5E7EB] border-t my-4"></div>
          <div className="flex justify-between dark:text-white light:text-[#1F2937] text-lg font-semibold">
            <span>Total</span>
            <span>Rs {total}</span>
          </div>
          <button
            onClick={() => {
              if (!items.length) {
                showToast("Your cart is empty", "warning");
                return;
              }
              setShowCheckout(true);
            }}
            className="w-full bg-BrightOrange text-white py-3 rounded-lg mt-6 hover:bg-orange-600 transition disabled:opacity-50"
            disabled={!items.length}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={items}
        total={total}
        isAuth={isAuth}
        onOrderSuccess={() => {
          setShowCheckout(false);
          setItems([]);
          setTimeout(() => router.push("/"), 2000);
        }}
      />
    </div>
  );
};

export default CartPage;
