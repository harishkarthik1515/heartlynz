import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order, Product, User } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Package,
  Target,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

const AnalyticsManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Order[];
        setOrders(ordersData);

        // Fetch products
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Product[];
        setProducts(productsData);

        // Fetch users
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as User[];
        setUsers(usersData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by date range
  const getFilteredOrders = () => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => order.createdAt >= cutoffDate);
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = users.filter(user => !user.isAdmin).length;

  // Calculate growth (comparing with previous period)
  const getPreviousPeriodOrders = () => {
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days * 2));
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    
    return orders.filter(order => order.createdAt >= startDate && order.createdAt < endDate);
  };

  const previousOrders = getPreviousPeriodOrders();
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const orderGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

  // Top selling products
  const getTopProducts = () => {
    const productSales: { [key: string]: { product: Product; quantity: number; revenue: number } } = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            product: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product.id].quantity += item.quantity;
        productSales[item.product.id].revenue += item.product.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();

  // Sales by category
  const getSalesByCategory = () => {
    const categorySales: { [key: string]: number } = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!categorySales[item.product.category]) {
          categorySales[item.product.category] = 0;
        }
        categorySales[item.product.category] += item.product.price * item.quantity;
      });
    });

    return Object.entries(categorySales)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const salesByCategory = getSalesByCategory();

  // Monthly revenue data (last 6 months)
  const getMonthlyRevenue = () => {
    const monthlyData: { [key: string]: number } = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    orders.forEach(order => {
      const monthKey = order.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += order.total;
      }
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
  };

  const monthlyRevenue = getMonthlyRevenue();

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      changeColor: revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: `${orderGrowth >= 0 ? '+' : ''}${orderGrowth.toFixed(1)}%`,
      changeColor: orderGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Order Value',
      value: `₹${Math.round(averageOrderValue).toLocaleString()}`,
      change: '+5.2%',
      changeColor: 'text-green-600',
      icon: Target,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      change: '+12.3%',
      changeColor: 'text-green-600',
      icon: Users,
      color: 'bg-rose-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.changeColor}`}>
                  {stat.change} from last period
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {monthlyRevenue.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.max(10, (data.revenue / Math.max(...monthlyRevenue.map(d => d.revenue))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ₹{data.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-rose-600">{index + 1}</span>
                  </div>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Sold: {item.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No sales data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Category */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {salesByCategory.length > 0 ? (
            <div className="space-y-4">
              {salesByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">{item.category}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (item.revenue / Math.max(...salesByCategory.map(d => d.revenue))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      ₹{item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No category data available</p>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
              const count = filteredOrders.filter(order => order.status === status).length;
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'processing' ? 'bg-blue-500' :
                          status === 'shipped' ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-semibold mb-2">Best Performing Category</h4>
            <p className="text-rose-100">
              {salesByCategory.length > 0 ? (
                <>
                  <span className="capitalize font-medium">{salesByCategory[0].category}</span> leads with 
                  ₹{salesByCategory[0].revenue.toLocaleString()} in sales
                </>
              ) : (
                'No data available'
              )}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-semibold mb-2">Growth Trend</h4>
            <p className="text-rose-100">
              Revenue is {revenueGrowth >= 0 ? 'up' : 'down'} by {Math.abs(revenueGrowth).toFixed(1)}% 
              compared to the previous period
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-semibold mb-2">Customer Behavior</h4>
            <p className="text-rose-100">
              Average order value is ₹{Math.round(averageOrderValue).toLocaleString()}, 
              with {totalOrders} orders in the selected period
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;