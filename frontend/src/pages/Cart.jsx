import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Trash2, ShoppingBasket, ArrowRight, Tag, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
  const { user } = useAuth();
  const {
    cartItems,
    updateCartItem,
    removeFromCart,
    getSubtotal,
    getTax,
    getDeliveryCharges,
    getTotal
  } = useCart();

  const navigate = useNavigate();

  // Coupon code states
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const formattedCode = coupon.trim().toUpperCase();
    if (formattedCode === 'KHUSI15') {
      setDiscountPercent(15);
      setCouponSuccess('Coupon applied successfully! You got 15% off.');
    } else {
      setCouponError('Invalid coupon code. Try KHUSI15.');
      setDiscountPercent(0);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout', { state: { discountPercent } });
    }
  };

  const subtotal = getSubtotal();
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const tax = getTax();
  const delivery = getDeliveryCharges();
  const finalTotal = subtotal - discountAmount + tax + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-10 shadow-lg"
        >
          <ShoppingBasket className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Cart is Empty</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart basket yet. Let's find some delicious items!
          </p>
          <Link
            to="/"
            className="inline-flex items-center mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-full shadow transition-all duration-200 hover:scale-[1.02]"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">
        Your Cart Basket
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            if (!item.product) return null;
            const singlePrice = item.product.price * (1 - (item.product.discount || 0) / 100);
            return (
              <motion.div
                key={item.product._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition gap-4"
              >
                {/* Product thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/20">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary-500 truncate block text-sm sm:text-base">
                    {item.product.name}
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block">{item.product.category}</span>
                  <div className="flex items-baseline space-x-1.5 mt-1">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">₹{Math.round(singlePrice)}</span>
                    {item.product.discount > 0 && (
                      <span className="text-[10px] text-gray-400 line-through">₹{item.product.price}</span>
                    )}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900">
                  <button
                    onClick={() => updateCartItem(item.product._id, Math.max(1, item.quantity - 1))}
                    className="px-2.5 py-1.5 text-gray-600 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.product._id, Math.min(item.product.stock, item.quantity + 1))}
                    className="px-2.5 py-1.5 text-gray-600 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition"
                  >
                    +
                  </button>
                </div>

                {/* Trash */}
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer focus:outline-none shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Summary Panel */}
        <div className="space-y-6">
          
          {/* Coupon Panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-accent-500" /> Apply Coupon
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-500 mt-2 font-medium">{couponSuccess}</p>}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium">
              💡 Use coupon code <span className="font-bold text-accent-500">KHUSI15</span> to get 15% discount!
            </p>
          </div>

          {/* Pricing Panel */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
              Order Summary
            </h3>
            
            <div className="space-y-2 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-accent-600 dark:text-accent-400 font-semibold">
                  <span className="flex items-center"><Percent className="w-3.5 h-3.5 mr-1" /> Coupon ({discountPercent}%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>GST (5%)</span>
                <span>₹{Math.round(tax)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Delivery Charges</span>
                <span>{delivery === 0 ? <span className="text-green-500 font-bold">FREE</span> : `₹${delivery}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-black text-primary-500">₹{Math.round(finalTotal)}</span>
            </div>

            {delivery > 0 && (
              <p className="text-[10px] text-accent-600 bg-accent-50 dark:bg-accent-950/20 border border-accent-100 dark:border-accent-900 rounded-lg p-2.5 text-center font-medium">
                💡 Add ₹{Math.max(0, 300 - subtotal)} more to unlock free delivery!
              </p>
            )}

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center transition group cursor-pointer"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
