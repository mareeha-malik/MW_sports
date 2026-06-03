"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Copy, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface DiscountCode {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  displayOrder: number;
}

export default function PromotionsPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"codes" | "banners">("codes");

  // Discount Code Modal
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [codeFormData, setCodeFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    maxUses: 100,
    expiryDate: "",
    description: "",
  });

  // Banner Modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    displayOrder: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setDiscountCodes([
        {
          id: 1,
          code: "SUMMER20",
          discountType: "percentage",
          discountValue: 20,
          maxUses: 100,
          usedCount: 45,
          expiryDate: "2024-08-31",
          isActive: true,
          description: "Summer sale discount",
        },
        {
          id: 2,
          code: "FLAT500",
          discountType: "fixed",
          discountValue: 500,
          maxUses: 50,
          usedCount: 32,
          expiryDate: "2024-07-31",
          isActive: true,
          description: "Flat discount on orders",
        },
      ]);

      setBanners([
        {
          id: 1,
          title: "Summer Collection",
          description: "Up to 50% off on summer collection",
          imageUrl: "/api/placeholder/400/200",
          link: "/products",
          isActive: true,
          displayOrder: 1,
        },
      ]);
    } catch (err) {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  // Discount Code Handlers
  const handleAddCode = () => {
    setEditingCodeId(null);
    setCodeFormData({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      maxUses: 100,
      expiryDate: "",
      description: "",
    });
    setIsCodeModalOpen(true);
  };

  const handleEditCode = (code: DiscountCode) => {
    setEditingCodeId(code.id);
    setCodeFormData({
      code: code.code,
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxUses: code.maxUses,
      expiryDate: code.expiryDate,
      description: code.description,
    });
    setIsCodeModalOpen(true);
  };

  const handleSaveCode = async () => {
    if (!codeFormData.code || codeFormData.discountValue <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingCodeId) {
        setDiscountCodes(
          discountCodes.map((c) =>
            c.id === editingCodeId
              ? { ...c, ...codeFormData }
              : c
          )
        );
        toast.success("Discount code updated");
      } else {
        const newCode: DiscountCode = {
          id: Math.max(...discountCodes.map((c) => c.id), 0) + 1,
          ...codeFormData,
          usedCount: 0,
          isActive: true,
        };
        setDiscountCodes([...discountCodes, newCode]);
        toast.success("Discount code created");
      }
      setIsCodeModalOpen(false);
    } catch (err) {
      toast.error("Failed to save discount code");
    }
  };

  const handleDeleteCode = async (id: number) => {
    if (confirm("Are you sure?")) {
      setDiscountCodes(discountCodes.filter((c) => c.id !== id));
      toast.success("Discount code deleted");
    }
  };

  const handleToggleCode = async (id: number, isActive: boolean) => {
    setDiscountCodes(
      discountCodes.map((c) =>
        c.id === id ? { ...c, isActive: !isActive } : c
      )
    );
    toast.success(isActive ? "Code deactivated" : "Code activated");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  // Banner Handlers
  const handleAddBanner = () => {
    setEditingBannerId(null);
    setBannerFormData({
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      displayOrder: 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      link: banner.link,
      displayOrder: banner.displayOrder,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerFormData.title || !bannerFormData.imageUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingBannerId) {
        setBanners(
          banners.map((b) =>
            b.id === editingBannerId
              ? { ...b, ...bannerFormData }
              : b
          )
        );
        toast.success("Banner updated");
      } else {
        const newBanner: Banner = {
          id: Math.max(...banners.map((b) => b.id), 0) + 1,
          ...bannerFormData,
          isActive: true,
        };
        setBanners([...banners, newBanner]);
        toast.success("Banner created");
      }
      setIsBannerModalOpen(false);
    } catch (err) {
      toast.error("Failed to save banner");
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (confirm("Are you sure?")) {
      setBanners(banners.filter((b) => b.id !== id));
      toast.success("Banner deleted");
    }
  };

  const handleToggleBanner = async (id: number, isActive: boolean) => {
    setBanners(
      banners.map((b) =>
        b.id === id ? { ...b, isActive: !isActive } : b
      )
    );
    toast.success(isActive ? "Banner deactivated" : "Banner activated");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Promotions</h1>
        <p className="text-gray-400 mt-1">Manage discounts and promotions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#222]">
        <button
          onClick={() => setActiveTab("codes")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "codes"
              ? "border-b-2 border-[#F97316] text-[#F97316]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Discount Codes
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "banners"
              ? "border-b-2 border-[#F97316] text-[#F97316]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Banners
        </button>
      </div>

      {/* Discount Codes Tab */}
      {activeTab === "codes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Discount Codes</h2>
            <button
              onClick={handleAddCode}
              className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Add Code
            </button>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222] bg-[#0a0a0a]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Used</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Expires</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((code) => (
                  <tr key={code.id} className="border-b border-[#222] hover:bg-[#0a0a0a]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#F97316]">{code.code}</span>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {code.discountType === "percentage" ? "%" : "PKR"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {code.discountValue}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {code.usedCount}/{code.maxUses}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(code.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          code.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEditCode(code)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleCode(code.id, code.isActive)}
                        className={`transition ${
                          code.isActive
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-green-400 hover:text-green-300"
                        }`}
                      >
                        {code.isActive ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteCode(code.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Promotional Banners</h2>
            <button
              onClick={handleAddBanner}
              className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus size={18} />
              Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{banner.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{banner.description}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        banner.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleBanner(banner.id, banner.isActive)}
                        className={`transition ${
                          banner.isActive
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-green-400 hover:text-green-300"
                        }`}
                      >
                        {banner.isActive ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingCodeId ? "Edit Discount Code" : "Create Discount Code"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Code</label>
                <input
                  type="text"
                  value={codeFormData.code}
                  onChange={(e) =>
                    setCodeFormData({ ...codeFormData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="SUMMER20"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Discount Type</label>
                <select
                  value={codeFormData.discountType}
                  onChange={(e) =>
                    setCodeFormData({
                      ...codeFormData,
                      discountType: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Discount Value</label>
                <input
                  type="number"
                  value={codeFormData.discountValue}
                  onChange={(e) =>
                    setCodeFormData({ ...codeFormData, discountValue: parseFloat(e.target.value) })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Max Uses</label>
                <input
                  type="number"
                  value={codeFormData.maxUses}
                  onChange={(e) =>
                    setCodeFormData({ ...codeFormData, maxUses: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={codeFormData.expiryDate}
                  onChange={(e) =>
                    setCodeFormData({ ...codeFormData, expiryDate: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={codeFormData.description}
                  onChange={(e) =>
                    setCodeFormData({ ...codeFormData, description: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="Description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCodeModalOpen(false)}
                  className="flex-1 bg-[#222] hover:bg-[#333] text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCode}
                  className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-2 rounded-lg transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingBannerId ? "Edit Banner" : "Create Banner"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, title: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="Banner Title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={bannerFormData.description}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, description: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="Description"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Image URL</label>
                <input
                  type="text"
                  value={bannerFormData.imageUrl}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Link</label>
                <input
                  type="text"
                  value={bannerFormData.link}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, link: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="/products"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={bannerFormData.displayOrder}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 bg-[#222] hover:bg-[#333] text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-2 rounded-lg transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
