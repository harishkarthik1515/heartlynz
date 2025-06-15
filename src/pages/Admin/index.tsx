import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import OffersManager from './OffersManager';
import CouponsManager from './CouponsManager';
import CustomersManager from './CustomersManager';
import AnalyticsManager from './AnalyticsManager';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Gift,
  Ticket
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user is admin
  if (!currentUser || !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'offers', label: 'Offers', icon: Gift },
    { key: 'coupons', label: 'Coupons', icon: Ticket },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'offers':
        return <OffersManager />;
      case 'coupons':
        return <CouponsManager />;
      case 'customers':
        return <CustomersManager />;
      case 'analytics':
        return <AnalyticsManager />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-600">System settings and configuration options coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src="/WhatsApp Image 2025-06-14 at 23.03.30_094c26b3.jpg" 
              alt="Heartlynz" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Heartlynz</h2>
              <p className="text-sm text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.key
                    ? 'bg-rose-50 text-rose-600 border-r-2 border-rose-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-rose-600 font-semibold text-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;