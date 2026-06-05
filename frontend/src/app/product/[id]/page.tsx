"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/api";
import { addGuestCartItem } from "../../utils/cart";
import { FaStar, FaRegStar } from "react-icons/fa";
import ProductCard from "../../Components/ui/Product_Card";
import toast from "react-hot-toast";
import { ChevronLeft, Menu, Share2 } from "lucide-react";

interface Product {
  id: number;
  title: string;
  img: string;
  description: string;
  price: number;
  rating: number;
  category?: any;
}

interface Review {
  id: number;
  user: { username: string };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  
  // Review form states
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof id !== "string") {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${id}`);
        setProduct(response.data);

        // Fetch recommended products from the same category
        if (response.data.category?.id) {
          const allProducts = await axiosInstance.get("/product/all");
          const sameCategory = allProducts.data
            .filter((p: Product) => p.category?.id === response.data.category.id && p.id !== response.data.id)
            .slice(0, 4);
          setRecommendedProducts(sameCategory);
        }

        // Fetch reviews for this product
        const reviewsResponse = await axiosInstance.get(`/review?productId=${id}`);
        const allReviews = reviewsResponse.data.data || [];
        // Only show approved reviews to users
        setReviews(allReviews.filter((review: Review) => review.status === "approved"));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const renderRating = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {Array(5)
          .fill(0)
          .map((_, index) =>
            index < rating ? (
              <FaStar key={index} className="text-BrightOrange" />
            ) : (
              <FaRegStar key={index} className="text-BrightOrange" />
            )
          )}
      </div>
    );
  };

  if (loading) return <div className="dark:text-white light:text-[#1F2937]">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return <div className="dark:text-white light:text-[#1F2937]">Product not found</div>;

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("access_token");
    if (token) {
      await axiosInstance.post("/cart/add", { productId: product.id, quantity });
      window.dispatchEvent(new Event("cart:updated"));
      return;
    }

    addGuestCartItem(product.id, quantity);
  };

  const handleShare = async () => {
    if (!product) return;

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled the share sheet.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied");
    } catch (error) {
      toast.error("Could not copy link");
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length === 0) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post("/review", {
        productId: parseInt(id as string),
        rating,
        comment,
      });
      toast.success("Review submitted! Awaiting admin approval");
      setRating(0);
      setComment("");
      // Refresh reviews
      const reviewsResponse = await axiosInstance.get(`/review?productId=${id}`);
      const allReviews = reviewsResponse.data.data || [];
      setReviews(allReviews.filter((review: Review) => review.status === "approved"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-2 pb-20 pt-2 sm:px-4 md:px-8 md:pb-16 md:pt-8">
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] shadow-sm transition hover:border-BrightOrange hover:text-BrightOrange dark:border-[#222] dark:bg-[#111] dark:text-white"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] shadow-sm transition hover:border-BrightOrange hover:text-BrightOrange dark:border-[#222] dark:bg-[#111] dark:text-white"
            aria-label="Open product menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[3rem] z-20 w-40 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xl dark:border-[#222] dark:bg-[#111]">
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] transition hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-[#1a1a1a]"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share product
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] transition hover:bg-[#F3F4F6] dark:text-white dark:hover:bg-[#1a1a1a]"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_10px_22px_rgba(0,0,0,0.04)] dark:bg-[#111]">
            <div className="flex items-center justify-center bg-[#F8FAFC] px-3 py-4 dark:bg-[#121212] sm:px-6 sm:py-6 md:px-8 md:py-8">
              <img
                src={product.img}
                alt={product.title}
                className="h-[180px] w-full max-w-[220px] object-contain sm:h-[240px] sm:max-w-[280px] md:h-[320px] md:max-w-[320px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-[#111]">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#9CA3AF]">Qty</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F3F4F6] text-sm font-semibold text-[#1F2937] dark:bg-[#1a1a1a] dark:text-white"
                >
                  -
                </button>
                <span className="w-4 text-center text-sm font-semibold text-[#1F2937] dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F3F4F6] text-sm font-semibold text-[#1F2937] dark:bg-[#1a1a1a] dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#9CA3AF]">Rating</p>
              <div className="mt-1.5 flex justify-end gap-0.5 text-[10px]">
                {renderRating(reviews.length > 0 ? Math.round(getAverageRating()) : product.rating)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-3 shadow-[0_10px_22px_rgba(0,0,0,0.04)] dark:bg-[#111] sm:p-5 md:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-BrightOrange">
              Product details
            </p>
            <h1 className="mt-1.5 text-xl font-black leading-tight text-[#1F2937] dark:text-white sm:text-2xl md:text-3xl">
              {product.title}
            </h1>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xl font-black text-BrightOrange sm:text-2xl">
              Rs {product.price}
            </span>
            <del className="pb-0.5 text-xs text-[#9CA3AF] dark:text-gray-500 sm:text-sm">
              Rs {product.price + 500}
            </del>
          </div>

          <p className="max-w-xl text-[13px] leading-relaxed text-[#6B7280] dark:text-gray-400 sm:text-sm">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-[#1F2937] dark:text-gray-300">
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1.5 dark:bg-[#1a1a1a]">Easy returns</span>
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1.5 dark:bg-[#1a1a1a]">Secure checkout</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              className="rounded-lg bg-BrightOrange px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1F2937] shadow-sm transition hover:border-BrightOrange hover:text-BrightOrange dark:border-[#222] dark:bg-[#111] dark:text-white dark:hover:border-BrightOrange">
              Buy Now
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2.5 dark:bg-[#0f0f0f]">
            {renderRating(reviews.length > 0 ? Math.round(getAverageRating()) : product.rating)}
            <span className="text-xs text-[#6B7280] dark:text-gray-500">
              {reviews.length > 0
                ? `(${getAverageRating()} / 5) • ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                : `(${product.rating} / 5)`}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-[#222] dark:bg-[#0e0e0e]/95 md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#9CA3AF]">Total price</p>
            <p className="truncate text-lg font-black text-BrightOrange">Rs {product.price * quantity}</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="rounded-lg bg-BrightOrange px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
            >
              Add to Cart
            </button>
            <button className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-semibold text-[#1F2937] transition hover:border-BrightOrange hover:text-BrightOrange dark:border-[#222] dark:bg-[#111] dark:text-white dark:hover:border-BrightOrange">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-10 md:mt-16">
          <h2 className="mb-4 text-xl font-bold text-[#1F2937] dark:text-white sm:text-2xl">Recommended Products</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                img={product.img}
                title={product.title}
                desc={product.description}
                rating={product.rating}
                price={product.price}
                category={product.category}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold dark:text-white light:text-[#1F2937]">Reviews</h2>
         
        </div>

        {/* Review Form */}
        {isLoggedIn && (
          <div className="dark:bg-[#111] light:bg-white dark:border-[#222] light:border-[#E5E7EB] border rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold dark:text-white light:text-[#1F2937] mb-3">Leave a Review</h3>
            
            {/* Star Rating Selector */}
            <div className="mb-3">
              <div className="flex space-x-1 mb-2">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setRating(index + 1)}
                      onMouseEnter={() => setHoverRating(index + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-lg transition-colors duration-200"
                    >
                      {(hoverRating || rating) > index ? (
                        <FaStar className="text-BrightOrange" />
                      ) : (
                        <FaRegStar className="dark:text-gray-600 light:text-[#D1D5DB]" />
                      )}
                    </button>
                  ))}
              </div>
              {rating > 0 && (
                <p className="text-BrightOrange text-xs">{rating}/5</p>
              )}
            </div>

            {/* Comment Input */}
            <div className="mb-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your review..."
                className="w-full dark:bg-[#1a1a1a] light:bg-[#F3F4F6] dark:border-[#333] light:border-[#D1D5DB] border dark:text-white light:text-[#1F2937] dark:placeholder-gray-600 light:placeholder-[#9CA3AF] rounded p-2 resize-none focus:outline-none focus:border-BrightOrange text-sm"
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-BrightOrange text-white py-1 px-4 rounded text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-[#111] border border-[#222] rounded-lg p-3 mb-4 text-center">
            <p className="text-gray-400 text-sm">Login to submit a review</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">No reviews yet</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-[#111] border border-[#222] rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{review.user.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-0.5 ml-2 flex-shrink-0">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="text-xs">
                          {i < review.rating ? (
                            <FaStar className="text-BrightOrange" />
                          ) : (
                            <FaRegStar className="text-gray-600" />
                          )}
                        </span>
                      ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
