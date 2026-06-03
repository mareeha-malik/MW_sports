"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/api";
import { addGuestCartItem } from "../../utils/cart";
import { FaStar, FaRegStar } from "react-icons/fa";
import ProductCard from "../../Components/ui/Product_Card";
import toast from "react-hot-toast";

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
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
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
      await axiosInstance.post("/cart/add", { productId: product.id, quantity: 1 });
      window.dispatchEvent(new Event("cart:updated"));
      return;
    }

    addGuestCartItem(product.id, 1);
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
    <div className="container mx-auto py-16 px-4 md:px-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="dark:border-white light:border-[#D1D5DB] border p-8 rounded-xl shadow-lg dark:bg-[#111] light:bg-white">
        <div className="p-8 rounded-xl shadow-lg">
          {product.img ? (
            <img
              src={product.img}
              alt={product.title}
              className="w-full h-auto object-cover rounded-xl"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 light:bg-gradient-to-br light:from-gray-200 light:to-gray-100 dark:text-gray-300 light:text-gray-600">
              No Image
            </div>
          )}
        </div>        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-4xl font-bold dark:text-white light:text-[#1F2937] mb-2">
              {product.title}
            </h1>

            <div className="flex items-center space-x-2 mb-4">
              {renderRating(reviews.length > 0 ? Math.round(getAverageRating()) : product.rating)}
              <span className="dark:text-gray-500 light:text-[#9CA3AF]">
                {reviews.length > 0 
                  ? `(${getAverageRating()} / 5) • ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                  : `(${product.rating} / 5)`
                }
              </span>
            </div>

           

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-BrightOrange">
                Rs {product.price}
              </span>
              <del className="dark:text-gray-500 light:text-[#9CA3AF] text-xl">
                Rs {product.price + 500}
              </del>
            </div>
             <p className="dark:text-gray-400 light:text-[#6B7280] leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              className="bg-BrightOrange text-white py-3 px-8 rounded-full shadow-md hover:bg-orange-600 transition duration-300"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button className="dark:bg-gray-800 light:bg-[#E5E7EB] dark:text-white light:text-[#1F2937] py-3 px-8 rounded-full shadow-md dark:hover:bg-gray-900 light:hover:bg-[#D1D5DB] transition duration-300">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold dark:text-white light:text-[#1F2937] mb-8">Recommended Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
