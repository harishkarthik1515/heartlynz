import { RAZORPAY_CONFIG, loadRazorpayScript, RazorpayOptions, RazorpayResponse } from '../config/razorpay';
import { CartItem } from '../types';
import toast from 'react-hot-toast';

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Process Razorpay Payment - Simplified for testing
  async processPayment(
    amount: number,
    orderDetails: {
      orderId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      address: string;
      items: CartItem[];
    }
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      console.log('Starting payment process for amount:', amount);
      
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      console.log('Razorpay script loaded successfully');

      // Check if we have a valid key
      if (!RAZORPAY_CONFIG.KEY_ID || RAZORPAY_CONFIG.KEY_ID === 'rzp_test_1234567890') {
        console.warn('Using placeholder Razorpay key. Please update with your actual test key.');
        // For demo purposes, we'll still proceed but show a warning
        toast.error('Demo mode: Please configure actual Razorpay credentials');
      }

      return new Promise((resolve) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_CONFIG.KEY_ID,
          amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
          currency: RAZORPAY_CONFIG.CURRENCY,
          name: RAZORPAY_CONFIG.COMPANY_NAME,
          description: `Payment for Order #${orderDetails.orderId}`,
          image: RAZORPAY_CONFIG.COMPANY_LOGO,
          handler: async (response: RazorpayResponse) => {
            console.log('Payment successful:', response);
            toast.success('Payment successful!');
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id
            });
          },
          prefill: {
            name: orderDetails.customerName,
            email: orderDetails.customerEmail,
            contact: orderDetails.customerPhone
          },
          notes: {
            address: orderDetails.address
          },
          theme: RAZORPAY_CONFIG.THEME,
          modal: {
            ondismiss: () => {
              console.log('Payment modal dismissed');
              toast.error('Payment cancelled');
              resolve({
                success: false,
                error: 'Payment cancelled by user'
              });
            }
          }
        };

        console.log('Opening Razorpay with options:', options);

        try {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error) {
          console.error('Error opening Razorpay:', error);
          resolve({
            success: false,
            error: 'Failed to open payment gateway'
          });
        }
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Test Razorpay Integration
  async testRazorpayIntegration(): Promise<boolean> {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        console.error('Failed to load Razorpay script');
        return false;
      }

      if (!window.Razorpay) {
        console.error('Razorpay object not available');
        return false;
      }

      console.log('Razorpay integration test passed');
      return true;
    } catch (error) {
      console.error('Razorpay integration test failed:', error);
      return false;
    }
  }

  // Get Payment Status (Mock implementation)
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      console.log('Getting payment status for:', paymentId);
      
      return {
        id: paymentId,
        status: 'captured',
        amount: 100000, // Amount in paise
        currency: 'INR',
        method: 'card',
        captured: true,
        created_at: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

export const paymentService = PaymentService.getInstance();