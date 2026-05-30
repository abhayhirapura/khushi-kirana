import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { Star, Heart, ArrowLeft, ShoppingCart, ShieldAlert, Truck, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  const isFav = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      const added = await addToCart(product, quantity);
      if (added) {
        setToastMessage(`Added ${quantity} x ${product.name} to cart!`);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        navigate(`/login?redirect=/products/${product._id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-24"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="pt-[100%] bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-16 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Product not found</h3>
        <p className="text-gray-400 mt-1">The item you are looking for might have been removed or doesn't exist.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back navigation */}
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
      </Link>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-55 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg font-semibold animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left: Product Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 flex items-center justify-center"
        >
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold bg-accent-500 text-white">
              {product.discount}% OFF
            </span>
          )}
          
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[400px] w-full object-contain rounded-2xl"
          />
        </motion.div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Category */}
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest block mb-2">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-sm font-bold">{product.ratings.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({product.numReviews} ratings & reviews)
              </span>
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-b border-gray-100 dark:border-slate-800 py-6">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">About Product</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 flex items-baseline space-x-3">
              {product.discount > 0 ? (
                <>
                  <span className="text-3xl font-black text-gray-900 dark:text-white">₹{discountedPrice}</span>
                  <span className="text-base text-gray-400 line-through">₹{product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
              )}
            </div>
            
            <span className={`text-xs font-semibold block mt-1.5 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (Only ${product.stock} items left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Cart controls */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
            
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border border-gray-300 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-900 overflow-hidden">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3.5 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-2xl text-white font-bold flex items-center justify-center shadow-md transition-all ${
                  product.stock > 0
                    ? 'bg-primary-600 hover:bg-primary-500 active:scale-98 cursor-pointer hover:shadow-lg'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart Basket
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-2xl border transition-all ${
                  isFav
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-500'
                    : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-400'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
              </button>
            </div>

          </div>

          {/* Delivery & Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-slate-900/50">
              <Truck className="w-6 h-6 text-primary-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-800 dark:text-gray-300">Under 3 Hours</span>
              <span className="text-[9px] text-gray-400 mt-0.5">Instant dispatch</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-slate-900/50">
              <Sparkles className="w-6 h-6 text-accent-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-800 dark:text-gray-300">100% Fresh</span>
              <span className="text-[9px] text-gray-400 mt-0.5">Quality check pass</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-slate-900/50">
              <RefreshCw className="w-6 h-6 text-blue-500 mb-1" />
              <span className="text-[10px] font-bold text-gray-800 dark:text-gray-300">Easy Returns</span>
              <span className="text-[9px] text-gray-400 mt-0.5">No questions asked</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
