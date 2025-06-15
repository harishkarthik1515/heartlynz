import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  Calendar,
  Award,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { collection, getDocs, query, orderBy, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product, Order, User } from '../../types';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch products with error handling
        try {
          const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
          const productsSnapshot = await getDocs(productsQuery);
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Product[];
          setProducts(productsData);
          console.log('Products fetched:', productsData.length);
        } catch (error) {
          console.error('Error fetching products:', error);
          // Try fallback query
          const fallbackProductsQuery = query(collection(db, 'products'));
          const fallbackSnapshot = await getDocs(fallbackProductsQuery);
          const fallbackProducts = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Product[];
          setProducts(fallbackProducts);
        }

        // Fetch orders with error handling
        try {
          const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersData = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as Order[];
          setOrders(ordersData);
          console.log('Orders fetched:', ordersData.length);
        } catch (error) {
          console.error('Error fetching orders:', error);
          // Try fallback query
          const fallbackOrdersQuery = query(collection(db, 'orders'));
          const fallbackSnapshot = await getDocs(fallbackOrdersQuery);
          const fallbackOrders = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as Order[];
          setOrders(fallbackOrders);
        }

        // Fetch users with error handling
        try {
          const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
          const usersSnapshot = await getDocs(usersQuery);
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as User[];
          setUsers(usersData);
          console.log('Users fetched:', usersData.length);
        } catch (error) {
          console.error('Error fetching users:', error);
          // Try fallback query
          const fallbackUsersQuery = query(collection(db, 'users'));
          const fallbackSnapshot = await getDocs(fallbackUsersQuery);
          const fallbackUsers = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as User[];
          setUsers(fallbackUsers);
        }

        setLoading(false);
        console.log('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time listeners for orders with error handling
    try {
      const unsubscribeOrders = onSnapshot(
        query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10)),
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          })) as Order[];
          setOrders(prevOrders => {
            // Only update if we have new data
            if (ordersData.length > 0) {
              return ordersData;
            }
            return prevOrders;
          });
        },
        (error) => {
          console.error('Error in orders listener:', error);
        }
      );

      return () => {
        unsubscribeOrders();
      };
    } catch (error) {
      console.error('Error setting up listeners:', error);
    }
  }, []);

  // Calculate metrics with safe defaults
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalCustomers = users.filter(user => !user.isAdmin).length;
  const lowStockProducts = products.filter(product => (product.stockQuantity || 0) <= 5).length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  // Calculate growth (mock data for demo)
  const revenueGrowth = 15.2;
  const orderGrowth = 8.5;
  const customerGrowth = 12.3;
  const productGrowth = 5.7;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: `+${revenueGrowth}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: `+${orderGrowth}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-purple-500',
      change: `+${productGrowth}%`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'bg-rose-500',
      change: `+${customerGrowth}%`,
      changeColor: 'text-green-600'
    }
  ];

  const quickStats = [
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'This Month Orders',
      value: orders.filter(order => {
        const orderMonth = order.createdAt.getMonth();
        const currentMonth = new Date().getMonth();
        return orderMonth === currentMonth;
      }).length,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Loading your store data...</p>
        </div>
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

  if (error) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
      </div>

    

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm font-medium mt-1 ${stat.changeColor}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-rose-600 hover:text-rose-700 font-medium">View All</button>
          </div>
          
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress?.name || 'Customer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{(order.total || 0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders yet</p>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <span className="text-red-600 font-medium">{lowStockProducts} items</span>
          </div>
          
          {products.filter(product => (product.stockQuantity || 0) <= 5).length > 0 ? (
            <div className="space-y-4">
              {products.filter(product => (product.stockQuantity || 0) <= 5).slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stockQuantity || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-medium text-sm">Low Stock</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">All products are well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Add Product</h3>
            <Package className="h-6 w-6" />
          </div>
          <p className="text-rose-100 mb-4">Expand your inventory with new items</p>
          <button className="bg-white text-rose-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Add Product
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Manage Orders</h3>
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className="text-blue-100 mb-4">Process and track customer orders</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Orders
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create Offer</h3>
            <Award className="h-6 w-6" />
          </div>
          <p className="text-green-100 mb-4">Set up special promotions</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Create Offer
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-purple-100 mb-4">View detailed sales reports</p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;