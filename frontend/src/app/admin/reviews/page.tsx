"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { CheckCircle, XCircle, Flag } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: number;
  product: { title: string };
  user: { username: string };
  rating: number;
  comment: string;
  status: string;
  isFlagged: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/review");
      setReviews(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch reviews:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      // Set empty reviews on error instead of crashing
      setReviews([]);
      // Only show error toast for actual errors, not 404s
      if (err.response?.status !== 404) {
        toast.error("Failed to load reviews: " + (err.response?.data?.message || err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axiosInstance.put(`/review/${id}/status`, { status: "approved" });
      toast.success("Review approved");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to approve review");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axiosInstance.put(`/review/${id}/status`, { status: "rejected" });
      toast.success("Review rejected");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to reject review");
    }
  };

  const handleFlag = async (id: number) => {
    try {
      await axiosInstance.put(`/review/${id}/flag`);
      toast.success("Review flagged");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to flag review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400 mt-1">Moderate customer reviews</p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews yet</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{review.product.title}</p>
                  <p className="text-sm text-gray-500">by {review.user.username}</p>
                </div>
                <div className="flex gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-600"}>
                        ★
                      </span>
                    ))}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      review.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : review.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {review.status}
                  </span>
                  {review.isFlagged && (
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-medium">
                      Flagged
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="p-2 hover:bg-green-500/20 rounded text-green-400 transition"
                      title="Approve"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400 transition"
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleFlag(review.id)}
                    className={`p-2 rounded transition ${
                      review.isFlagged
                        ? "bg-orange-500/20 text-orange-400"
                        : "hover:bg-orange-500/20 text-gray-400"
                    }`}
                    title="Flag"
                  >
                    <Flag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
