import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Star, Shield, Truck, HeartHandshake } from 'lucide-react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // First try to get featured products
        let q = query(
          collection(db, 'products'),
          where('featured', '==', true),
          where('inStock', '==', true),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        
        let querySnapshot = await getDocs(q);
        let products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Product[];

        // If no featured products, get any available products
        if (products.length === 0) {
          console.log('No featured products found, fetching all available products...');
          q = query(
            collection(db, 'products'),
            where('inStock', '==', true),
            orderBy('createdAt', 'desc'),
            limit(8)
          );
          
          querySnapshot = await getDocs(q);
          products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Product[];
        }

        console.log('Fetched products:', products);
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        
        // Fallback: try to fetch without the inStock filter
        try {
          console.log('Trying fallback query without inStock filter...');
          const fallbackQuery = query(
            collection(db, 'products'),
            orderBy('createdAt', 'desc'),
            limit(8)
          );
          
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackProducts = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Product[];
          
          console.log('Fallback products:', fallbackProducts);
          setFeaturedProducts(fallbackProducts);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          setFeaturedProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    {
      name: 'Bracelets',
      image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
      link: '/products?category=bracelets'
    },
    {
      name: 'Necklaces',
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=400',
      link: '/products?category=necklaces'
    },
    {
      name: 'Earrings',
      image: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
      link: '/products?category=earrings'
    },
    {
      name: 'Rings',
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=400',
      link: '/products?category=rings'
    }
  ];

  const features = [
    {
      icon: HeartHandshake,
      title: 'Handcrafted with Love',
      description: 'Each piece is carefully handmade with attention to detail and passion.'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'Premium materials and craftsmanship ensure lasting beauty.'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹999 across India.'
    },
    {
      icon: Star,
      title: 'Customer Loved',
      description: 'Trusted by thousands of happy customers nationwide.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated collections of handmade jewelry
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-square">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-xl font-semibold text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Handpicked favorites loved by our customers
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center text-rose-600 hover:text-rose-700 font-semibold"
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="w-full h-64 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600 mb-6">
                  Products will appear here once they are added by the admin.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
                >
                  Browse All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Heartlynz?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the finest handmade jewelry with exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-rose-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers and new collection updates
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-rose-600 font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;