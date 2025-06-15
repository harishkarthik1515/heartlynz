import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, User, Search, Menu, X, Package, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CartModal from './CartModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { getCartItemsCount, isCartOpen, openCart, closeCart } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationLinks = [
    { name: 'Shop', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/WhatsApp Image 2025-06-14 at 23.03.30_094c26b3.jpg" 
                  alt="Heartlynz" 
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-rose-200 group-hover:ring-rose-400 transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Heartlynz
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-all duration-300 group ${
                    isActive(link.path)
                      ? 'text-rose-600'
                      : isScrolled 
                        ? 'text-gray-700 hover:text-rose-600' 
                        : 'text-gray-800 hover:text-rose-600'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300 group-hover:w-full ${
                    isActive(link.path) ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jewelry..."
                  className={`w-full pl-12 pr-4 py-3 text-sm rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                    isScrolled 
                      ? 'bg-gray-50 border border-gray-200 focus:bg-white' 
                      : 'bg-white/80 backdrop-blur-sm border border-white/30 focus:bg-white'
                  }`}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              </div>
            </form>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 rounded-full hover:bg-rose-50 group"
              >
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart - Now opens modal */}
              <button
                onClick={openCart}
                className="relative p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 rounded-full hover:bg-rose-50 group"
              >
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-3 text-gray-600 hover:text-rose-600 transition-all duration-300 rounded-full hover:bg-rose-50 group"
                >
                  <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
                      {currentUser ? (
                        <>
                          <div className="px-6 py-4 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-3" />
                            Orders
                          </Link>
                          {currentUser.isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 mr-3" />
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="block px-6 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="block px-6 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-300"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jewelry..."
                    className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 bg-gray-50"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </form>
              
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={closeCart} />

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;