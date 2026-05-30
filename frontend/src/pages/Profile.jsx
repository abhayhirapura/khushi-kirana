import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import API from '../services/api.js';
import { User, MapPin, History, Heart, Plus, Trash2, ShieldCheck, ShoppingBag } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab state
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || 'profile');

  // Sync tab with URL queries
  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // Tab change helper
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`);
  };

  // 1. Profile States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // 2. Address States
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // 3. Orders States
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get('/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const [reorderLoadingId, setReorderLoadingId] = useState('');

  const handleReorder = async (orderItems, orderId) => {
    try {
      setReorderLoadingId(orderId);
      for (const item of orderItems) {
        if (item.product) {
          await addToCart({ _id: item.product }, item.quantity);
        }
      }
      setReorderLoadingId('');
      navigate('/cart');
    } catch (err) {
      console.error('Error reordering:', err);
      setReorderLoadingId('');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (password && password !== confirmPassword) {
      return setProfileError('Passwords do not match.');
    }

    try {
      const payload = { name, email };
      if (password) payload.password = password;
      await updateProfile(payload);
      setProfileMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/addresses', {
        street,
        city,
        state,
        zipCode,
        isDefault: addresses.length === 0
      });
      setAddresses(data);
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setShowAddrForm(false);
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await API.delete(`/auth/addresses/${id}`);
      setAddresses(data);
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Tabs control links */}
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4.5 shadow-sm space-y-1">
            <button
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-5 h-5 mr-3 shrink-0" /> Settings
            </button>
            <button
              onClick={() => handleTabChange('addresses')}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'addresses'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-5 h-5 mr-3 shrink-0" /> Saved Addresses
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-5 h-5 mr-3 shrink-0" /> Order History
            </button>
            <button
              onClick={() => handleTabChange('wishlist')}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'wishlist'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className="w-5 h-5 mr-3 shrink-0" /> Wishlist
            </button>
          </div>
        </aside>

        {/* Right column: Tab panels content */}
        <main className="lg:col-span-3">
          
          {/* Settings Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
              
              {profileMessage && <p className="p-3 mb-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-semibold">{profileMessage}</p>}
              {profileError && <p className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold">{profileError}</p>}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep same"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep same"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm shadow cursor-pointer transition"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddrForm(!showAddrForm)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-655 text-white font-bold rounded-xl text-xs flex items-center cursor-pointer transition"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Address
                </button>
              </div>

              {showAddrForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-5 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Street Address</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="House/Plot/Street Name"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Jaipur"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Rajasthan"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Zip Code</label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="302021"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddrForm(false)}
                      className="px-4 py-2 border border-gray-200 dark:border-slate-800 text-gray-500 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr._id} className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 relative flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{addr.street}</h4>
                      <p className="text-xs text-gray-400 mt-1">{addr.city}, {addr.state} - {addr.zipCode}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      {addr.isDefault ? (
                        <span className="text-[10px] text-primary-500 font-bold bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded-md">Default Address</span>
                      ) : (
                        <span></span>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Order History</h2>

              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-200 dark:border-slate-800 rounded-2xl p-5 bg-gray-50/20 dark:bg-slate-900/10 space-y-4">
                      
                      {/* Order top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-4 text-xs font-semibold">
                        <div>
                          <p className="text-gray-400">Order Placed Date</p>
                          <p className="text-gray-800 dark:text-gray-200 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tracking ID</p>
                          <p className="text-primary-500 font-bold uppercase mt-0.5">{order.trackingId}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Price</p>
                          <p className="text-gray-900 dark:text-white font-bold mt-0.5">₹{Math.round(order.pricing.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Delivery Status</p>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full mt-0.5 font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                              : order.status === 'Cancelled'
                              ? 'bg-red-50 text-red-500'
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3.5">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs gap-3">
                            <span className="text-gray-600 truncate">{item.name} <span className="font-bold text-gray-850 dark:text-gray-300">x {item.quantity}</span></span>
                            <span className="text-gray-800 dark:text-gray-300">₹{Math.round(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA link to tracking page */}
                      <div className="flex justify-end items-center gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <button
                          disabled={reorderLoadingId === order._id}
                          onClick={() => handleReorder(order.orderItems, order._id)}
                          className="px-4.5 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition cursor-pointer disabled:bg-gray-400"
                        >
                          {reorderLoadingId === order._id ? 'Reordering...' : '⚡ Buy Again'}
                        </button>
                        <Link
                          to={`/orders/${order._id}/tracking`}
                          className="px-4.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition"
                        >
                          Track Package
                        </Link>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">No orders placed yet.</p>
                  <Link to="/" className="text-xs text-primary-500 font-bold hover:underline block mt-2">Start shopping</Link>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Starred Wishlist</h2>
              
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map(product => (
                    <div key={product._id} className="p-3 border border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between bg-gray-50/20 dark:bg-slate-950/20 relative">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-red-500 transition shadow cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="w-full pt-[80%] overflow-hidden relative rounded-xl bg-gray-50">
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                      </div>

                      <div className="mt-3 flex-grow">
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1">{product.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{product.category}</p>
                        <p className="text-sm font-bold text-gray-805 dark:text-gray-200 mt-1">₹{product.price}</p>
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="mt-3 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400 dark:text-gray-500 font-semibold text-sm">
                  You haven't wishlisted any items yet.
                </p>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Profile;
