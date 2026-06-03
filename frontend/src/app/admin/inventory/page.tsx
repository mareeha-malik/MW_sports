"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { AlertTriangle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  id: number;
  title: string;
  stock: number;
  price: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/product/all");
      let items = res.data || [];
      if (lowStockOnly) {
        items = items.filter((p: any) => p.stock < 10);
      }
      setProducts(items);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      // Mock API call - adjust based on your backend
      await axiosInstance.put(`/product/update/${id}`, { stock: newStock });
      toast.success("Stock updated");
      fetchInventory();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400 mt-1">Monitor and manage stock levels</p>
        </div>
        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2 rounded-lg transition ${
            lowStockOnly
              ? "bg-[#F97316] text-white"
              : "bg-[#1a1a1a] hover:bg-[#222] text-gray-300"
          }`}
        >
          <AlertTriangle size={16} className="inline mr-2" />
          Low Stock Only
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#1a1a1a] border-b border-[#222] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {lowStockOnly ? "No low stock items" : "No products found"}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4 font-medium text-white">{product.title}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, Number(e.target.value))}
                        className="w-20 bg-[#0a0a0a] border border-[#222] rounded px-2 py-1 text-white focus:outline-none focus:border-[#F97316]"
                      />
                    </td>
                    <td className="px-6 py-4">Rs {product.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock < 10
                            ? "bg-red-500/20 text-red-400"
                            : product.stock < 50
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {product.stock < 10
                          ? "Critical"
                          : product.stock < 50
                          ? "Low"
                          : "Adequate"}
                      </span>
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
