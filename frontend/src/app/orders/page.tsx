"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import Link from "next/link";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 text-sm mb-6">Please log in to view your orders.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition text-sm"
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
          <p className="text-gray-400 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 pb-40 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="text-gray-400 text-xs">{filteredOrders.length} order(s) found</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <h2 className="text-lg font-semibold text-white mb-2">No Orders Yet</h2>
          <p className="text-gray-400 text-sm mb-4">Start shopping to place your first order!</p>
          <Link
            href="/products"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition text-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Filters - Compact */}
          <div className="bg-HeaderWalaBlack rounded-lg p-3 mb-4 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* Search */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Order # or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-gray-600 rounded px-7 py-1.5 text-xs text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none transition"
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest</option>
                  <option value="lowest">Lowest</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none transition"
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
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-2 rounded transition text-xs flex items-center justify-center gap-1"
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
                  className="bg-HeaderWalaBlack border border-gray-700 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300"
                >
                  {/* Order Header - Always Visible */}
                  <div
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="p-3 cursor-pointer hover:bg-black/30 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Left Section */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-red-500">
                          {getStatusIcon(order.fulfillmentStatus)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-400 text-xs">Order #</p>
                          <p className="text-white text-xs font-semibold truncate">{order.orderNumber}</p>
                        </div>
                      </div>

                      {/* Middle Section */}
                      <div className="hidden sm:block text-right">
                        <p className="text-gray-400 text-xs">Amount</p>
                        <p className="text-white text-xs font-bold">Rs {Number(order.totalAmount).toFixed(0)}</p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(order.fulfillmentStatus)}`}>
                          {order.fulfillmentStatus}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      {/* Expand Icon */}
                      <div className="text-gray-400 flex-shrink-0">
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
                    <div className="border-t border-gray-700 p-3 bg-black/30 space-y-3">
                      {/* Contact & Shipping Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-xs">
                            <MapPin className="w-3 h-3" />
                            Shipping Address
                          </h4>
                          <p className="text-gray-300 text-xs">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-xs">
                            <CreditCard className="w-3 h-3" />
                            Payment Details
                          </h4>
                          <p className="text-gray-300 text-xs capitalize">{order.paymentMethod}</p>
                          <p className="text-gray-400 text-xs mt-0.5">Status: {order.paymentStatus}</p>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-xs">
                            <Mail className="w-3 h-3" />
                            Email
                          </h4>
                          <p className="text-gray-300 text-xs">{order.customerEmail}</p>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-xs">
                            <Phone className="w-3 h-3" />
                            Phone
                          </h4>
                          <p className="text-gray-300 text-xs">{order.customerPhone}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-xs">
                          <ShoppingBag className="w-3 h-3" />
                          Items ({order.items.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-900/50 border border-gray-700 rounded overflow-hidden hover:border-red-600 transition"
                            >
                              {item.product?.img && (
                                <div className="w-full bg-black aspect-square overflow-hidden">
                                  <img
                                    src={item.product.img}
                                    alt={item.product.title}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                                  />
                                </div>
                              )}
                              <div className="p-2">
                                <p className="text-white font-medium text-xs line-clamp-1">
                                  {item.product?.title || `Product #${item.productId}`}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-gray-400 text-xs">Qty: {item.quantity}</span>
                                  <span className="text-white font-bold text-xs">Rs {Number(item.price).toFixed(0)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total & Date */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-gray-300 font-semibold text-xs">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-white text-sm font-bold">
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
