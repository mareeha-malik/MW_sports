"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import toast from "react-hot-toast";
import { UserCheck, UserX, Eye } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: number;
  username: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  orders?: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/user/all");
      // Filter out admins
      const nonAdmins = (res.data || []).filter((u: any) => u.role !== "admin");
      setCustomers(nonAdmins);
    } catch (err: any) {
      console.error("Failed to fetch customers:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      toast.error("Failed to load customers: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      // Mock API call - adjust based on your backend
      await axiosInstance.put(`/user/${id}`, { isActive: !isActive });
      setCustomers(customers.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
      toast.success(isActive ? "Customer banned" : "Customer unbanned");
    } catch (err) {
      toast.error("Failed to update customer status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <p className="text-gray-400 mt-1">Manage and monitor customer accounts</p>
      </div>

      {/* Customers Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#1a1a1a] border-b border-[#222] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Orders</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4 font-medium text-white">{customer.username}</td>
                    <td className="px-6 py-4 text-gray-400">{customer.email}</td>
                    <td className="px-6 py-4 text-gray-400">{customer.phone || "—"}</td>
                    <td className="px-6 py-4">{customer.orders?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          customer.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                          className={`p-2 rounded transition ${
                            customer.isActive
                              ? "hover:bg-red-500/20 text-red-400"
                              : "hover:bg-green-500/20 text-green-400"
                          }`}
                          title={customer.isActive ? "Ban" : "Unban"}
                        >
                          {customer.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
