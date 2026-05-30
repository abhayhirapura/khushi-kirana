import React, { useEffect, useState } from 'react';
import API from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryList from '../components/CategoryList.jsx';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  XCircle, 
  Truck, 
  PiggyBank, 
  Sparkles, 
  ShieldCheck, 
  Quote, 
  Smartphone,
  ChevronRight,
  Gift,
  Star
} from 'lucide-react';
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

  // Derived collections for home storefront shelves
  const offersList = products.filter(p => p.discount > 0).slice(0, 10);
  const bestSellersList = products.filter(p => p.ratings >= 4.7).slice(0, 10);

  // Check if user is searching or filtering
  const isBrowsingMode = category || searchQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* 1. HERO SECTION (Only shows on home dashboard) */}
      {!isBrowsingMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
        >
          {/* Decorative circular gradients */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/3 -top-20 w-40 h-40 rounded-full bg-accent-400/20 blur-xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-widest mb-4">
              <Gift className="w-3.5 h-3.5 text-accent-300" /> Grand Opening Offer
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white mb-4">
              Fresh Groceries <br />
              Delivered in <span className="text-accent-300">3 Hours</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-50 font-bold leading-relaxed max-w-md">
              Get organic produce, daily dairy, pulses, and dry fruits delivered fresh straight from local farms at wholesale mandi prices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={() => setCategory('Fruits & Vegetables')} 
                className="px-6 py-2.5 rounded-full text-xs font-black bg-white text-primary-600 hover:bg-slate-100 hover:scale-[1.03] shadow-md transition-all active:scale-[0.98]"
              >
                Order Vegetables
              </button>
              <a 
                href="#catalog-anchor" 
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary-600/40 text-white border border-white/25 hover:bg-primary-600/60 transition-colors"
              >
                Browse Catalog
              </a>
            </div>
          </div>

          {/* Coupon Code Panel */}
          <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-lg max-w-xs mx-auto">
              <span className="text-[10px] text-emerald-100 font-extrabold block uppercase tracking-wider">Use Code</span>
              <span className="text-3xl font-black text-accent-300 tracking-widest block my-1">KHUSHI15</span>
              <div className="h-px bg-white/10 my-3"></div>
              <span className="text-[10px] text-emerald-100 block">Get 15% flat off + Free delivery on your first order above ₹300!</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. CATEGORY SHELF */}
      <section className="text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {isBrowsingMode ? 'Filter by Category' : 'Shop by Category'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Explore fresh essentials across our premium departments</p>
          </div>
          {category && (
            <button 
              onClick={() => setCategory('')} 
              className="text-xs text-red-500 font-extrabold hover:underline"
            >
              Clear Category
            </button>
          )}
        </div>
        <CategoryList selectedCategory={category} onSelectCategory={setCategory} />
      </section>

      {/* 3. DYNAMIC LANDING BANNERS & SHELVES (Only shows on home dashboard) */}
      {!isBrowsingMode && (
        <>
          {/* Today's Hot Offers Shelf */}
          {offersList.length > 0 && (
            <section className="text-left animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    🔥 Today's Hot Offers
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Unbeatable discounts on your household favorites</p>
                </div>
              </div>
              <div className="flex items-stretch gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {offersList.map(product => (
                  <div key={product._id} className="w-56 shrink-0 flex">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Why Choose Us Grid */}
          <section className="py-6 border-y border-slate-100 dark:border-slate-800/80">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Why Choose Khushi Kirana?</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">We are committed to delivering the highest quality grocery service in Jaipur</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                { 
                  icon: <Truck className="w-6 h-6 text-primary-500" />, 
                  title: "Instant 3-Hour Delivery", 
                  desc: "Superfast neighborhood delivery route guarantees your items arrive fresh." 
                },
                { 
                  icon: <PiggyBank className="w-6 h-6 text-accent-500" />, 
                  title: "Wholesale Mandi Prices", 
                  desc: "We source directly to bypass middlemen and pass all savings to you." 
                },
                { 
                  icon: <Sparkles className="w-6 h-6 text-emerald-500" />, 
                  title: "100% Quality Guaranteed", 
                  desc: "Double-checked for pristine quality. If it's not fresh, we replace it." 
                },
                { 
                  icon: <ShieldCheck className="w-6 h-6 text-blue-500" />, 
                  title: "100% Safe Payments", 
                  desc: "Secure transactions via Razorpay and convenient Cash on Delivery." 
                }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl w-fit mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-1">{item.title}</h3>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Top Best Sellers Shelf */}
          {bestSellersList.length > 0 && (
            <section className="text-left animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    🌟 Customer Best Sellers
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">Top-rated items loved and reviewed by your neighbors</p>
                </div>
              </div>
              <div className="flex items-stretch gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {bestSellersList.map(product => (
                  <div key={product._id} className="w-56 shrink-0 flex">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Download App Promo banner */}
          <section className="w-full rounded-3xl bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-lg text-left">
              <span className="inline-block px-2.5 py-0.5 rounded bg-primary-500 text-[10px] font-black uppercase tracking-wider mb-4">Coming Soon</span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Get the Khushi Kirana App</h2>
              <p className="text-xs text-slate-400 font-bold leading-relaxed mt-2 max-w-sm">
                Shop with 1-click checkout, receive instant tracking notifications, and get access to exclusive coupons! Available soon for Android and iOS.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button disabled className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 opacity-60 cursor-not-allowed">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-slate-500 block uppercase">Download on the</span>
                    <span className="text-xs font-black text-white block mt-0.5">App Store</span>
                  </div>
                </button>
                <button disabled className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 opacity-60 cursor-not-allowed">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-slate-500 block uppercase">Get it on</span>
                    <span className="text-xs font-black text-white block mt-0.5">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 4. MAIN BROWSE CATALOG SECTION */}
      <span id="catalog-anchor" className="block scroll-mt-24"></span>
      <section className="text-left">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 space-y-6 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-extrabold text-sm text-slate-805 dark:text-white flex items-center">
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-primary-500" /> Filter Options
                </span>
                {(category || sort || priceRange < 1000) && (
                  <button
                    onClick={() => {
                      setCategory('');
                      setSort('');
                      setPriceRange(1000);
                    }}
                    className="text-[11px] text-red-500 font-extrabold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <label className="text-xs font-bold text-slate-400 block mb-2">
                  MAXIMUM BUDGET: <span className="font-black text-primary-500 text-sm ml-1">₹{priceRange}</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="1000"
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1.5 uppercase">
                  <span>Min: ₹30</span>
                  <span>Max: ₹1000</span>
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4">
                <label className="text-xs font-bold text-slate-400 block mb-2">
                  SORT CATALOG BY
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
            
            {/* Mobile Controls Bar */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-extrabold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" /> Filters
              </button>
              <div className="flex items-center space-x-2 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="p-2 border-0 bg-transparent font-extrabold text-slate-700 dark:text-slate-300 focus:outline-none"
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
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {isBrowsingMode 
                    ? (category ? `Products in "${category}"` : 'Search Results') 
                    : 'Explore all Groceries'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {searchQuery && `Showing items matching "${searchQuery}"`}
                  {!searchQuery && 'Quality groceries picked and delivered with love'}
                </p>
              </div>
              <span className="text-[10px] font-black tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-400 dark:text-slate-400 shrink-0">
                {products.length} Items Found
              </span>
            </div>

            {/* Catalog Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 space-y-4 animate-pulse bg-white dark:bg-slate-900/30">
                    <div className="pt-[95%] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
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
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6">
                <XCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No items match your settings</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Try clearing your search terms or expanding your maximum price budget!
                </p>
                <button
                  onClick={() => {
                    setCategory('');
                    setSort('');
                    setPriceRange(1000);
                  }}
                  className="mt-4 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black rounded-lg transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS (Only shows on home dashboard) */}
      {!isBrowsingMode && (
        <section className="py-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Real Reviews from Happy Neighbors</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Join thousands of families in Jaipur shopping on Khushi Kirana</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                text: "Khushi Kirana has completely replaced my weekly mandi runs! The vegetables arrive incredibly fresh and are washed properly. Same-day delivery is a game-changer.",
                author: "Pooja Sharma",
                location: "Malviya Nagar, Jaipur",
                rating: 5
              },
              {
                text: "The pulses and dry fruits are of premium export quality, much better than local grocery stores. Their wholesale rates and flat discount codes save me ₹1000+ monthly.",
                author: "Rajesh Khandelwal",
                location: "C-Scheme, Jaipur",
                rating: 5
              },
              {
                text: "Ordered dairy and baking essentials. The delivery partner was polite, wore a mask, and brought it within 2 hours. Extremely satisfied with their prompt customer support.",
                author: "Sneha Shekhawat",
                location: "Vaishali Nagar, Jaipur",
                rating: 5
              }
            ].map((review, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between relative">
                <Quote className="w-8 h-8 text-primary-500/10 absolute top-4 right-4" />
                <div>
                  <div className="flex items-center space-x-0.5 mb-4 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic mb-6">
                    "{review.text}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400 font-extrabold text-sm uppercase">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block leading-tight">{review.author}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{review.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
