'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { axiosInstance } from '../../utils/api';

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

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/category');
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const builtTree = buildTree(data);
      setCategories(builtTree);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentId);
  };

  const renderCategoryDropdown = (parentCat: Category) => {
    const hasChildren = parentCat.children && parentCat.children.length > 0;

    if (!hasChildren) {
      // If no children, render as a simple link with chevron (visual consistency)
      return (
        <Link
          key={parentCat.id}
          className="relative group py-1 px-2 dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors rounded-md dark:hover:bg-HeaderWalaBlack/30 light:hover:bg-orange-100/30 flex items-center gap-2"
          href={`/category/${parentCat.slug}`}
        >
          <span>{parentCat.name}</span>
          <ChevronDown size={16} className="opacity-50" />
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-BrightOrange group-hover:w-full transition-all duration-300"></span>
        </Link>
      );
    }

    // If has children, render with dropdown and animated chevron
    return (
      <div
        key={parentCat.id}
        className="relative group py-1 px-2 rounded-md dark:hover:bg-HeaderWalaBlack/30 light:hover:bg-orange-100/30 transition-colors"
        onMouseEnter={() => setIsDropdownOpen(parentCat.id)}
        onMouseLeave={() => setIsDropdownOpen(null)}
      >
        <button className="flex items-center gap-2 dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors w-full justify-center">
          <span>{parentCat.name}</span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              isDropdownOpen === parentCat.id ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Underline on hover */}
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-BrightOrange scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>

        {/* Dropdown Menu */}
        {isDropdownOpen === parentCat.id && (
          <div className="absolute left-0 mt-2 min-w-max dark:bg-BgWalaBlack/95 light:bg-white/95 backdrop-blur-md dark:text-gray-400 light:text-[#6B7280] rounded-lg shadow-2xl z-50 dark:border-gray-700/50 light:border-[#E5E7EB]/50 border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {parentCat.children!.map((subCat, index) => (
              <Link
                key={subCat.id}
                className={`block px-4 py-3 dark:hover:bg-HeaderWalaBlack light:hover:bg-[#F3F4F6] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-all duration-200 text-sm whitespace-nowrap ${
                  index !== parentCat.children!.length - 1 ? 'dark:border-gray-700/30 light:border-[#E5E7EB]/30 border-b' : ''
                }`}
                href={`/category/${subCat.slug}`}
              >
                {subCat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hidden lg:block z-30 relative dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-800 light:border-[#E5E7EB] border-b backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex w-full justify-center gap-8 font-semibold py-3 dark:text-gray-400 light:text-[#6B7280]">
          <Link
            className="relative group py-1 dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
            href="/"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-BrightOrange group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Dynamic Categories */}
          {!loading && getParentCategories().length > 0 ? (
            getParentCategories()
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((cat) => renderCategoryDropdown(cat))
          ) : !loading ? (
            <span className="text-gray-500 text-sm">No categories available</span>
          ) : null}

          <Link
            className="relative group py-1 hover:text-BrightOrange transition-colors"
            href="/Cart"
          >
            Cart
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-BrightOrange group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            className="relative group py-1 hover:text-BrightOrange transition-colors"
            href="/AboutUs"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-BrightOrange group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
