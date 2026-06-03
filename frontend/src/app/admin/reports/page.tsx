"use client";

import { useState, useEffect } from "react";
import { Download, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import toast from "react-hot-toast";
import { fetchReportsData } from "@/app/utils/reportsApi";

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface ProductStats {
  name: string;
  sold: number;
  revenue: number;
}

interface CustomerStats {
  total: number;
  new: number;
  returning: number;
  activeOrders: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "products" | "customers">("overview");
  const [dateRange, setDateRange] = useState("30days");

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStats[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    total: 0,
    new: 0,
    returning: 0,
    activeOrders: 0,
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReportsData(dateRange);
      setSalesData(data.salesData);
      setRevenueData(data.revenueData);
      setTopProducts(data.topProducts);
      setCustomerStats(data.customerStats);
      toast.success("Reports updated with real-time data");
    } catch (err) {
      console.error("Failed to load reports:", err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`);
    // Implement export logic here
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const maxSales = Math.max(...salesData.map((d) => d.revenue), 1);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 mt-1">View sales, revenue, and customer analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {["7days", "30days", "90days", "1year"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg transition ${
              dateRange === range
                ? "bg-[#F97316] text-white"
                : "bg-[#111] border border-[#222] text-gray-300 hover:text-white"
            }`}
          >
            {range === "7days"
              ? "Last 7 Days"
              : range === "30days"
              ? "Last 30 Days"
              : range === "90days"
              ? "Last 90 Days"
              : "Last Year"}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-[#222]">
        {["overview", "sales", "products", "customers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-6 py-3 font-semibold transition capitalize ${
              activeTab === tab
                ? "border-b-2 border-[#F97316] text-[#F97316]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {(salesData.reduce((sum, d) => sum + d.revenue, 0) / 100000).toFixed(1)}L
                  </p>
                </div>
                <TrendingUp className="text-green-400" size={32} />
              </div>
              <p className="text-xs text-green-400 mt-2">+12% vs last period</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Orders</p>
                  <p className="text-2xl font-bold text-white">
                    {salesData.reduce((sum, d) => sum + d.orders, 0)}
                  </p>
                </div>
                <BarChart3 className="text-blue-400" size={32} />
              </div>
              <p className="text-xs text-blue-400 mt-2">+8% vs last period</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Avg Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    {(
                      salesData.reduce((sum, d) => sum + d.revenue, 0) /
                      salesData.reduce((sum, d) => sum + d.orders, 0)
                    ).toFixed(0)}
                  </p>
                </div>
                <PieChartIcon className="text-purple-400" size={32} />
              </div>
              <p className="text-xs text-purple-400 mt-2">+3% vs last period</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">3.24%</p>
                </div>
                <TrendingDown className="text-orange-400" size={32} />
              </div>
              <p className="text-xs text-orange-400 mt-2">-0.5% vs last period</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {salesData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gradient-to-t from-[#F97316] to-orange-400 rounded-t" style={{ height: `${(data.revenue / maxSales) * 200}px` }} />
                    <span className="text-xs text-gray-400 mt-2">{data.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
              <div className="space-y-4">
                {revenueData.map((data) => (
                  <div key={data.month}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300">{data.month}</span>
                      <span className="text-sm font-semibold text-white">
                        {(data.revenue / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="w-full bg-[#0a0a0a] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#F97316] to-orange-400 h-2 rounded-full"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {(data.target / 100000).toFixed(1)}L
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Units Sold</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Orders</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Revenue</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Growth</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((data, idx) => {
                  const prevRevenue = idx > 0 ? salesData[idx - 1].revenue : data.revenue;
                  const growth = calculateGrowth(data.revenue, prevRevenue);
                  return (
                    <tr key={idx} className="border-b border-[#222] hover:bg-[#0a0a0a]/50">
                      <td className="px-4 py-3 text-sm text-white">{data.date}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-300">{data.sales}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-300">{data.orders}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-white">
                        {(data.revenue / 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            growth > 0
                              ? "bg-green-500/20 text-green-400"
                              : growth < 0
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center font-bold text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.sold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#F97316]">
                      {(product.revenue / 100000).toFixed(2)}L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Category Performance</h3>
            <div className="space-y-4">
              {[
                { name: "Cricket Equipment", revenue: 345000, percentage: 35 },
                { name: "Badminton Gear", revenue: 280000, percentage: 28 },
                { name: "Tennis Gear", revenue: 230000, percentage: 23 },
                { name: "Other Sports", revenue: 145000, percentage: 14 },
              ].map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">{cat.name}</span>
                    <span className="text-sm font-semibold text-white">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] rounded-full h-3">
                    <div
                      className="bg-[#F97316] h-3 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Total Customers</p>
              <p className="text-3xl font-bold text-white">{customerStats.total}</p>
              <p className="text-xs text-green-400 mt-2">+45 this month</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">New Customers</p>
              <p className="text-3xl font-bold text-[#F97316]">{customerStats.new}</p>
              <p className="text-xs text-orange-400 mt-2">+12% vs last month</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Returning Customers</p>
              <p className="text-3xl font-bold text-green-400">{customerStats.returning}</p>
              <p className="text-xs text-green-400 mt-2">93% retention rate</p>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-2">Active Orders</p>
              <p className="text-3xl font-bold text-blue-400">{customerStats.activeOrders}</p>
              <p className="text-xs text-blue-400 mt-2">+23 today</p>
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Segmentation</h3>
            <div className="space-y-4">
              {[
                { segment: "VIP Customers", count: 156, percentage: 6.1 },
                { segment: "Regular Customers", count: 1247, percentage: 49.0 },
                { segment: "Occasional Customers", count: 951, percentage: 37.4 },
                { segment: "Inactive Customers", count: 189, percentage: 7.4 },
              ].map((seg, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{seg.segment}</p>
                    <p className="text-xs text-gray-400">{seg.count} customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#F97316]">{seg.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
