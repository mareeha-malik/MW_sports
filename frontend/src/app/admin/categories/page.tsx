"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { Plus, Edit, Trash2, GripVertical, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: number | null;
  displayOrder: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: null as number | null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/category");
      const data = res.data || [];
      buildTree(data);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (cats: Category[]) => {
    const parentMap = new Map<number | undefined, Category[]>();
    cats.forEach((cat) => {
      const parent = cat.parentId || undefined;
      if (!parentMap.has(parent)) {
        parentMap.set(parent, []);
      }
      parentMap.get(parent)!.push(cat);
    });

    const buildNode = (cat: Category): Category => {
      const children = parentMap.get(cat.id);
      return { ...cat, children: children?.map(buildNode) };
    };

    return cats.filter((c) => !c.parentId).map(buildNode);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    try {
      if (editingId) {
        await axiosInstance.put(`/category/${editingId}`, {
          ...formData,
          slug,
        });
        toast.success("Category updated");
      } else {
        await axiosInstance.post("/category", {
          ...formData,
          slug,
        });
        toast.success("Category created");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", slug: "", description: "", parentId: null });
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete the category and all its children."))
      return;

    try {
      await axiosInstance.delete(`/category/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parentId: cat.parentId || null,
    });
    setIsModalOpen(true);
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const CategoryTreeItem = ({ cat, level = 0 }: { cat: Category; level?: number }) => (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] rounded-lg transition group"
        style={{ marginLeft: `${level * 24}px` }}
      >
        {cat.children && cat.children.length > 0 && (
          <button
            onClick={() => toggleExpand(cat.id)}
            className="p-1 hover:bg-[#222] rounded transition"
          >
            <ChevronDown
              size={16}
              className={`transition ${expandedIds.has(cat.id) ? "rotate-0" : "-rotate-90"}`}
            />
          </button>
        )}
        {!cat.children && <GripVertical size={16} className="text-gray-600" />}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium">{cat.name}</p>
          <p className="text-xs text-gray-500">{cat.slug}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: "",
                slug: "",
                description: "",
                parentId: cat.id,
              });
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-green-500/20 rounded text-green-400 transition"
            title="Add Sub-Category"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => handleEdit(cat)}
            className="p-2 hover:bg-blue-500/20 rounded text-blue-400 transition"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="p-2 hover:bg-red-500/20 rounded text-red-400 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {expandedIds.has(cat.id) && cat.children && (
        <div>
          {cat.children.map((child) => (
            <CategoryTreeItem key={child.id} cat={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", slug: "", description: "", parentId: null });
            setIsModalOpen(true);
          }}
          className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Categories Tree */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-[#1a1a1a] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No categories yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <CategoryTreeItem key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingId ? "Edit Category" : formData.parentId ? "Add Sub-Category" : "Add Main Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingId) {
                      setFormData((prev) => ({
                        ...prev,
                        slug: generateSlug(e.target.value),
                      }));
                    }
                  }}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="e.g., Bats"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F97316]"
                  placeholder="Auto-generated"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F97316] resize-none"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Parent Category (Optional - for sub-categories)</label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F97316]"
                >
                  <option value="">-- No Parent (Main Category) --</option>
                  {categories
                    .filter((cat) => !cat.parentId && (editingId === null || cat.id !== editingId))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a parent category to create a sub-category</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white py-2 rounded-lg transition"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
