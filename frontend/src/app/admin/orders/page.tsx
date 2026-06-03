"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { Eye, MoreVertical } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  user?: { username: string; email: string };
  items: Array<{ quantity: number }>;
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const fulfillmentStatusColors: Record<string, string> = {
  pending: "bg-blue-500/20 text-blue-400",
  confirmed: "bg-purple-500/20 text-purple-400",
  shipped: "bg-orange-500/20 text-orange-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/order", {
        params: { skip: (page - 1) * 25, take: 25 },
      });
      setOrders(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Manage customer orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#1a1a1a] border-b border-[#222] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Fulfillment</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{order.user?.username || "—"}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </td>
                    <td className="px-6 py-4 font-medium">Rs {order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          paymentStatusColors[order.paymentStatus] || "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          fulfillmentStatusColors[order.fulfillmentStatus] ||
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition inline-block"
                        title="View Order"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#222] flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * 25 + 1} to {Math.min(page * 25, total)} of {total} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-50 transition text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-50 transition text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
