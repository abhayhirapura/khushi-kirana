import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { Heart, ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isFav = isInWishlist(product._id);

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Wishlist toggle */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:scale-105 active:scale-95 transition-all focus:outline-none"
      >
        <Heart className={`w-5 h-5 ${isFav ? 'text-red-500 fill-current' : ''}`} />
      </button>

      {/* Discount badge */}
      {product.discount > 0 && (
        <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent-500 text-white shadow-sm">
          {product.discount}% OFF
        </span>
      )}

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block overflow-hidden pt-[100%] relative bg-gray-50 dark:bg-slate-950/50">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Body */}
      <div className="p-4.5 flex flex-col flex-grow">
        
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs mb-1 text-gray-450 dark:text-gray-400">
          <span>{product.category}</span>
          <span className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
            {product.ratings.toFixed(1)}
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/products/${product._id}`} className="block flex-grow">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-primary-500 line-clamp-2 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Short description preview */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
          {product.description}
        </p>

        {/* Footer Actions: Pricing & Add To Cart */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{discountedPrice}</span>
                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
            )}
            <span className={`text-[10px] font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <button
            onClick={() => product.stock > 0 && addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
              product.stock > 0
                ? 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-[1.05] active:scale-95 shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;
