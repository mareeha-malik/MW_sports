"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "./Product_Card";
import { axiosInstance } from "../../utils/api";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [carouselPositions, setCarouselPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchProducts() {
      const response = await axiosInstance.get("/product/all");
      setProducts(response.data);
    }

    fetchProducts();
  }, []);

  // Group products by badge
  const groupedProducts = products.reduce((acc: Record<string, any[]>, product: any) => {
    const badge = product.badge || "No Label";
    if (!acc[badge]) {
      acc[badge] = [];
    }
    acc[badge].push(product);
    return acc;
  }, {});

  // Define badge order
  const badgeOrder = ["NEW", "HOT", "SALE", "FEATURED"];
  const sortedBadges = [
    ...badgeOrder.filter(b => Object.keys(groupedProducts).includes(b)),
    ...Object.keys(groupedProducts)
      .filter(b => !badgeOrder.includes(b))
      .sort()
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge.toUpperCase()) {
      case "HOT":
        return "bg-red-600";
      case "NEW":
        return "bg-blue-600";
      case "SALE":
        return "bg-green-600";
      case "FEATURED":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCarouselColor = (badge: string) => {
    switch (badge.toUpperCase()) {
      case "HOT":
        return "from-red-600 to-red-700";
      case "NEW":
        return "from-blue-600 to-blue-700";
      case "SALE":
        return "from-green-600 to-green-700";
      case "FEATURED":
        return "from-purple-600 to-purple-700";
      default:
        return "from-gray-700 to-gray-800";
    }
  };

  const moveCarousel = (badge: string, direction: 'left' | 'right') => {
    setCarouselPositions(prev => {
      const currentPos = prev[badge] || 0;
      const items = groupedProducts[badge].length;
      const itemsPerView = 5;
      
      if (direction === 'left') {
        return { ...prev, [badge]: Math.max(0, currentPos - 1) };
      } else {
        return { ...prev, [badge]: Math.min(items - itemsPerView, currentPos + 1) };
      }
    });
  };

  return (
    <section className="dark:bg-BgWalaBlack light:bg-[#F9FAFB] py-20">
      <div className="container">
        {sortedBadges.map((badge, sectionIdx) => {
          const itemsInSection = groupedProducts[badge].length;
          const currentPos = carouselPositions[badge] || 0;
          
          return (
            <motion.div
              key={badge}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIdx * 0.1 }}
              className="mb-24"
            >
              {/* Section Header with Navigation */}
              <div className="flex items-center justify-between mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-5xl font-black dark:text-white light:text-[#1F2937]">
                    {badge === "No Label" ? "ALL PRODUCTS" : `${badge} PRODUCTS`}
                  </h2>
                  <p className="dark:text-gray-600 light:text-[#6B7280] mt-2">
                    {badge === "HOT" && "Trending now - Shop the hottest items"}
                    {badge === "NEW" && "Explore the latest drops with premium build quality"}
                    {badge === "SALE" && "Get amazing discounts on selected items"}
                    {badge === "FEATURED" && "Handpicked items we recommend"}
                    {badge === "No Label" && "Browse our complete collection"}
                  </p>
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => moveCarousel(badge, 'left')}
                    className="p-3 rounded-full dark:bg-black light:bg-white dark:text-white light:text-[#1F2937] dark:hover:bg-red-600 light:hover:bg-orange-100 transition-all dark:border dark:border-[#333] light:border light:border-[#E5E7EB]"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => moveCarousel(badge, 'right')}
                    className="p-3 rounded-full dark:bg-black light:bg-white dark:text-white light:text-[#1F2937] dark:hover:bg-red-600 light:hover:bg-orange-100 transition-all dark:border dark:border-[#333] light:border light:border-[#E5E7EB]"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Carousel Container */}
              <div className="relative overflow-hidden">
                <motion.div
                  animate={{ x: `-${currentPos * 20}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex gap-6"
                >
                  {groupedProducts[badge].map((product, idx) => (
                    <motion.div
                      key={product.id}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/5"
                      whileHover={{ y: -5 }}
                    >
                      <ProductCard
                        img={product.img}
                        title={product.title}
                        desc={product.description}
                        rating={product.rating}
                        price={product.price}
                        oldPrice={product.oldPrice}
                        id={product.id}
                        badge={product.badge}
                        category={product.category}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(Math.max(1, itemsInSection - 4))].map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCarouselPositions(prev => ({ ...prev, [badge]: idx }))}
                    animate={{
                      backgroundColor: currentPos === idx ? "#dc2626" : "#e5e7eb",
                      width: currentPos === idx ? 32 : 8
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full transition-all"
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Products;