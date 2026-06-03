import { axiosInstance } from './api';

/**
 * Fetch all orders from the backend
 */
export const fetchAllOrders = async () => {
  try {
    const res = await axiosInstance.get('/order', { params: { skip: 0, take: 10000 } });
    return res.data.data || [];
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    return [];
  }
};

/**
 * Fetch all products from the backend
 */
export const fetchAllProducts = async () => {
  try {
    const res = await axiosInstance.get('/product/all');
    return res.data || [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
};

/**
 * Fetch all users from the backend
 */
export const fetchAllUsers = async () => {
  try {
    const res = await axiosInstance.get('/user/all');
    return res.data || [];
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return [];
  }
};

/**
 * Calculate sales data by date
 */
export const calculateSalesData = (orders, dateRange = '30days') => {
  const salesMap = {};
  const now = new Date();
  let startDate = new Date();
  let maxDays = 7;

  // Set start date based on range
  if (dateRange === '7days') {
    startDate.setDate(now.getDate() - 7);
    maxDays = 7;
  } else if (dateRange === '30days') {
    startDate.setDate(now.getDate() - 30);
    maxDays = 30;
  } else if (dateRange === '90days') {
    startDate.setDate(now.getDate() - 90);
    maxDays = 90;
  } else if (dateRange === '1year') {
    startDate.setFullYear(now.getFullYear() - 1);
    maxDays = 365;
  }

  // Initialize sales map with dates
  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    salesMap[dateStr] = { date: dateStr, sales: 0, revenue: 0, orders: 0 };
  }

  // Aggregate order data
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= startDate && orderDate <= now) {
      const dateStr = orderDate.toISOString().split('T')[0];
      if (salesMap[dateStr]) {
        salesMap[dateStr].orders += 1;
        salesMap[dateStr].revenue += parseFloat(order.totalAmount) || 0;
        salesMap[dateStr].sales += order.items?.length || 1;
      }
    }
  });

  const result = Object.values(salesMap).filter((d) => d.orders > 0 || d.revenue > 0);
  
  // Return last N days worth of data, or last 7 days if no data
  const numDaysToShow = maxDays >= 90 ? 7 : Math.min(7, maxDays);
  return result.slice(-numDaysToShow).length > 0 ? result.slice(-numDaysToShow) : Object.values(salesMap).slice(-7);
};

/**
 * Calculate monthly revenue data
 */
export const calculateMonthlyRevenue = (orders) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const revenueMap = {};

  // Initialize revenue for last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    revenueMap[monthKey] = { month: months[d.getMonth()], revenue: 0, target: 500000 + i * 50000 };
  }

  // Aggregate revenue by month
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    if (revenueMap[monthKey]) {
      revenueMap[monthKey].revenue += parseFloat(order.totalAmount) || 0;
    }
  });

  return Object.values(revenueMap);
};

/**
 * Calculate top selling products
 */
export const calculateTopProducts = (orders) => {
  const productMap = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const productId = item.productId;
      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: item.product?.title || `Product ${productId}`,
          sold: 0,
          revenue: 0,
        };
      }
      productMap[productId].sold += item.quantity || 1;
      productMap[productId].revenue += parseFloat(item.price) * (item.quantity || 1) || 0;
    });
  });

  return Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

/**
 * Calculate customer statistics
 */
export const calculateCustomerStats = (orders, users) => {
  // Count new customers (without a reliable createdAt field, we estimate based on order dates)
  // If no createdAt field, count first-time customers (users with only recent orders)
  const usersWithOrders = new Map();
  
  orders.forEach((order) => {
    if (order.userId) {
      if (!usersWithOrders.has(order.userId)) {
        usersWithOrders.set(order.userId, []);
      }
      usersWithOrders.get(order.userId).push(new Date(order.createdAt));
    }
  });

  // Estimate new customers as those with first order in last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newCustomersEstimate = Array.from(usersWithOrders.entries()).filter(([userId, orderDates]) => {
    const firstOrder = new Date(Math.min(...orderDates.map(d => d.getTime())));
    return firstOrder >= thirtyDaysAgo;
  }).length;

  const activeOrdersCount = orders.filter(
    (o) => o.fulfillmentStatus !== 'delivered' && o.fulfillmentStatus !== 'cancelled'
  ).length;

  const returningCustomers = usersWithOrders.size - newCustomersEstimate;

  return {
    total: users.length,
    new: newCustomersEstimate,
    returning: Math.max(0, returningCustomers),
    activeOrders: activeOrdersCount,
  };
};

/**
 * Fetch all reports data
 */
export const fetchReportsData = async (dateRange = '30days') => {
  try {
    const [orders, products, users] = await Promise.all([fetchAllOrders(), fetchAllProducts(), fetchAllUsers()]);

    const salesData = calculateSalesData(orders, dateRange);
    const revenueData = calculateMonthlyRevenue(orders);
    const topProducts = calculateTopProducts(orders);
    const customerStats = calculateCustomerStats(orders, users);

    return {
      salesData,
      revenueData,
      topProducts,
      customerStats,
    };
  } catch (err) {
    console.error('Failed to fetch reports data:', err);
    return {
      salesData: [],
      revenueData: [],
      topProducts: [],
      customerStats: { total: 0, new: 0, returning: 0, activeOrders: 0 },
    };
  }
};
