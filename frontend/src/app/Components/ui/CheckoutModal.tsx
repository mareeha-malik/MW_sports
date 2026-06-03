"use client";
import { useState } from "react";
import { axiosInstance } from "../../utils/api";
import { getGuestCartItems, clearGuestCart } from "../../utils/cart";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  total: number;
  isAuth: boolean;
  onOrderSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  isAuth,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [formData, setFormData] = useState(() => {
    // Try to load pre-filled data from localStorage
    const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    return {
      firstName: "",
      lastName: "",
      email: email || "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      paymentMethod: "card",
    };
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.postalCode}`;
      
      // Get user ID
      let userId = null;
      if (isAuth) {
        const userIdStr = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        userId = userIdStr ? parseInt(userIdStr) : null;
      }

      // Format order items
      const orderItems = items.map((item) => ({
        productId: item.product?.id || item.id,
        quantity: item.quantity,
        price: item.product?.price || item.price,
      }));

      // Create order
      const response = await axiosInstance.post("/order", {
        userId: userId || null,
        items: orderItems,
        totalAmount: total,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      setOrderNumber(response.data.orderNumber);

      // Clear cart
      if (isAuth) {
        await axiosInstance.delete("/cart");
      } else {
        clearGuestCart();
      }

      setStep(3);
      setTimeout(() => {
        onOrderSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 dark:bg-black/50 light:bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="dark:bg-HeaderWalaBlack light:bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-700 light:border-[#E5E7EB] border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold dark:text-white light:text-[#1F2937]">
            {step === 1 && "Shipping Address"}
            {step === 2 && "Order Summary"}
            {step === 3 && "Order Confirmed"}
          </h2>
          {step < 3 && (
            <button
              onClick={onClose}
              className="dark:text-gray-400 light:text-[#6B7280] dark:hover:text-white light:hover:text-[#1F2937]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
            />

            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="dark:bg-black/30 light:bg-[#F3F4F6] dark:border-gray-700 light:border-[#E5E7EB] border rounded-lg px-4 py-2 dark:text-white light:text-[#1F2937] dark:placeholder-gray-500 light:placeholder-[#9CA3AF] focus:outline-none focus:border-BrightOrange"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-BrightOrange text-white py-3 rounded-lg hover:bg-orange-600 transition mt-6"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Order Summary & Payment */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Shipping To:</h3>
              <p className="text-gray-300 text-sm">
                {formData.firstName} {formData.lastName}
                <br />
                {formData.address}
                <br />
                {formData.city}, {formData.postalCode}
                <br />
                {formData.email}
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Order Items:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-300">
                    <span>
                      {item.product?.title || "Product"} × {item.quantity}
                    </span>
                    <span>
                      Rs {(item.product?.price || item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-white text-sm font-semibold">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-BrightOrange"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="cod">Cash on Delivery</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-white text-lg font-semibold mb-4">
                <span>Total Amount:</span>
                <span>Rs {total}</span>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-BrightOrange text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Order Confirmation */}
        {step === 3 && (
          <div className="p-6 text-center space-y-6">
            <div className="text-6xl">✓</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">Order Placed!</h3>
              <p className="text-gray-400">Thank you for your order.</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-400 text-sm">Order Number</p>
              <p className="text-white text-lg font-semibold">{orderNumber}</p>
            </div>
            <p className="text-gray-400 text-sm">
              A confirmation email has been sent to {formData.email}
            </p>
            <p className="text-gray-500 text-xs">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
