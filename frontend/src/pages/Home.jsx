import React, { useEffect, useState } from 'react';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryList from '../components/CategoryList.jsx';
import { SlidersHorizontal, ArrowUpDown, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [priceRange, setPriceRange] = useState(1000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (category) params.category = category;
        if (searchQuery) params.search = searchQuery;
        if (sort) params.sort = sort;
        params.maxPrice = priceRange;

        const { data } = await API.get('/products', { params });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [category, searchQuery, sort, priceRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Hero Banner Banner Carousel / Promo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-600 to-amber-500 p-6 md:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-10 overflow-hidden relative"
      >
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 uppercase tracking-widest mb-3">
            Mega Opening Offer 🎉
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Fresh Groceries <br />
            Delivered in <span className="text-amber-300">3 Hours</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-emerald-50 font-medium">
            Get premium items, pulses, dry fruits, and fresh produce at prices lower than your local mandi! Free delivery on orders above ₹300.
          </p>
        </div>
        <div className="flex-shrink-0 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4.5 text-center shadow-lg">
            <span className="text-xs text-emerald-100 font-semibold block uppercase">Use Coupon Code</span>
            <span className="text-2xl font-black text-amber-300 tracking-wider">KHUSI15</span>
            <span className="text-[10px] text-emerald-100 block mt-1">Get 15% flat off on first order</span>
          </div>
        </div>
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
      </motion.div>

      {/* Category Selection */}
      <section className="mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
        <CategoryList selectedCategory={category} onSelectCategory={setCategory} />
      </section>

      {/* Main product listings and filters */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-gray-900 dark:text-white flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-primary-500" /> Filters
              </span>
              {(category || sort || priceRange < 1000) && (
                <button
                  onClick={() => {
                    setCategory('');
                    setSort('');
                    setPriceRange(1000);
                  }}
                  className="text-xs text-red-500 font-semibold cursor-pointer hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="border-t border-gray-100 dark:border-slate-850 pt-4">
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 block mb-2">
                Max Price: <span className="font-bold text-primary-500">₹{priceRange}</span>
              </label>
              <input
                type="range"
                min="30"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹30</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Sorting Filter */}
            <div className="border-t border-gray-100 dark:border-slate-850 pt-4 mt-4">
              <label className="text-sm font-semibold text-gray-850 dark:text-gray-300 block mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2 text-sm rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Newest Arrivals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          
          {/* Controls Bar for mobile */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-800 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </button>
            <div className="flex items-center space-x-2 text-xs">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="p-2 border-0 bg-transparent font-medium text-gray-700 dark:text-gray-350 focus:outline-none"
              >
                <option value="">Sort By</option>
                <option value="price_low">Price: Low-High</option>
                <option value="price_high">Price: High-Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Catalog Title */}
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {category || 'Trending Products'}
              {searchQuery && ` - Search: "${searchQuery}"`}
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Showing {products.length} item(s)
            </span>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-gray-100 dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
                  <div className="pt-[100%] bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <XCircle className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">No products found</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                We couldn't find any items matching your filters or search keywords. Try adjusting your settings!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Home;
