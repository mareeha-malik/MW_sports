import { axiosInstance } from './api';

type GuestCartItem = {
  productId: number;
  quantity: number;
};

const CART_KEY = 'guest_cart_items';

const notifyCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart:updated'));
  }
};

export const getGuestCartItems = (): GuestCartItem[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const setGuestCartItems = (items: GuestCartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notifyCartUpdate();
};

export const addGuestCartItem = (productId: number, quantity = 1) => {
  const items = getGuestCartItems();
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  setGuestCartItems(items);
};

export const updateGuestCartItem = (productId: number, quantity: number) => {
  const items = getGuestCartItems().map((item) =>
    item.productId === productId ? { ...item, quantity } : item,
  );
  setGuestCartItems(items);
};

export const removeGuestCartItem = (productId: number) => {
  const items = getGuestCartItems().filter((item) => item.productId !== productId);
  setGuestCartItems(items);
};

export const clearGuestCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
  notifyCartUpdate();
};

export const mergeGuestCart = async () => {
  const items = getGuestCartItems();
  if (!items.length) return;

  try {
    await axiosInstance.post('/cart/merge', { items });
    clearGuestCart();
  } catch (error) {
    console.error('Failed to merge guest cart:', error);
  }
};
