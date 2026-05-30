import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { Heart, Star, Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { 
    cartItems, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    toggleWishlist, 
    isInWishlist 
  } = useCart();

  const isFav = isInWishlist(product._id);
  
  // Find if this product is already in the shopping cart
  const cartItem = cartItems.find(item => item.product?._id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discountedPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > quantityInCart) {
      updateCartItem(product._id, quantityInCart + 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart === 1) {
      removeFromCart(product._id);
    } else {
      updateCartItem(product._id, quantityInCart - 1);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, cubicBezier: [0.25, 0.8, 0.25, 1] }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
    >
      {/* Wishlist toggle */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm text-slate-400 hover:text-red-500 dark:hover:text-red-400 shadow-sm transition-all focus:outline-none"
      >
        <Heart className={`w-4 h-4 transition-transform duration-200 active:scale-75 ${isFav ? 'text-red-500 fill-current' : ''}`} />
      </button>

      {/* Discount badge */}
      {product.discount > 0 && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-accent-500 text-white shadow-sm uppercase tracking-wide">
            {product.discount}% OFF
          </span>
        </div>
      )}

      {/* Product Image Container */}
      <Link 
        to={`/products/${product._id}`} 
        className="block overflow-hidden pt-[95%] relative bg-slate-50 dark:bg-slate-950/20"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full p-4 object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Body */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold tracking-wide text-slate-400 uppercase">
          <span>{product.category}</span>
          <span className="flex items-center text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-current mr-0.5" />
            {product.ratings.toFixed(1)}
          </span>
        </div>

        {/* Product Title */}
        <Link to={`/products/${product._id}`} className="block flex-grow mb-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary-500 line-clamp-2 min-h-[40px] transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Short description preview */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mb-3">
          {product.description}
        </p>

        {/* Footer Actions: Pricing & Dynamic Cart Control */}
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          
          {/* Pricing Info */}
          <div className="flex flex-col shrink-0">
            {product.discount > 0 ? (
              <div className="flex items-baseline space-x-1">
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">₹{discountedPrice}</span>
                <span className="text-[10px] text-slate-400 line-through">₹{product.price}</span>
              </div>
            ) : (
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100">₹{product.price}</span>
            )}
            <span className={`text-[9px] font-black tracking-wider uppercase mt-0.5 ${product.stock > 0 ? 'text-primary-500' : 'text-red-500'}`}>
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </span>
          </div>

          {/* Dynamic Quantity Selector / Add Button */}
          <div className="flex-grow max-w-[100px]">
            {product.stock === 0 ? (
              <div className="w-full py-1.5 rounded-lg text-center text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700">
                OOS
              </div>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center justify-between w-full bg-primary-500 text-white rounded-lg px-2 py-1 shadow-sm border border-primary-600">
                <button
                  onClick={handleDecrement}
                  className="hover:scale-110 active:scale-90 p-0.5 cursor-pointer focus:outline-none transition-transform"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="text-xs font-black select-none">{quantityInCart}</span>
                <button
                  onClick={handleIncrement}
                  disabled={quantityInCart >= product.stock}
                  className={`hover:scale-110 active:scale-90 p-0.5 cursor-pointer focus:outline-none transition-transform ${
                    quantityInCart >= product.stock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full py-1.5 rounded-lg text-xs font-black bg-white dark:bg-slate-900 text-primary-500 dark:text-primary-400 border border-primary-500/40 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.97]"
              >
                ADD
              </button>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default ProductCard;
