"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/app/utils/api";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Customer {
  id: number;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  orders?: Array<{ id: number; orderNumber: string; totalAmount: number; createdAt: string }>;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/user/${customerId}`);
      setCustomer(res.data);
    } catch (err) {
      toast.error("Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;

    try {
      setUpdating(true);
      await axiosInstance.put(`/user/${customerId}`, { isActive: !customer.isActive });
      setCustomer({ ...customer, isActive: !customer.isActive });
      toast.success(customer.isActive ? "Customer banned" : "Customer unbanned");
    } catch (err) {
      toast.error("Failed to update customer status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !customer) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1a1a] rounded w-64" />
        </div>
      </div>
    );
  }

  const totalOrders = customer.orders?.length || 0;
  const totalSpent =
    customer.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{customer.username}</h1>
            <p className="text-gray-400 mt-1">Customer ID: {customer.id}</p>
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={updating}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 ${
            customer.isActive
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
              : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
          }`}
        >
          {customer.isActive ? (
            <>
              <Lock size={18} />
              Ban Customer
            </>
          ) : (
            <>
              <Unlock size={18} />
              Unban Customer
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Username</p>
                <p className="text-white font-medium">{customer.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="text-white font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Phone</p>
                <p className="text-white font-medium">{customer.phone || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                    customer.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {customer.isActive ? "Active" : "Banned"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-400 mb-1">Shipping Address</p>
                <p className="text-white font-medium">{customer.address || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                <p className="text-white font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order History</h2>
            {customer.orders && customer.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#222]">
                      <th className="text-left py-3 px-4 text-gray-400">Order</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                        <td className="py-3 px-4 text-white font-medium">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-white">Rs {order.totalAmount}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          {/* Total Orders */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-white">{totalOrders}</p>
          </div>

          {/* Total Spent */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-[#F97316]">Rs {totalSpent}</p>
          </div>

          {/* Average Order */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Average Order Value</p>
            <p className="text-2xl font-bold text-white">
              Rs {totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
