import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User, Order } from '../../types';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Users, 
  ShoppingBag,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomersManager: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching customers and orders...');
      
      // Fetch all users first (simpler query)
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log('Raw users fetched:', usersSnapshot.docs.length);
      
      const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('User data:', { id: doc.id, ...data });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as User;
      });
      
      // Filter out admin users
      const customerUsers = allUsers.filter(user => !user.isAdmin);
      console.log('Customer users after filtering:', customerUsers.length);
      
      setCustomers(customerUsers);

      // Fetch all orders
      const ordersQuery = query(collection(db, 'orders'));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      console.log('Orders fetched:', ordersSnapshot.docs.length);
      
      const ordersData = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Order;
      });
      
      setOrders(ordersData);
      console.log('Final data - Customers:', customerUsers.length, 'Orders:', ordersData.length);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch customer data. Please try again.');
      toast.error('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate customer stats
  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter(order => order.userId === customerId);
    const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastOrderDate = customerOrders.length > 0 
      ? Math.max(...customerOrders.map(order => order.createdAt.getTime()))
      : null;

    return {
      totalOrders: customerOrders.length,
      totalSpent,
      lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : null,
      averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
    };
  };

  const exportCustomers = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Orders', 'Total Spent', 'Last Order', 'Join Date'].join(','),
      ...filteredCustomers.map(customer => {
        const stats = getCustomerStats(customer.id);
        return [
          customer.name,
          customer.email,
          stats.totalOrders,
          stats.totalSpent,
          stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never',
          customer.createdAt.toLocaleDateString()
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Customers exported successfully');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'totalSpent':
        return getCustomerStats(b.id).totalSpent - getCustomerStats(a.id).totalSpent;
      case 'totalOrders':
        return getCustomerStats(b.id).totalOrders - getCustomerStats(a.id).totalOrders;
      case 'createdAt':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  if (selectedCustomer) {
    return <CustomerDetails customer={selectedCustomer} orders={orders} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">View and manage your customers</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCustomers}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Debug: Found {customers.length} customers, {orders.length} orders
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={fetchData}
              className="ml-auto text-red-600 hover:text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(customer => {
                  const stats = getCustomerStats(customer.id);
                  return stats.lastOrderDate && 
                    (Date.now() - stats.lastOrderDate.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
                }).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(orders.reduce((sum, order) => sum + order.total, 0) / Math.max(orders.length, 1)).toLocaleString()}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(customer => getCustomerStats(customer.id).totalSpent > 10000).length}
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="totalSpent">Total Spent</option>
            <option value="totalOrders">Total Orders</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading customers...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Orders</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Last Order</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const stats = getCustomerStats(customer.id);
                  const isVIP = stats.totalSpent > 10000;
                  
                  return (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <span className="text-rose-600 font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{customer.name}</span>
                              {isVIP && (
                                <Award className="h-4 w-4 text-yellow-500" title="VIP Customer" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">{stats.totalOrders}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">₹{stats.totalSpent.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {customer.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="flex items-center text-rose-600 hover:text-rose-700 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Customers will appear here when they register'
              }
            </p>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Customer Details Component
const CustomerDetails: React.FC<{
  customer: User;
  orders: Order[];
  onBack: () => void;
}> = ({ customer, orders, onBack }) => {
  const customerOrders = orders.filter(order => order.userId === customer.id);
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Customers
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
            <p className="text-gray-600">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-rose-600">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-gray-600">{customer.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">Joined {customer.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Stats</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{customerOrders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order</span>
                <span className="font-medium">₹{Math.round(averageOrderValue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Type</span>
                <span className={`font-medium ${totalSpent > 10000 ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {totalSpent > 10000 ? 'VIP' : 'Regular'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Order History</h4>
            
            {customerOrders.length > 0 ? (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">Order #{order.id.slice(-8)}</h5>
                        <p className="text-sm text-gray-600">{order.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{order.total.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • 
                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersManager;