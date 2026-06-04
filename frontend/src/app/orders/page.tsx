"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import Link from "next/link";
import { useTheme } from "../Components/ui/ThemeProvider";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  RotateCcw,
  Lock,
  Loader,
  ShoppingBag,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  product?: {
    title: string;
    img: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  fulfillmentStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  items: OrderItem[];
}

type SortOption = "recent" | "oldest" | "highest" | "lowest";
type StatusFilter = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export default function OrdersPage() {
  const { theme, mounted } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const isLight = mounted && theme === "light";

  const shellClass = isLight
    ? "bg-white border border-[#E5E7EB] shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
    : "bg-HeaderWalaBlack border border-gray-700 shadow-xl shadow-black/10";

  const controlClass = isLight
    ? "w-full bg-[#F8FAFC] border border-[#D1D5DB] rounded-xl px-3 py-2 text-sm text-[#1F2937] placeholder-[#94A3B8] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 focus:outline-none transition"
    : "w-full bg-black/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 focus:outline-none transition";

  const mutedTextClass = isLight ? "text-[#6B7280]" : "text-gray-400";
  const bodyTextClass = isLight ? "text-[#1F2937]" : "text-white";
  const subtlePanelClass = isLight ? "bg-[#F8FAFC]" : "bg-black/30";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuth(Boolean(token));
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuth) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/order");
        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuth]);

  useEffect(() => {
    let result = [...orders];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((order) => order.fulfillmentStatus === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "highest":
        result.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount));
        break;
      case "lowest":
        result.sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount));
        break;
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, sortBy, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (isLight) {
      switch (status) {
        case "pending":
          return "bg-yellow-50 text-yellow-800 border border-yellow-200";
        case "confirmed":
          return "bg-blue-50 text-blue-700 border border-blue-200";
        case "shipped":
          return "bg-violet-50 text-violet-700 border border-violet-200";
        case "delivered":
          return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "cancelled":
          return "bg-red-50 text-red-700 border border-red-200";
        default:
          return "bg-slate-100 text-slate-700 border border-slate-200";
      }
    }

    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50";
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/50";
      case "shipped":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/50";
      case "delivered":
        return "bg-green-500/20 text-green-300 border border-green-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    if (isLight) {
      if (status === "paid" || status === "completed") {
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      }
      if (status === "pending") {
        return "bg-amber-50 text-amber-800 border border-amber-200";
      }
      return "bg-slate-100 text-slate-700 border border-slate-200";
    }

    if (status === "paid" || status === "completed") {
      return "bg-green-500/20 text-green-300 border border-green-500/50";
    }
    if (status === "pending") {
      return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50";
    }
    return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuth) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h1 className={`text-2xl font-bold mb-2 ${bodyTextClass}`}>Access Denied</h1>
          <p className={`text-sm mb-6 ${mutedTextClass}`}>Please log in to view your orders.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-[#F97316] hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition text-sm shadow-sm"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-3 text-red-600 animate-spin" />
          <p className={`text-sm ${mutedTextClass}`}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className={`text-3xl font-bold ${bodyTextClass}`}>My Orders</h1>
        <p className={`text-sm mt-1 ${mutedTextClass}`}>{filteredOrders.length} order(s) found</p>
      </div>

      {orders.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${shellClass}`}>
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <h2 className={`text-lg font-semibold mb-2 ${bodyTextClass}`}>No Orders Yet</h2>
          <p className={`text-sm mb-4 ${mutedTextClass}`}>Start shopping to place your first order!</p>
          <Link
            href="/products"
            className="inline-block bg-[#F97316] hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition text-sm shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Filters - Compact */}
          <div className={`rounded-2xl p-4 mb-5 ${shellClass}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${mutedTextClass}`}>Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Order # or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-8 ${controlClass}`}
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${mutedTextClass}`}>Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={controlClass}
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${mutedTextClass}`}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className={controlClass}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("recent");
                    setStatusFilter("all");
                  }}
                  className={`w-full font-medium py-2 px-3 rounded-xl transition text-sm flex items-center justify-center gap-2 border ${
                    isLight
                      ? "bg-[#F8FAFC] hover:bg-[#E5E7EB] text-[#1F2937] border-[#D1D5DB]"
                      : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No orders match your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${shellClass} hover:border-[#F97316]`}
                >
                  {/* Order Header - Always Visible */}
                  <div
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className={`p-4 cursor-pointer transition ${isLight ? "hover:bg-[#F8FAFC]" : "hover:bg-black/30"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left Section */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-[#F97316]">
                          {getStatusIcon(order.fulfillmentStatus)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs ${mutedTextClass}`}>Order #</p>
                          <p className={`text-sm font-semibold truncate ${bodyTextClass}`}>{order.orderNumber}</p>
                        </div>
                      </div>

                      {/* Middle Section */}
                      <div className="hidden sm:block text-right">
                        <p className={`text-xs ${mutedTextClass}`}>Amount</p>
                        <p className={`text-sm font-bold ${bodyTextClass}`}>Rs {Number(order.totalAmount).toFixed(0)}</p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2 flex-shrink-0 items-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(order.fulfillmentStatus)}`}>
                          {order.fulfillmentStatus}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className={`${mutedTextClass} flex-shrink-0`}>
                        {selectedOrder?.id === order.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder?.id === order.id && (
                    <div className={`border-t p-4 space-y-4 ${isLight ? "border-[#E5E7EB] bg-[#F8FAFC]" : "border-gray-700 bg-black/30"}`}>
                      {/* Contact & Shipping Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h4 className={`font-semibold mb-1 flex items-center gap-2 text-xs ${bodyTextClass}`}>
                            <MapPin className="w-3 h-3" />
                            Shipping Address
                          </h4>
                          <p className={`text-xs leading-5 ${mutedTextClass}`}>{order.shippingAddress}</p>
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-1 flex items-center gap-2 text-xs ${bodyTextClass}`}>
                            <CreditCard className="w-3 h-3" />
                            Payment Details
                          </h4>
                          <p className={`text-xs capitalize ${mutedTextClass}`}>{order.paymentMethod}</p>
                          <p className={`text-xs mt-0.5 ${mutedTextClass}`}>Status: {order.paymentStatus}</p>
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-1 flex items-center gap-2 text-xs ${bodyTextClass}`}>
                            <Mail className="w-3 h-3" />
                            Email
                          </h4>
                          <p className={`text-xs break-all ${mutedTextClass}`}>{order.customerEmail}</p>
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-1 flex items-center gap-2 text-xs ${bodyTextClass}`}>
                            <Phone className="w-3 h-3" />
                            Phone
                          </h4>
                          <p className={`text-xs ${mutedTextClass}`}>{order.customerPhone}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className={`font-semibold mb-2 flex items-center gap-2 text-xs ${bodyTextClass}`}>
                          <ShoppingBag className="w-3 h-3" />
                          Items ({order.items.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`rounded-xl overflow-hidden transition hover:-translate-y-0.5 ${
                                isLight
                                  ? "bg-white border border-[#E5E7EB] shadow-sm hover:border-[#F97316]"
                                  : "bg-gray-900/50 border border-gray-700 hover:border-[#F97316]"
                              }`}
                            >
                              {item.product?.img && (
                                <div className={`w-full aspect-square overflow-hidden ${isLight ? "bg-[#F8FAFC]" : "bg-black"}`}>
                                  <img
                                    src={item.product.img}
                                    alt={item.product.title}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                                  />
                                </div>
                              )}
                              <div className="p-3">
                                <p className={`font-medium text-xs line-clamp-1 ${bodyTextClass}`}>
                                  {item.product?.title || `Product #${item.productId}`}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className={`text-xs ${mutedTextClass}`}>Qty: {item.quantity}</span>
                                  <span className={`font-bold text-xs ${bodyTextClass}`}>Rs {Number(item.price).toFixed(0)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total & Date */}
                      <div className={`flex justify-between items-center pt-3 border-t ${isLight ? "border-[#E5E7EB]" : "border-gray-700"}`}>
                        <span className={`font-semibold text-xs ${mutedTextClass}`}>
                          {formatDate(order.createdAt)}
                        </span>
                        <span className={`text-sm font-bold ${bodyTextClass}`}>
                          Rs {Number(order.totalAmount).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
