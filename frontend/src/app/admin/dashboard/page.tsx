"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/app/utils/api";
import { TrendingUp, TrendingDown, Package, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";

interface KPI {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  status: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  user?: { username: string; email: string };
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxRevenue, setMaxRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch basic stats
        const productsRes = await axiosInstance.get("/product/all");
        let orders: any[] = [];
        let users: any[] = [];

        try {
          const ordersRes = await axiosInstance.get("/order");
          orders = ordersRes.data?.data || [];
        } catch (err: any) {
          console.error("Failed to fetch orders:", err.response?.status);
          orders = [];
        }

        try {
          const usersRes = await axiosInstance.get("/user/all");
          users = usersRes.data || [];
        } catch (err: any) {
          console.error("Failed to fetch users:", err.response?.status);
          users = [];
        }

        const products = productsRes.data || [];

        // Calculate revenue from delivered orders with paid payment status
        const paidDeliveredRevenue = orders
          .filter((order: any) => order.fulfillmentStatus === "delivered" && order.paymentStatus === "paid")
          .reduce((total: number, order: any) => total + (Number(order.totalAmount) || 0), 0);

        // Calculate revenue breakdown by fulfillment status
        const statusRevenue: Record<string, { revenue: number; count: number }> = {
          delivered: { revenue: 0, count: 0 },
          shipped: { revenue: 0, count: 0 },
          confirmed: { revenue: 0, count: 0 },
          pending: { revenue: 0, count: 0 },
        };

        orders.forEach((order: any) => {
          const status = order.fulfillmentStatus || "pending";
          if (statusRevenue[status]) {
            statusRevenue[status].revenue += Number(order.totalAmount) || 0;
            statusRevenue[status].count += 1;
          }
        });

        const chartDataArray: ChartData[] = Object.entries(statusRevenue).map(([status, data]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          revenue: Math.round(data.revenue),
          orders: data.count,
        }));

        setRecentOrders(orders.slice(0, 3));

        const maxRev = Math.max(...chartDataArray.map((d) => d.revenue), 1);
        setMaxRevenue(maxRev);
        setChartData(chartDataArray);

        setKpis([
          {
            label: "Total Products",
            value: products.length,
            change: 12,
            icon: <Package className="w-6 h-6" />,
            color: "bg-blue-500/10 text-blue-500",
          },
          {
            label: "Total Orders",
            value: orders.length,
            change: -5,
            icon: <ShoppingBag className="w-6 h-6" />,
            color: "bg-green-500/10 text-green-500",
          },
          {
            label: "Total Customers",
            value: users.length,
            change: 8,
            icon: <Users className="w-6 h-6" />,
            color: "bg-purple-500/10 text-purple-500",
          },
          {
            label: "Revenue (Delivered & Paid)",
            value: `Rs ${paidDeliveredRevenue.toFixed(0)}`,
            change: 0,
            icon: <ShoppingBag className="w-6 h-6" />,
            color: "bg-orange-500/10 text-[#F97316]",
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to your admin panel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-[#111] border border-[#222] rounded-xl p-6 h-32 animate-pulse"
                />
              ))
          : kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#333] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {kpi.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      kpi.change >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(kpi.change)}% vs last week
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Trend by Status</h2>
          <div className="space-y-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Loading chart...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="w-full h-64 relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 250"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1="50"
                      y1={50 + (i * 40)}
                      x2="480"
                      y2={50 + (i * 40)}
                      stroke="#333"
                      strokeDasharray="2,2"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes */}
                  <line x1="50" y1="50" x2="50" y2="210" stroke="#666" strokeWidth="2" />
                  <line x1="50" y1="210" x2="480" y2="210" stroke="#666" strokeWidth="2" />

                  {/* Y-axis labels */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const value = Math.round((maxRevenue / 4) * (4 - i));
                    return (
                      <text
                        key={`y-label-${i}`}
                        x="40"
                        y={55 + i * 40}
                        fontSize="12"
                        fill="#999"
                        textAnchor="end"
                      >
                        Rs {(value / 1000).toFixed(0)}k
                      </text>
                    );
                  })}

                  {/* Data line and points */}
                  {chartData.length > 0 && (
                    <>
                      {/* Polyline connecting points */}
                      <polyline
                        points={chartData
                          .map((item, idx) => {
                            const x = 80 + (idx * 100);
                            const y = 210 - (item.revenue / maxRevenue) * 160;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      {chartData.map((item, idx) => {
                        const x = 80 + idx * 100;
                        const y = 210 - (item.revenue / maxRevenue) * 160;
                        return (
                          <g key={`point-${idx}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r="6"
                              fill="#F97316"
                              stroke="#111"
                              strokeWidth="2"
                            />
                            <text
                              x={x}
                              y={230}
                              fontSize="12"
                              fill="#999"
                              textAnchor="middle"
                            >
                              {item.status}
                            </text>
                            <text
                              x={x}
                              y={y - 12}
                              fontSize="11"
                              fill="#F97316"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              Rs {(item.revenue / 1000).toFixed(0)}k
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}
                </svg>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {order.customerName || order.user?.username || order.customerEmail || "Customer"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">Rs {Number(order.totalAmount) || 0}</p>
                      <p className="text-xs text-gray-400 capitalize">{order.fulfillmentStatus}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-3 bg-[#1a1a1a] rounded-lg text-sm text-gray-400">
                No recent orders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
