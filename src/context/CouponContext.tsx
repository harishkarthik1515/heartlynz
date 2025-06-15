import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Coupon } from '../types';
import toast from 'react-hot-toast';

interface CouponContextType {
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, orderTotal: number, categories: string[]) => Promise<boolean>;
  removeCoupon: () => void;
  calculateDiscount: (orderTotal: number) => number;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const validateCoupon = (coupon: Coupon, orderTotal: number, categories: string[]): boolean => {
    const now = new Date();
    
    console.log('Validating coupon:', {
      code: coupon.code,
      isActive: coupon.isActive,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      now,
      orderTotal,
      minOrderAmount: coupon.minOrderAmount
    });
    
    // Check if coupon is active
    if (!coupon.isActive) {
      toast.error('This coupon is not active');
      return false;
    }

    // Check validity dates
    if (now < coupon.validFrom || now > coupon.validUntil) {
      toast.error('This coupon has expired or is not yet valid');
      return false;
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      toast.error('This coupon has reached its usage limit');
      return false;
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      toast.error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
      return false;
    }

    // Check applicable categories
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = categories.some(category => 
        coupon.applicableCategories!.includes(category)
      );
      if (!hasApplicableCategory) {
        toast.error('This coupon is not applicable to items in your cart');
        return false;
      }
    }

    return true;
  };

  const applyCoupon = async (code: string, orderTotal: number, categories: string[]): Promise<boolean> => {
    try {
      console.log('Applying coupon:', { code, orderTotal, categories });
      
      const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('Invalid coupon code');
        return false;
      }

      const couponDoc = querySnapshot.docs[0];
      const coupon = {
        id: couponDoc.id,
        ...couponDoc.data(),
        validFrom: couponDoc.data().validFrom?.toDate() || new Date(),
        validUntil: couponDoc.data().validUntil?.toDate() || new Date(),
        createdAt: couponDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: couponDoc.data().updatedAt?.toDate() || new Date()
      } as Coupon;

      console.log('Found coupon:', coupon);

      if (validateCoupon(coupon, orderTotal, categories)) {
        setAppliedCoupon(coupon);
        const discountAmount = calculateDiscountAmount(coupon, orderTotal);
        console.log('Coupon applied successfully, discount:', discountAmount);
        toast.success(`Coupon applied! You saved ₹${discountAmount.toLocaleString()}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    console.log('Removing coupon');
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const calculateDiscountAmount = (coupon: Coupon, orderTotal: number): number => {
    let discount = 0;
    
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }
    
    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);
    
    console.log('Calculated discount:', {
      couponType: coupon.discountType,
      discountValue: coupon.discountValue,
      orderTotal,
      maxDiscountAmount: coupon.maxDiscountAmount,
      finalDiscount: discount
    });
    
    return discount;
  };

  const calculateDiscount = useCallback((orderTotal: number): number => {
    if (!appliedCoupon) {
      console.log('No applied coupon, discount = 0');
      return 0;
    }
    
    const discount = calculateDiscountAmount(appliedCoupon, orderTotal);
    console.log('calculateDiscount called:', { orderTotal, discount, coupon: appliedCoupon.code });
    return discount;
  }, [appliedCoupon]);

  const value = {
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    calculateDiscount
  };

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};