// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Test Key ID - You need to replace this with your actual test key from Razorpay Dashboard
   KEY_ID: 'rzp_test_3TGjwTpqzzzyiz',
  
  // Test Key Secret - Replace with your actual secret (keep this secure on backend)
  KEY_SECRET: 'DjZvJczdajxaQQAQF3so54Xx', // This is just for reference, don't use in frontend
  
  // Company Details
  COMPANY_NAME: 'Heartlynz',
  COMPANY_LOGO: '/WhatsApp Image 2025-06-14 at 23.03.30_094c26b3.jpg',
  
  // Currency
  CURRENCY: 'INR',
  
  // Theme Configuration
  THEME: {
    color: '#e11d48', // Rose-600
    backdrop_color: 'rgba(0, 0, 0, 0.7)'
  },
  
  // Modal Configuration
  MODAL: {
    ondismiss: () => {
      console.log('Payment modal dismissed');
    },
    escape: true,
    animation: true
  }
};

// Razorpay Script Loader
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Types for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: any;
  created_at: number;
}