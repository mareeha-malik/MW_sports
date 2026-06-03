"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  img: string;
  status: string;
  categoryId?: number;
  category?: { name: string };
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get("/product/all"),
        axiosInstance.get("/category"),
      ]);

      // Handle response data - backend returns array directly
      let products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || [];
      let categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data || [];
      
      if (selectedCategory) {
        products = products.filter((p: Product) => p.categoryId === selectedCategory);
      }
      if (searchTerm) {
        products = products.filter((p: Product) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setProducts(products);
      setCategories(categories);
    } catch (err: any) {
      console.error("Failed to fetch data:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      toast.error("Failed to load products: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axiosInstance.delete(`/product/delete/${id}`);
      toast.success("Product deleted");
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={() => fetchData()}
          className="flex-1 bg-[#111] border border-[#222] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316]"
        />
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
          className="bg-[#111] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#1a1a1a] border-b border-[#222] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.img && (
                          <div className="w-10 h-10 flex-shrink-0">
                            <img
                              src={product.img}
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{product.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category?.name || "—"}</td>
                    <td className="px-6 py-4">Rs {product.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock < 10
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.status === "active"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
