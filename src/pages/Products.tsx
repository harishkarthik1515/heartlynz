import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Filter, X, Search } from 'lucide-react';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const categories = ['bracelets', 'necklaces', 'earrings', 'rings'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Fetching products with filters:', {
          category: selectedCategory,
          priceRange,
          sortBy,
          searchQuery
        });

        const constraints: QueryConstraint[] = [];
        
        // Add category filter if selected
        if (selectedCategory) {
          constraints.push(where('category', '==', selectedCategory));
        }
        
        // For price filtering, we'll do it client-side since Firestore has limitations
        // with multiple where clauses on different fields
        
        // Add sorting - be careful with orderBy and where clauses
        if (selectedCategory) {
          // If we have a category filter, we can only sort by that field or use simple orderBy
          constraints.push(orderBy('createdAt', 'desc'));
        } else {
          // Without category filter, we can sort by other fields
          switch (sortBy) {
            case 'price-low':
              constraints.push(orderBy('price', 'asc'));
              break;
            case 'price-high':
              constraints.push(orderBy('price', 'desc'));
              break;
            case 'name':
              constraints.push(orderBy('name', 'asc'));
              break;
            case 'createdAt':
              constraints.push(orderBy('createdAt', 'desc'));
              break;
            default:
              constraints.push(orderBy('createdAt', 'desc'));
          }
        }
        
        const q = query(collection(db, 'products'), ...constraints);
        const querySnapshot = await getDocs(q);
        
        let fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Product[];
        
        console.log('Raw fetched products:', fetchedProducts);
        
        // Apply client-side filters
        
        // Price range filter
        fetchedProducts = fetchedProducts.filter(product => 
          product.price >= priceRange[0] && product.price <= priceRange[1]
        );
        
        // Search filter
        if (searchQuery) {
          fetchedProducts = fetchedProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Client-side sorting if we couldn't do it in the query
        if (selectedCategory && sortBy !== 'createdAt') {
          fetchedProducts.sort((a, b) => {
            switch (sortBy) {
              case 'price-low':
                return a.price - b.price;
              case 'price-high':
                return b.price - a.price;
              case 'name':
                return a.name.localeCompare(b.name);
              default:
                return 0;
            }
          });
        }
        
        console.log('Filtered and sorted products:', fetchedProducts);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Fallback: try a simpler query
        try {
          console.log('Trying fallback query...');
          const fallbackQuery = query(collection(db, 'products'));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          
          let fallbackProducts = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          })) as Product[];
          
          // Apply all filters client-side
          if (selectedCategory) {
            fallbackProducts = fallbackProducts.filter(p => p.category === selectedCategory);
          }
          
          fallbackProducts = fallbackProducts.filter(product => 
            product.price >= priceRange[0] && product.price <= priceRange[1]
          );
          
          if (searchQuery) {
            fallbackProducts = fallbackProducts.filter(product =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          // Sort
          fallbackProducts.sort((a, b) => {
            switch (sortBy) {
              case 'price-low':
                return a.price - b.price;
              case 'price-high':
                return b.price - a.price;
              case 'name':
                return a.name.localeCompare(b.name);
              case 'createdAt':
                return b.createdAt.getTime() - a.createdAt.getTime();
              default:
                return 0;
            }
          });
          
          console.log('Fallback products:', fallbackProducts);
          setProducts(fallbackProducts);
        } catch (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setSortBy('createdAt');
    setSearchQuery('');
    setSearchParams({});
  };

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => handleCategoryChange('')}
              className="text-rose-600 focus:ring-rose-500 h-4 w-4"
            />
            <span className="ml-3 text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <span className="ml-3 text-sm text-gray-700 capitalize">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Price Range
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        >
          <option value="createdAt">Newest First</option>
          <option value="name">Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 'All Products'}
            </h1>
            <p className="text-gray-600 mt-2">
              {loading ? 'Loading...' : `${products.length} products found`}
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24">
            <FilterContent />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                    <div className="w-full h-64 bg-gray-300 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000
                      ? 'Try adjusting your filters or search terms'
                      : 'Products will appear here once they are added by the admin'
                    }
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    {searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000
                      ? 'Clear Filters'
                      : 'Refresh Page'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-rose-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;