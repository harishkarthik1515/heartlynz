import React from 'react';
import { CreditCard, Smartphone, Wallet, Banknote, Shield, Check, AlertCircle } from 'lucide-react';

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ selectedMethod, onMethodChange }) => {
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Online Payment',
      description: 'Credit/Debit Cards, UPI, Net Banking, Wallets',
      icon: CreditCard,
      popular: true,
      features: ['Instant Payment', 'Secure', 'Multiple Options'],
      testMode: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Banknote,
      features: ['No advance payment', 'Cash/Card at delivery']
    }
  ];

  return (
    <div className="space-y-4">
      {/* Razorpay Security Badge */}
      <div className="flex items-center justify-center space-x-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          Secure payments powered by Razorpay
        </span>
      </div>

      

      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
            selectedMethod === method.id
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onMethodChange(method.id)}
        >
          {/* Popular badge */}
          {method.popular && (
            <div className="absolute -top-2 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
          )}

          {/* Test mode badge */}
          {method.testMode && (
            <div className="absolute -top-2 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              TEST MODE
            </div>
          )}

          <div className="flex items-start space-x-4">
            {/* Radio button */}
            <div className="flex-shrink-0 mt-1">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedMethod === method.id && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>

            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
              selectedMethod === method.id
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <method.icon className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{method.description}</p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {method.features.map((feature, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedMethod === method.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Security notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Secure Payments</h4>
            <p className="text-sm text-gray-600">
              Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default PaymentMethods;