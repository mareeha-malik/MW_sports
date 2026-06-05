"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { axiosInstance } from "@/app/utils/api";
import ProductCard from "@/app/Components/ui/Product_Card";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
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

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  img: string;
  rating: number;
  categoryId: number;
  stock: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!slug) return;
    fetchCategoryAndProducts();
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch all categories
      const categoriesRes = await axiosInstance.get("/category");
      const allCats = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.data || [];

      setAllCategories(allCats);

      // Find the category by slug
      const foundCategory = allCats.find((cat: Category) => cat.slug === slug);
      if (!foundCategory) {
        toast.error("Category not found");
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // If this is a sub-category, find the parent and expand it
      if (foundCategory.parentId) {
        const parent = allCats.find((cat: Category) => cat.id === foundCategory.parentId);
        setParentCategory(parent || null);
        setExpandedCategories(new Set([foundCategory.parentId]));
      }

      // Fetch all products
      const productsRes = await axiosInstance.get("/product/all");
      let allProducts = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.data || [];

      // Get all category IDs to include (the current category + all its subcategories)
      const getCategoryAndSubcategoryIds = (cat: Category): number[] => {
        const ids = [cat.id];
        if (cat.children && cat.children.length > 0) {
          cat.children.forEach(child => {
            ids.push(...getCategoryAndSubcategoryIds(child));
          });
        }
        return ids;
      };

      const categoryIds = getCategoryAndSubcategoryIds(foundCategory);

      // Filter products by this category and all its subcategories
      const categoryProducts = allProducts.filter(
        (p: Product) => categoryIds.includes(p.categoryId)
      );

      setProducts(categoryProducts);
    } catch (error) {
      console.error("Failed to fetch category or products:", error);
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 text-lg">Category not found</p>
        <Link href="/" className="text-BrightOrange hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-BrightOrange transition-colors">
          Home
        </Link>
        <span>/</span>
        {parentCategory && (
          <>
            <Link
              href={`/category/${parentCategory.slug}`}
              className="hover:text-BrightOrange transition-colors"
            >
              {parentCategory.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-BrightOrange">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-400">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {products.length} {products.length === 1 ? "product" : "products"} available
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No products in this category yet</p>
          <Link href="/" className="text-BrightOrange hover:underline mt-4 inline-block">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              img={product.img}
              title={product.title}
              desc={product.description}
              rating={product.rating}
              price={product.price}
              oldPrice={product.oldPrice}
              id={product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
