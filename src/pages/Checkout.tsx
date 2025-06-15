import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCoupon } from '../context/CouponContext';
import { collection, addDoc, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, MapPin, User, Phone, Mail, Shield, CreditCard, Banknote } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';
import PaymentMethods from '../components/PaymentMethods';
import CouponInput from '../components/CouponInput';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { calculateDiscount, appliedCoupon } = useCoupon();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  const [shippingInfo, setShippingInfo] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const total = Math.max(0, subtotal + shipping - discount); // Ensure total is never negative
  const categories = [...new Set(cartItems.map(item => item.product.category))];

  // Update discount when coupon changes
  useEffect(() => {
    const currentDiscount = calculateDiscount(subtotal);
    console.log('Checkout: Discount updated', { currentDiscount, appliedCoupon: !!appliedCoupon });
    setDiscount(currentDiscount);
  }, [calculateDiscount, subtotal, appliedCoupon]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateShippingInfo = () => {
    const required = ['name', 'email', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!/^\d{6}$/.test(shippingInfo.pincode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return false;
    }

    return true;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingInfo()) {
      setStep(2);
    }
  };

  // Update stock quantities when order is placed
  const updateProductStock = async () => {
    try {
      const updatePromises = cartItems.map(async (item) => {
        const productRef = doc(db, 'products', item.product.id);
        await updateDoc(productRef, {
          stockQuantity: increment(-item.quantity),
          updatedAt: Timestamp.now()
        });
      });

      await Promise.all(updatePromises);
      console.log('Stock quantities updated successfully');
    } catch (error) {
      console.error('Error updating stock quantities:', error);
      // Don't throw error here as order is already created
      toast.error('Order placed but stock update failed. Admin will be notified.');
    }
  };

  const createOrder = async (paymentId?: string) => {
    if (!currentUser) {
      toast.error('Please sign in to place an order');
      navigate('/login');
      return null;
    }

    try {
      console.log('Creating order with discount:', discount);
      
      const orderData = {
        userId: currentUser.id,
        items: cartItems,
        subtotal: subtotal,
        discount: discount,
        shipping: shipping,
        total: total,
        status: 'pending',
        shippingAddress: shippingInfo,
        paymentMethod,
        paymentId: paymentId || null,
        couponCode: appliedCoupon?.code || null,
        createdAt: Timestamp.now()
      };

      console.log('Order data:', orderData);

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Update stock quantities after order is created
      await updateProductStock();
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setLoading(true);
    
    try {
      const orderId = await createOrder(paymentId);
      
      if (orderId) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleCODOrder = async () => {
    setLoading(true);
    
    try {
      const orderId = await createOrder();
      
      if (orderId) {
        clearCart();
        toast.success('Order placed successfully! Pay on delivery.');
        navigate('/orders');
      }
    } catch (error) {
      console.error('COD order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Please sign in to checkout
            </h2>
            <p className="text-gray-600 mb-8">
              You need to be signed in to place an order.
            </p>
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Debug: Subtotal: ₹{subtotal} | Discount: ₹{discount} | Shipping: ₹{shipping} | Total: ₹{total} | Coupon: {appliedCoupon?.code || 'None'}
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-rose-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-rose-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-rose-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-16 text-sm text-gray-600">
              <span className={step >= 1 ? 'text-rose-600 font-medium' : ''}>Shipping</span>
              <span className={step >= 2 ? 'text-rose-600 font-medium' : ''}>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              /* Shipping Information */
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingInfo.name}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingInfo.addressLine1}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingInfo.addressLine2}
                      onChange={handleShippingChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingInfo.pincode}
                        onChange={handleShippingChange}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="PIN Code"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            ) : (
              /* Payment Method */
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <PaymentMethods
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  
                  {paymentMethod === 'cod' ? (
                    <button
                      onClick={handleCODOrder}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Banknote className="mr-2 h-5 w-5" />
                          Place Order (COD)
                        </>
                      )}
                    </button>
                  ) : (
                    <PaymentButton
                      amount={total}
                      orderDetails={{
                        orderId: `ORD_${Date.now()}`,
                        customerName: shippingInfo.name,
                        customerEmail: shippingInfo.email,
                        customerPhone: shippingInfo.phone,
                        address: `${shippingInfo.addressLine1}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}`,
                        items: cartItems
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      disabled={loading}
                      className="flex-1 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay ₹{total.toLocaleString()}
                    </PaymentButton>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <CouponInput 
                  orderTotal={subtotal}
                  categories={categories}
                  onDiscountChange={setDiscount}
                />
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-rose-600">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Secure Checkout
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;