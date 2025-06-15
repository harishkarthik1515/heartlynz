import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Package, Heart, Settings, Calendar, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { wishlistItems } = useWishlist();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Fetch user's orders
  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching orders for user:', currentUser.id);
      
      // Try with orderBy first
      let q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.id),
        orderBy('createdAt', 'desc')
      );
      
      let querySnapshot = await getDocs(q);
      console.log('Orders found with orderBy:', querySnapshot.docs.length);
      
      // If no results with orderBy, try without it
      if (querySnapshot.docs.length === 0) {
        console.log('No orders found with orderBy, trying simple query...');
        q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.id)
        );
        
        querySnapshot = await getDocs(q);
        console.log('Orders found with simple query:', querySnapshot.docs.length);
      }
      
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Order data:', { id: doc.id, userId: data.userId, total: data.total });
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Order;
      });
      
      // Sort client-side if we used the simple query
      if (querySnapshot.docs.length > 0 && !ordersData[0].createdAt) {
        ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      console.log('Final orders data:', ordersData);
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try refreshing.');
      
      // Fallback: try the most basic query
      try {
        console.log('Trying fallback query...');
        const fallbackQuery = query(collection(db, 'orders'));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        const allOrders = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Order[];
        
        // Filter for current user
        const userOrders = allOrders.filter(order => order.userId === currentUser.id);
        console.log('Fallback orders found:', userOrders.length);
        
        setOrders(userOrders);
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Here you would typically save to Firebase
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setIsEditing(false);
  };

  // Calculate user stats from real data
  const totalOrders = orders.length;
  const totalWishlistItems = wishlistItems.length;
  const memberSince = currentUser?.createdAt ? new Date(currentUser.createdAt).getFullYear() : new Date().getFullYear();
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const stats = [
    { 
      label: 'Orders Placed', 
      value: totalOrders.toString(), 
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      link: '/orders'
    },
    { 
      label: 'Wishlist Items', 
      value: totalWishlistItems.toString(), 
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      link: '/wishlist'
    },
    { 
      label: 'Member Since', 
      value: memberSince.toString(), 
      icon: Calendar,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Please sign in to view your profile
            </h2>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="h-12 w-12 text-rose-600" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{currentUser?.name}</h1>
                <p className="text-rose-100 text-lg">{currentUser?.email}</p>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-rose-100">Active Member</span>
                </div>
                {totalSpent > 0 && (
                  <div className="mt-2">
                    <span className="text-rose-100 text-sm">Total Spent: </span>
                    <span className="text-white font-semibold">₹{totalSpent.toLocaleString()}</span>
                    {totalSpent > 10000 && (
                      <span className="ml-2 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        VIP
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  {stat.link ? (
                    <Link to={stat.link} className="block hover:transform hover:scale-105 transition-all duration-300">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:shadow-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{stat.value}</div>
                      <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{stat.label}</div>
                    </Link>
                  ) : (
                    <div className="hover:transform hover:scale-105 transition-all duration-300">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{formData.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{formData.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{formData.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{formData.city || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                      placeholder="Enter your full address"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{formData.address || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your state"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{formData.state || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your PIN code"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{formData.pincode || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5" />
                    <span>View Orders</span>
                  </div>
                  {totalOrders > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2 py-1 rounded-full group-hover:bg-rose-200">
                      {totalOrders}
                    </span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5" />
                    <span>My Wishlist</span>
                  </div>
                  {totalWishlistItems > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2 py-1 rounded-full group-hover:bg-rose-200">
                      {totalWishlistItems}
                    </span>
                  )}
                </Link>
                <Link
                  to="/products"
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
                <button
                  onClick={fetchUserOrders}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <button
                    onClick={fetchUserOrders}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh orders"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">#{order.id.slice(-8)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{order.createdAt.toLocaleDateString()}</span>
                        <span className="font-medium">₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <Link
                      to="/orders"
                      className="block text-center text-rose-600 hover:text-rose-700 font-medium text-sm mt-3"
                    >
                      View all orders
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button
                    onClick={fetchUserOrders}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh orders"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center py-6">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No orders yet</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors mt-3 text-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}

            {/* Member Benefits */}
            <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Member Benefits</h3>
              <ul className="space-y-2 text-sm text-rose-100">
                <li>• Free shipping on orders ₹999+</li>
                <li>• Early access to new collections</li>
                <li>• Exclusive member discounts</li>
                <li>• Priority customer support</li>
                {totalOrders >= 5 && <li>• 🎉 VIP Customer Status!</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;