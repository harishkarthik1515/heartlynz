import React, { useState, useEffect } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { useCoupon } from '../context/CouponContext';

interface CouponInputProps {
  orderTotal: number;
  categories: string[];
  onDiscountChange: (discount: number) => void;
}

const CouponInput: React.FC<CouponInputProps> = ({ orderTotal, categories, onDiscountChange }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  // Update discount whenever appliedCoupon or orderTotal changes
  useEffect(() => {
    const discount = calculateDiscount(orderTotal);
    console.log('CouponInput: Calculating discount', { appliedCoupon, orderTotal, discount });
    onDiscountChange(discount);
  }, [appliedCoupon, orderTotal, calculateDiscount, onDiscountChange]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setLoading(true);
    console.log('Applying coupon:', couponCode, 'for order total:', orderTotal);
    
    const success = await applyCoupon(couponCode.trim(), orderTotal, categories);
    if (success) {
      setCouponCode('');
      // Discount will be updated via useEffect
    }
    setLoading(false);
  };

  const handleRemoveCoupon = () => {
    console.log('Removing coupon');
    removeCoupon();
    // Discount will be updated to 0 via useEffect
  };

  const discount = calculateDiscount(orderTotal);
  console.log('CouponInput render:', { appliedCoupon: !!appliedCoupon, discount, orderTotal });

  return (
    <div className="space-y-4">
      {!appliedCoupon ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Have a coupon code?
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || loading}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">{appliedCoupon.title}</p>
                <p className="text-sm text-green-600">
                  Code: <span className="font-mono font-bold">{appliedCoupon.code}</span>
                </p>
                <p className="text-sm text-green-600">
                  You saved ₹{discount.toLocaleString()}!
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="Remove coupon"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;