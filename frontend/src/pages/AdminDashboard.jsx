import React, { useEffect, useState } from 'react';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  UserCheck, 
  BarChart2, 
  Package, 
  Truck 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard overall stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders lists & controls
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Users lists & controls
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Products inventory management
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  // Delivery partners list
  const [deliveryPartners, setDeliveryPartners] = useState([]);

  // Form states for creating/editing a product
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');
  const [pCategory, setPCategory] = useState('Fruits & Vegetables');
  const [pStock, setPStock] = useState('100');
  const [pDiscount, setPDiscount] = useState('0');
  const [pIsTrending, setPIsTrending] = useState(false);
  const [pIsPopular, setPIsPopular] = useState(false);

  // Allowed categories list
  const categoriesList = [
    'Fruits & Vegetables', 'Rice & Grains', 'Atta & Flour', 'Pulses & Dal', 'Oil & Ghee',
    'Spices & Masala', 'Snacks & Namkeen', 'Biscuits & Bakery', 'Tea & Coffee', 'Dry Fruits',
    'Instant Food', 'Noodles & Pasta', 'Sauces & Pickles', 'Personal Care', 'Bath & Body',
    'Cleaning Essentials', 'Household Items', 'Baby Care', 'Pet Food', 'Frozen Food',
    'Stationery', 'Kitchen Essentials'
  ];

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardStats();
      fetchOrders();
      fetchUsers();
      fetchProducts();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await API.get('/admin/users');
      setUsersList(data);
      // Filter out delivery partners
      setDeliveryPartners(data.filter(u => u.role === 'delivery'));
    } catch (err) {
      console.error('Error fetching users list:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const { data } = await API.get('/products');
      setProductsList(data);
    } catch (err) {
      console.error('Error fetching products list:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Manage Order Statuses & Rider Assignments
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchDashboardStats();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleAssignRider = async (orderId, riderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, { deliveryPartner: riderId });
      fetchOrders();
      alert('Delivery partner assigned successfully!');
    } catch (err) {
      console.error('Error assigning rider:', err);
    }
  };

  // Manage Users Promotions & Roles
  const handlePromoteUser = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      alert('User role updated successfully!');
    } catch (err) {
      console.error('Error promoting user:', err);
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Manage Products CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: pName,
      price: Number(pPrice),
      description: pDescription,
      image: pImage,
      category: pCategory,
      stock: Number(pStock),
      discount: Number(pDiscount),
      isTrending: pIsTrending,
      isPopular: pIsPopular
    };

    try {
      if (editProductId) {
        await API.put(`/products/${editProductId}`, payload);
        alert('Product updated successfully!');
      } else {
        await API.post('/products', payload);
        alert('Product added successfully!');
      }

      // Reset form
      setShowProductForm(false);
      setEditProductId(null);
      setPName('');
      setPPrice('');
      setPDescription('');
      setPImage('');
      setPStock('100');
      setPDiscount('0');
      setPIsTrending(false);
      setPIsPopular(false);

      fetchProducts();
      fetchDashboardStats();
    } catch (err) {
      console.error('Error submitting product form:', err);
      alert('Error saving product.');
    }
  };

  const handleEditProduct = (prod) => {
    setEditProductId(prod._id);
    setPName(prod.name);
    setPPrice(prod.price.toString());
    setPDescription(prod.description);
    setPImage(prod.image);
    setPCategory(prod.category);
    setPStock(prod.stock.toString());
    setPDiscount(prod.discount ? prod.discount.toString() : '0');
    setPIsTrending(prod.isTrending || false);
    setPIsPopular(prod.isPopular || false);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await API.delete(`/products/${prodId}`);
      fetchProducts();
      fetchDashboardStats();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product.');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 p-6 rounded-3xl text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
          <h3 className="font-extrabold text-lg">Access Denied</h3>
          <p className="text-xs mt-1">This panel is restricted to authorized store administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-xs font-semibold text-gray-400">Manage Annu Rajawat Heerapura’s Khusi Kirana store</p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-800 gap-1 overflow-x-auto">
          {['overview', 'orders', 'inventory', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer capitalize shrink-0 ${
                activeTab === tab 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Panel Display */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Dashboard statistics cards */}
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-slate-900 rounded-3xl"></div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 flex items-center space-x-4 shadow-sm relative overflow-hidden">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Revenue</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">₹{stats.cards.totalRevenue}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 flex items-center space-x-4 shadow-sm relative overflow-hidden">
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Orders</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">{stats.cards.totalOrders}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 flex items-center space-x-4 shadow-sm relative overflow-hidden">
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Active Users</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">{stats.cards.totalUsers}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 flex items-center space-x-4 shadow-sm relative overflow-hidden">
                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Low Stock Items</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">{stats.cards.lowStockCount}</span>
                </div>
              </div>

            </div>
          ) : null}

          {/* Revenue and Category distributions graphics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sales Trends visualizer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary-500" /> Sales & Revenue Growth (Last 6 Months)
              </h3>
              {stats && stats.monthlySales.length > 0 ? (
                <div className="space-y-4">
                  {stats.monthlySales.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{item.month}</span>
                        <span>₹{item.sales}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (item.sales / Math.max(...stats.monthlySales.map(s => s.sales), 100)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-gray-400">Accumulate more delivery orders to generate chart trends!</p>
              )}
            </div>

            {/* Category breakdown visualizer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-accent-500" /> Sales distribution by Category
              </h3>
              {stats && stats.categorySales.length > 0 ? (
                <div className="space-y-4">
                  {stats.categorySales.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{item.name}</span>
                        <span>₹{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-accent-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (item.value / Math.max(...stats.categorySales.map(c => c.value), 100)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-xs text-gray-400 font-semibold">Place/verify paid orders to analyze sales category details.</p>
              )}
            </div>
          </div>
          
          {/* Low Stock Alerts inventory warning table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-4.5 h-4.5 mr-2 text-red-500" /> Low Stock Warnings (&lt; 10 units left)
            </h3>
            {stats && stats.lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 font-bold uppercase">
                      <th className="py-2.5">Product Name</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Price</th>
                      <th className="py-2.5">Remaining Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-gray-200">
                    {stats.lowStockProducts.map(p => (
                      <tr key={p._id}>
                        <td className="py-3 font-bold">{p.name}</td>
                        <td className="py-3 text-gray-400">{p.category}</td>
                        <td className="py-3">₹{p.price}</td>
                        <td className="py-3 font-black text-red-500">{p.stock} left</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-xs text-green-500 font-semibold flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> All catalog items are sufficiently stocked!
              </p>
            )}
          </div>

        </div>
      )}

      {/* Tab: Orders Management with Delivery Assignments */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Customer Orders</h2>

          {ordersLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 font-bold uppercase">
                    <th className="py-3.5">Customer</th>
                    <th className="py-3.5">Total Value</th>
                    <th className="py-3.5">Tracking ID</th>
                    <th className="py-3.5">Payment</th>
                    <th className="py-3.5">Status</th>
                    <th className="py-3.5">Assigned Rider</th>
                    <th className="py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-805 dark:text-gray-205">
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td className="py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{order.user?.name || 'Guest'}</div>
                        <div className="text-[10px] text-gray-400">{order.user?.email}</div>
                      </td>
                      <td className="py-4 font-extrabold">₹{Math.round(order.pricing.totalPrice)}</td>
                      <td className="py-4 font-black uppercase text-primary-500">{order.trackingId}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] ${
                          order.isPaid
                            ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                            : 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          {order.isPaid ? 'PAID' : 'PENDING'}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">{order.paymentMethod}</div>
                      </td>
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="p-1 rounded bg-transparent border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-gray-300"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      
                      {/* Assign Rider column */}
                      <td className="py-4">
                        <select
                          value={order.deliveryPartner?._id || order.deliveryPartner || ''}
                          onChange={(e) => handleAssignRider(order._id, e.target.value)}
                          className="p-1 rounded bg-transparent border border-gray-200 dark:border-slate-800 font-medium text-gray-700 dark:text-gray-300 w-36"
                        >
                          <option value="">-- Assign Rider --</option>
                          {deliveryPartners.map(rider => (
                            <option key={rider._id} value={rider._id}>{rider.name}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 text-right">
                        <Link 
                          to={`/orders/${order._id}/tracking`}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg font-bold border border-gray-200 dark:border-slate-800"
                        >
                          Track Package
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-400 font-bold">No customer orders placed yet.</p>
          )}
        </div>
      )}

      {/* Tab: Inventory CRUD Management */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Store Inventory</h2>
              <button
                onClick={() => {
                  setEditProductId(null);
                  setPName('');
                  setPPrice('');
                  setPDescription('');
                  setPImage('');
                  setPStock('100');
                  setPDiscount('0');
                  setPIsTrending(false);
                  setPIsPopular(false);
                  setShowProductForm(!showProductForm);
                }}
                className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold flex items-center transition cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </button>
            </div>

            {/* Product Create/Edit form card */}
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white">
                  {editProductId ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Product Name</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="Tata Salt, Fortune Oil..."
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={pPrice}
                      onChange={(e) => setPPrice(e.target.value)}
                      placeholder="99"
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={pDiscount}
                      onChange={(e) => setPDiscount(e.target.value)}
                      placeholder="5"
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400">Available Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      placeholder="100"
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Image URL</label>
                    <input
                      type="text"
                      required
                      value={pImage}
                      onChange={(e) => setPImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Description</label>
                    <textarea
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      placeholder="Provide nutritional benefits and details..."
                      rows="3"
                      className="w-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white"
                    ></textarea>
                  </div>
                  
                  {/* Badges toggles */}
                  <div className="flex items-center space-x-3 mt-2 sm:col-span-3">
                    <label className="flex items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={pIsTrending}
                        onChange={(e) => setPIsTrending(e.target.checked)}
                        className="mr-2 rounded text-primary-500 accent-primary-500"
                      />
                      Trending Product
                    </label>
                    <label className="flex items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={pIsPopular}
                        onChange={(e) => setPIsPopular(e.target.checked)}
                        className="mr-2 rounded text-primary-500 accent-primary-500"
                      />
                      Popular Product
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditProductId(null);
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-800 text-gray-500 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold"
                  >
                    {editProductId ? 'Save Product Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            )}

            {/* Products grid */}
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-44 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>
                ))}
              </div>
            ) : productsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsList.map(prod => (
                  <div key={prod._id} className="p-3 border border-gray-200 dark:border-slate-800 rounded-2xl bg-gray-50/20 dark:bg-slate-900/10 flex flex-col justify-between relative">
                    <div>
                      <div className="w-full pt-[75%] relative overflow-hidden bg-white rounded-xl border border-gray-100 dark:border-slate-800">
                        <img src={prod.image} alt={prod.name} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-xs line-clamp-2">{prod.name}</h4>
                        <span className="text-[9px] uppercase font-bold text-gray-400 block mt-0.5">{prod.category}</span>
                        <div className="flex items-baseline space-x-2 mt-1">
                          <span className="font-black text-gray-900 dark:text-white text-sm">₹{prod.price}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{Math.round(prod.price * 1.15)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 block mt-1">Stock Left: <span className={prod.stock < 10 ? 'text-red-500 font-extrabold' : 'text-primary-500'}>{prod.stock}</span></span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-1.5 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-slate-800 rounded-lg text-[10px] flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg text-[10px] flex items-center justify-center"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-gray-400 font-bold">Catalog inventory is currently empty.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Users & Roles promotions */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">User Accounts</h2>

          {usersLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>
              ))}
            </div>
          ) : usersList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-400 font-bold uppercase">
                    <th className="py-3">Name</th>
                    <th className="py-3">Email Address</th>
                    <th className="py-3">Current Role</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-805 dark:text-gray-205">
                  {usersList.map(u => (
                    <tr key={u._id}>
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">{u.name}</td>
                      <td className="py-3.5 text-gray-400">{u.email}</td>
                      <td className="py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handlePromoteUser(u._id, e.target.value)}
                          className="p-1 rounded bg-transparent border border-gray-200 dark:border-slate-800 font-bold uppercase text-[10px] text-gray-700 dark:text-gray-300"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="delivery">Delivery Partner</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 bg-red-50 hover:bg-red-155 text-red-500 border border-red-200 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-400 font-bold">No registered user accounts found.</p>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
