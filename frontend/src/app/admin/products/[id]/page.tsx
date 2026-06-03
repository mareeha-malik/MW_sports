"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/app/utils/api";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  img: string;
  rating?: number;
  status: "active" | "draft" | "out_of_stock";
  badge?: "NEW" | "HOT" | "SALE";
  categoryId?: number;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const isNew = productId === "new";

  const [product, setProduct] = useState<Product>({
    id: 0,
    title: "",
    description: "",
    price: 0,
    stock: 0,
    img: "",
    status: "active",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          isNew ? null : axiosInstance.get(`/product/${productId}`),
          axiosInstance.get("/category"),
        ]);

        if (prodRes) {
          setProduct(prodRes.data);
        }
        const categories = Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || [];
        setCategories(categories);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, isNew]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;
      setProduct({ ...product, img: imageUrl });
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (product.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        img: product.img,
        status: product.status,
        categoryId: product.categoryId,
        oldPrice: product.oldPrice,
        badge: product.badge,
      };

      if (isNew) {
        await axiosInstance.post("/product/create", payload);
        toast.success("Product created successfully");
      } else {
        await axiosInstance.put(`/product/update/${productId}`, payload);
        toast.success("Product updated successfully");
      }

      router.push("/admin/products");
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1a1a] rounded w-64" />
          <div className="h-96 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isNew ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-gray-400 mt-1">
            {isNew ? "Create a new product" : `Edit product #${productId}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Product Title *</label>
                  <input
                    type="text"
                    value={product.title}
                    onChange={(e) => setProduct({ ...product, title: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                    placeholder="e.g., Professional Cricket Bat"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Description</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316] resize-none"
                    rows={5}
                    placeholder="Product description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Price (Rs) *</label>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Original Price (Rs)</label>
                    <input
                      type="number"
                      value={product.oldPrice || ""}
                      onChange={(e) =>
                        setProduct({ ...product, oldPrice: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                      placeholder="For discount display"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Image</h2>
              
              {/* Image Preview */}
              {product.img && (
                <div className="mb-4">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-32 h-32 object-contain"
                  />
                </div>
              )}

              {/* File Upload Input */}
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="block w-full bg-[#0a0a0a] border border-dashed border-[#F97316] rounded-lg px-4 py-8 text-center cursor-pointer hover:bg-[#1a1a1a] transition"
                >
                  <p className="text-gray-300 font-medium">
                    {uploading ? 'Uploading...' : 'Click to select image or drag & drop'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">JPG, PNG, WebP up to 10MB</p>
                </label>
              </div>

              {/* Current Image URL (Read-only) */}
              {product.img && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-300 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={product.img}
                    readOnly
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-gray-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
              <select
                value={product.categoryId || ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    categoryId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Stock</h3>
              <input
                type="number"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>

            {/* Status */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Status</h3>
              <select
                value={product.status}
                onChange={(e) => setProduct({ ...product, status: e.target.value as any })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Badge */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Badge</h3>
              <select
                value={product.badge || ""}
                onChange={(e) =>
                  setProduct({ ...product, badge: e.target.value as any })
                }
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
              >
                <option value="">None</option>
                <option value="NEW">New</option>
                <option value="HOT">Hot</option>
                <option value="SALE">Sale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Save size={18} />
            {saving ? "Saving..." : isNew ? "Create Product" : "Update Product"}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 rounded-lg transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
