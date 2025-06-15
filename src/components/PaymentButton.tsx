import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, Shield, Lock, AlertCircle } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { CartItem } from '../types';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  amount: number;
  orderDetails: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    items: CartItem[];
  };
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  orderDetails,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children
}) => {
  const [processing, setProcessing] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    // Test Razorpay integration on component mount
    const testIntegration = async () => {
      const isReady = await paymentService.testRazorpayIntegration();
      setRazorpayReady(isReady);
      
      if (!isReady) {
        console.error('Razorpay integration test failed');
      }
    };

    testIntegration();
  }, []);

  const handlePayment = async () => {
    if (processing || disabled) return;

    if (!razorpayReady) {
      toast.error('Payment gateway not ready. Please refresh the page.');
      return;
    }

    // Validate required fields
    if (!orderDetails.customerName || !orderDetails.customerEmail || !orderDetails.customerPhone) {
      toast.error('Please fill in all required customer details');
      return;
    }

    if (amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    setProcessing(true);
    
    try {
      console.log('Initiating payment for:', {
        amount,
        orderId: orderDetails.orderId,
        customer: orderDetails.customerName
      });

      const result = await paymentService.processPayment(amount, orderDetails);
      
      if (result.success && result.paymentId) {
        onSuccess(result.paymentId);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Razorpay Status Indicator */}
      {!razorpayReady && (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Payment gateway is loading...</span>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={disabled || processing || !razorpayReady}
        className={`relative overflow-hidden group transition-all duration-300 ${className} ${
          disabled || processing || !razorpayReady 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
        
        {/* Content */}
        <div className="relative flex items-center justify-center space-x-3 px-6 py-3">
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-semibold">Processing Payment...</span>
            </>
          ) : !razorpayReady ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-semibold">Loading Gateway...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">
                {children || `Pay ₹${amount.toLocaleString()}`}
              </span>
            </>
          )}
        </div>
        
        {/* Security indicators */}
        <div className="absolute top-1 right-1 flex space-x-1">
          <Shield className="h-3 w-3 text-white/70" />
          <Lock className="h-3 w-3 text-white/70" />
        </div>
      </button>

      {/* Payment Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by Razorpay • Secure payments
        </p>
        {!razorpayReady && (
          <p className="text-xs text-amber-600 mt-1">
            Please ensure you have a stable internet connection
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentButton;