import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-bold">Heartlynz</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Handcrafted with love, each piece tells a story. Discover unique jewelry that speaks to your heart.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=bracelets" className="text-gray-300 hover:text-white transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link to="/products?category=necklaces" className="text-gray-300 hover:text-white transition-colors">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/products?category=earrings" className="text-gray-300 hover:text-white transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link to="/products?category=rings" className="text-gray-300 hover:text-white transition-colors">
                  Rings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-rose-500" />
                <span className="text-gray-300">hello@heartlynz.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-rose-500" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-rose-500" />
                <span className="text-gray-300">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Heartlynz. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;