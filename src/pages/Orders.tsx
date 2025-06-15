import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Eye, Download, ArrowLeft, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('Fetching orders for user:', currentUser.id);
    setError(null);

    const fetchOrders = async () => {
      try {
        // Try with real-time listener first
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            console.log('Orders snapshot received, docs count:', querySnapshot.docs.length);
            
            const ordersData = querySnapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Order data:', { id: doc.id, ...data });
              
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date()
              } as Order;
            });
            
            console.log('Processed orders:', ordersData);
            setOrders(ordersData);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error('Error in orders listener:', error);
            setError('Failed to fetch orders. Please try again.');
            setLoading(false);
            
            // Fallback to one-time fetch
            fallbackFetch();
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up orders listener:', error);
        setError('Failed to fetch orders. Please try again.');
        setLoading(false);
        
        // Fallback to one-time fetch
        fallbackFetch();
      }
    };

    const fallbackFetch = async () => {
      try {
        console.log('Trying fallback fetch...');
        
        // Simple query without orderBy
        const simpleQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.id)
        );
        
        const querySnapshot = await getDocs(simpleQuery);
        console.log('Fallback query result:', querySnapshot.docs.length, 'documents');
        
        const ordersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Fallback order data:', { id: doc.id, ...data });
          
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          } as Order;
        });
        
        // Sort client-side
        ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        console.log('Fallback processed orders:', ordersData);
        setOrders(ordersData);
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        setError('Unable to load orders. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = fetchOrders();
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const refreshOrders = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Manual refresh - fetching orders...');
      
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.id)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('Manual refresh result:', querySnapshot.docs.length, 'documents');
      
      const ordersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Order;
      });
      
      // Sort client-side
      ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setOrders(ordersData);
      toast.success('Orders refreshed successfully');
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setError('Failed to refresh orders');
      toast.error('Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Please sign in to view your orders
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

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your jewelry orders</p>
            </div>
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
              <button
                onClick={refreshOrders}
                className="text-red-600 hover:text-red-700 font-medium text-sm sm:ml-auto"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 sm:mb-8">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 sm:h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 sm:h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Orders List - Mobile Optimized */
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `No ${activeTab} orders found.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                  <button
                    onClick={refreshOrders}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Orders
                  </button>
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Mobile Order Header */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                              #{order.id.slice(-8)}
                            </h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm sm:text-lg font-bold text-gray-900">
                            ₹{order.total.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Order Items Preview */}
                      <div className="mb-4">
                        {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 py-2">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {order.items.length > 2 && !isExpanded && (
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium mt-2"
                          >
                            + {order.items.length - 2} more items
                          </button>
                        )}
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </button>
                        
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium sm:hidden"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Show More
                            </>
                          )}
                        </button>
                        
                        {order.status === 'delivered' && (
                          <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Download Invoice</span>
                            <span className="sm:hidden">Invoice</span>
                          </button>
                        )}
                      </div>

                      {/* Payment Info - Mobile */}
                      {order.paymentId && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Payment ID</span>
                            <span className="font-mono text-xs font-medium text-gray-900 truncate ml-2">
                              {order.paymentId}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Timeline - Mobile Optimized */}
                    {order.status !== 'pending' && (
                      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                              <div className="w-8 sm:w-16 h-0.5 bg-green-500"></div>
                            </div>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <div className={`w-8 sm:w-16 h-0.5 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                          <div className="flex space-x-4 sm:space-x-16 text-xs text-gray-600">
                            <span>Placed</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Order Details Component - Mobile Optimized
const OrderDetails: React.FC<{
  order: Order;
  onBack: () => void;
}> = ({ order, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">#{order.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.product.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{item.product.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Price: ₹{item.product.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">{order.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                {order.status !== 'pending' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">Order is being prepared</p>
                    </div>
                  </div>
                )}
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-sm text-gray-600">Order is on the way</p>
                    </div>
                  </div>
                )}
                {order.status === 'delivered' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">Order has been delivered</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-medium font-mono text-xs">{order.paymentId || 'COD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₹{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">
                    {order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;