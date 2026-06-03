"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/app/utils/api";
import { ArrowLeft, Download, Truck, Check } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: { title: string; img: string };
  productSnapshot?: any;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
  user?: { username: string; email: string; phone: string };
}

const fulfillmentStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/order/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      await axiosInstance.put(`/order/${orderId}/status`, {
        fulfillmentStatus: newStatus,
      });
      setOrder({ ...order, fulfillmentStatus: newStatus });
      toast.success("Order status updated");
    } catch (err) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdatingPayment(true);
      await axiosInstance.put(`/order/${orderId}/status`, {
        paymentStatus: newStatus,
      });
      setOrder({ ...order, paymentStatus: newStatus });
      toast.success(`Payment marked as ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleExportInvoice = () => {
    if (!order) {
      toast.error("Order data not loaded");
      return;
    }

    try {
      // Generate items rows
      const itemsRows = order.items
        .map(
          (item) =>
            `<tr>
              <td>${item.product?.title || "Product"}</td>
              <td>${item.quantity}</td>
              <td>Rs ${item.price}</td>
              <td>Rs ${item.price * item.quantity}</td>
            </tr>`
        )
        .join("");

      const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${order.orderNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; background: white; }
              .invoice { max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #F97316; padding-bottom: 20px; }
              .company-info h1 { font-size: 24px; margin-bottom: 5px; }
              .invoice-info h2 { font-size: 18px; margin-bottom: 10px; }
              .invoice-info p { margin: 5px 0; }
              .bill-to { margin-bottom: 30px; }
              .bill-to h3 { margin-bottom: 10px; font-size: 14px; }
              .bill-to p { margin: 3px 0; font-size: 14px; }
              .items-table { width: 100%; margin: 30px 0; border-collapse: collapse; }
              .items-table th { background-color: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #333; font-size: 14px; }
              .items-table td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 14px; }
              .items-table tr:last-child td { border-bottom: 2px solid #333; }
              .totals { margin: 20px 0; text-align: right; }
              .totals p { margin: 8px 0; font-size: 14px; }
              .total-amount { font-size: 18px; font-weight: bold; color: #F97316; margin-top: 10px; }
              .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="invoice">
              <div class="header">
                <div class="company-info">
                  <h1>MW SPORTS</h1>
                  <p>Sports Equipment & Apparel</p>
                </div>
                <div class="invoice-info">
                  <h2>Invoice #${order.orderNumber}</h2>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Payment Status:</strong> <span style="color: ${order.paymentStatus === "paid" ? "green" : "orange"};">${order.paymentStatus.toUpperCase()}</span></p>
                </div>
              </div>

              <div class="bill-to">
                <h3>BILL TO:</h3>
                <p><strong>${order.user?.username || "Customer"}</strong></p>
                <p>${order.user?.email || "N/A"}</p>
                <p>${order.user?.phone || "N/A"}</p>
                <p>${order.shippingAddress || "N/A"}</p>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <div class="totals">
                <p><strong>Subtotal:</strong> Rs ${subtotal}</p>
                <p><strong>Shipping:</strong> Rs 0</p>
                <p class="total-amount"><strong>Total Amount:</strong> Rs ${order.totalAmount}</p>
              </div>

              <div class="footer">
                <p><strong>Payment Method:</strong> ${order.paymentMethod || "Cash on Delivery"}</p>
                <p style="margin-top: 10px;">Thank you for your business! For support, contact us at support@mwsports.com</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create a Blob from the HTML
      const blob = new Blob([invoiceHTML], { type: "text/html;charset=utf-8" });
      
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${order.orderNumber}_${new Date().getTime()}.html`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("Invoice export error:", err);
      toast.error("Failed to download invoice");
    }
  };

  if (loading || !order) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#1a1a1a] rounded w-64" />
          <div className="h-96 bg-[#1a1a1a] rounded" />
        </div>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{order.orderNumber}</h1>
            <p className="text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button 
          onClick={handleExportInvoice}
          className="bg-[#1a1a1a] hover:bg-[#222] text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Download size={18} />
          Export Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-[#222] last:border-b-0">
                  {item.product?.img && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.product.img}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.product?.title || "—"}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">Rs {item.price * item.quantity}</p>
                    <p className="text-sm text-gray-500">Rs {item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">Rs {itemsSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">Rs 0</span>
              </div>
              <div className="border-t border-[#222] pt-3 flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#F97316]">Rs {order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Name</p>
                <p className="text-white">{order.user?.username || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Email</p>
                <p className="text-white">{order.user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Phone</p>
                <p className="text-white">{order.user?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Shipping Address</p>
                <p className="text-white">{order.shippingAddress || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Payment Status</h3>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium inline-block ${
                  order.paymentStatus === "paid"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
              {order.paymentStatus !== "paid" && (
                <button
                  onClick={() => handleUpdatePaymentStatus("paid")}
                  disabled={updatingPayment}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Check size={14} />
                  Mark Paid
                </button>
              )}
            </div>
          </div>

          {/* Fulfillment Status */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Fulfillment Status</h3>
            <select
              value={order.fulfillmentStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={updating}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F97316] disabled:opacity-50"
            >
              {fulfillmentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Payment Method</h3>
            <p className="text-gray-300">{order.paymentMethod || "Cash on Delivery"}</p>
          </div>

          {/* Timeline */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
            <div className="space-y-3">
              {["pending", "confirmed", "shipped", "delivered"].map((status, idx) => (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        fulfillmentStatuses.indexOf(order.fulfillmentStatus) >= idx
                          ? "bg-[#F97316]"
                          : "bg-[#222]"
                      }`}
                    />
                    {idx < 3 && (
                      <div
                        className={`w-0.5 h-8 ${
                          fulfillmentStatuses.indexOf(order.fulfillmentStatus) > idx
                            ? "bg-[#F97316]"
                            : "bg-[#222]"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
