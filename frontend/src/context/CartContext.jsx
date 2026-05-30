import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import API from '../services/api.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart and wishlist on login
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCartItems([]);
      setWishlist([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get('/wishlist');
      setWishlist(data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) return false; // Needs authentication
    try {
      const { data } = await API.post('/cart', { productId: product._id, quantity });
      setCartItems(data.items || []);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const { data } = await API.put(`/cart/${productId}`, { quantity });
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await API.delete(`/cart/${productId}`);
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await API.post('/cart/clear');
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) return;
    const isFav = wishlist.some(item => item._id === product._id);
    try {
      if (isFav) {
        const { data } = await API.delete(`/wishlist/${product._id}`);
        setWishlist(data.products || []);
      } else {
        const { data } = await API.post('/wishlist', { productId: product._id });
        setWishlist(data.products || []);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total;
      const actualPrice = item.product.price * (1 - (item.product.discount || 0) / 100);
      return total + (actualPrice * item.quantity);
    }, 0);
  };

  const getTax = () => {
    // 5% standard GST for groceries
    return getSubtotal() * 0.05;
  };

  const getDeliveryCharges = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    // Free delivery for orders above ₹300
    return subtotal > 300 ? 0 : 30;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryCharges();
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlist,
      loading,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      cartCount,
      getSubtotal,
      getTax,
      getDeliveryCharges,
      getTotal,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
