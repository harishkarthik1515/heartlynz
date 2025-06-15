import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Offer } from '../types';
import { Gift, Clock, Tag, Percent, ShoppingBag, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        console.log('Fetching offers...');
        
        // First try to get active offers that haven't expired
        let q = query(
          collection(db, 'offers'),
          where('isActive', '==', true),
          where('validUntil', '>', new Date()),
          orderBy('validUntil', 'asc')
        );
        
        let querySnapshot = await getDocs(q);
        let offersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          validFrom: doc.data().validFrom?.toDate() || new Date(),
          validUntil: doc.data().validUntil?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Offer[];
        
        console.log('Active offers found:', offersData);
        
        // If no active offers found, try to get all offers
        if (offersData.length === 0) {
          console.log('No active offers found, fetching all offers...');
          q = query(
            collection(db, 'offers'),
            orderBy('createdAt', 'desc')
          );
          
          querySnapshot = await getDocs(q);
          offersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            validFrom: doc.data().validFrom?.toDate() || new Date(),
            validUntil: doc.data().validUntil?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Offer[];
          
          console.log('All offers found:', offersData);
        }
        
        setOffers(offersData);
      } catch (error) {
        console.error('Error fetching offers:', error);
        
        // Fallback: try a simpler query
        try {
          console.log('Trying fallback query for offers...');
          const fallbackQuery = query(collection(db, 'offers'));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          
          const fallbackOffers = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            validFrom: doc.data().validFrom?.toDate() || new Date(),
            validUntil: doc.data().validUntil?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Offer[];
          
          console.log('Fallback offers:', fallbackOffers);
          setOffers(fallbackOffers);
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          setOffers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const formatDiscount = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    } else {
      return `₹${offer.discountValue} OFF`;
    }
  };

  const getDaysLeft = (validUntil: Date) => {
    const now = new Date();
    const diffTime = validUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOfferValid = (offer: Offer) => {
    const now = new Date();
    return offer.isActive && now >= offer.validFrom && now <= offer.validUntil;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter offers to show valid ones first, then expired ones
  const validOffers = offers.filter(isOfferValid);
  const expiredOffers = offers.filter(offer => !isOfferValid(offer));
  const displayOffers = [...validOffers, ...expiredOffers];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full mb-6">
            <Gift className="h-5 w-5 mr-2" />
            <span className="font-semibold">Special Offers</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Deals</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these amazing offers! Save big on your favorite jewelry pieces.
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Debug: Found {offers.length} total offers, {validOffers.length} valid, {expiredOffers.length} expired
            </p>
          </div>
        )}

        {/* Offers Grid */}
        {displayOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayOffers.map((offer) => {
              const daysLeft = getDaysLeft(offer.validUntil);
              const isUrgent = daysLeft <= 3 && daysLeft > 0;
              const isExpired = !isOfferValid(offer);
              
              return (
                <div key={offer.id} className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${isExpired ? 'opacity-60' : ''}`}>
                  {/* Offer Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white z-10 ${
                    isExpired ? 'bg-gray-500' :
                    isUrgent ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}>
                    {isExpired ? 'EXPIRED' : formatDiscount(offer)}
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-purple-50 opacity-50"></div>
                  
                  <div className="relative p-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isExpired ? 'grayscale' : ''}`}>
                      {offer.discountType === 'percentage' ? (
                        <Percent className="h-8 w-8 text-white" />
                      ) : (
                        <Tag className="h-8 w-8 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                      {offer.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {offer.description}
                    </p>

                    {/* Offer Details */}
                    <div className="space-y-2 mb-6">
                      {offer.minOrderAmount && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span>Min order: ₹{offer.minOrderAmount}</span>
                        </div>
                      )}
                      
                      {offer.maxDiscountAmount && offer.discountType === 'percentage' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2" />
                          <span>Max discount: ₹{offer.maxDiscountAmount}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Valid until: {offer.validUntil.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Time Left */}
                    {!isExpired && (
                      <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
                        isUrgent ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-center">
                          <Clock className={`h-4 w-4 mr-2 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                          <span className={`text-sm font-medium ${isUrgent ? 'text-red-800' : 'text-blue-800'}`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today!'}
                          </span>
                        </div>
                        {isUrgent && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                            URGENT
                          </span>
                        )}
                      </div>
                    )}

                    {isExpired && (
                      <div className="flex items-center justify-center p-3 rounded-lg mb-4 bg-gray-100 border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">This offer has expired</span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link
                      to="/products"
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center block ${
                        isExpired 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                      }`}
                      onClick={isExpired ? (e) => e.preventDefault() : undefined}
                    >
                      {isExpired ? 'Offer Expired' : 'Shop Now'}
                    </Link>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
                  <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-purple-200 to-rose-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <Gift className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Offers Available</h3>
              <p className="text-gray-600 mb-8">
                Check back soon for exciting deals and discounts on our beautiful jewelry collection.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Never Miss an Offer!</h3>
          <p className="text-rose-100 mb-6">
            Subscribe to our newsletter and be the first to know about exclusive deals and new collections.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
            />
            <button className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;