import React, { useEffect, useState } from 'react';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Truck, 
  MapPin, 
  Phone, 
  TrendingUp, 
  CheckCircle, 
  Clipboard, 
  ShieldCheck, 
  IndianRupee, 
  Map, 
  Power 
} from 'lucide-react';

const DeliveryPartnerDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(true);
  
  // Stats
  const [earnings, setEarnings] = useState({
    completedDeliveriesCount: 0,
    totalEarnings: 0,
    commissionPerDelivery: 45
  });
  const [earningsLoading, setEarningsLoading] = useState(true);

  // Available unassigned orders
  const [availableOrders, setAvailableOrders] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(true);

  // Active assigned orders
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'delivery' || user.role === 'admin')) {
      fetchEarnings();
      fetchAvailableOrders();
      fetchAssignedOrders();
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const { data } = await API.get('/orders/delivery/earnings');
      setEarnings(data);
    } catch (err) {
      console.error('Error fetching earnings stats:', err);
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      setAvailableLoading(true);
      const { data } = await API.get('/orders/delivery/available');
      setAvailableOrders(data);
    } catch (err) {
      console.error('Error fetching available orders:', err);
    } finally {
      setAvailableLoading(false);
    }
  };

  const fetchAssignedOrders = async () => {
    try {
      setAssignedLoading(true);
      const { data } = await API.get('/orders/delivery/assigned');
      setAssignedOrders(data);
    } catch (err) {
      console.error('Error fetching assigned orders:', err);
    } finally {
      setAssignedLoading(false);
    }
  };

  // Claims an order from the available orders pool
  const handleClaimOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/assign`);
      alert('Order successfully claimed and assigned to you!');
      fetchAvailableOrders();
      fetchAssignedOrders();
    } catch (err) {
      console.error('Error claiming order:', err);
      alert(err.response?.data?.message || 'Failed to claim order.');
    }
  };

  // Update order delivery status ('Out For Delivery', 'Delivered')
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await API.put(`/orders/${orderId}/delivery-status`, { status: nextStatus });
      fetchAssignedOrders();
      fetchEarnings();
      if (nextStatus === 'Delivered') {
        alert('Order marked as delivered successfully! Keep up the great work! 🎉');
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  if (!user || (user.role !== 'delivery' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-darkBg">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-655 p-6 rounded-3xl text-center max-w-sm border border-red-200 dark:border-red-800">
          <Truck className="w-12 h-12 mx-auto mb-2 text-red-500 animate-bounce" />
          <h3 className="font-extrabold text-lg">Delivery Panel Only</h3>
          <p className="text-xs mt-1">This section is restricted to registered Annu Rajawat Heerapura delivery executives.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Rider Header block */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-905 dark:text-white flex items-center">
                Welcome, {user.name.split(' ')[0]} ⚡
              </h1>
              <p className="text-xs font-semibold text-gray-400">Khusi Kirana Delivery Executive Partner</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Status light tag */}
            <span className={`inline-flex items-center text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full ${
              isOnline 
                ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-505 animate-pulse' : 'bg-gray-400'}`}></span>
              {isOnline ? 'Rider Active & Online' : 'Rider Offline'}
            </span>

            {/* Toggle switch button */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                isOnline 
                  ? 'bg-red-50 hover:bg-red-100 text-red-500 border-red-200' 
                  : 'bg-green-50 hover:bg-green-100 text-green-655 border-green-200'
              }`}
              title={isOnline ? 'Go Offline' : 'Go Online'}
            >
              <Power className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-850 gap-1 mb-8">
        {[
          { id: 'overview', label: 'Earnings Overview', icon: TrendingUp },
          { id: 'active', label: 'My Deliveries', icon: Truck },
          { id: 'pool', label: 'Order Pool', icon: Clipboard }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-xs font-extrabold rounded-xl transition cursor-pointer capitalize gap-1.5 ${
                activeTab === tab.id 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TABS PANELS */}

      {/* Panel 1: Earnings & Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 flex items-center space-x-4 shadow-sm">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Earnings</span>
                <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">₹{earnings.totalEarnings}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 flex items-center space-x-4 shadow-sm">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Deliveries Completed</span>
                <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">{earnings.completedDeliveriesCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 flex items-center space-x-4 shadow-sm">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Rate per Delivery</span>
                <span className="text-xl font-black text-gray-900 dark:text-white mt-1 block">₹{earnings.commissionPerDelivery}</span>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Completed Deliveries Log</h3>
            
            {earningsLoading ? (
              <div className="h-10 bg-gray-100 dark:bg-slate-850 rounded-xl animate-pulse"></div>
            ) : assignedOrders.filter(o => o.status === 'Delivered').length > 0 ? (
              <div className="space-y-4">
                {assignedOrders.filter(o => o.status === 'Delivered').map(order => (
                  <div key={order._id} className="flex justify-between items-center text-xs p-3 border border-gray-100 dark:border-slate-850 rounded-xl">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block uppercase">Tracking: {order.trackingId}</span>
                      <span className="text-[10px] text-gray-450">{new Date(order.deliveredAt || order.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-500 block">+ ₹{order.deliveryPartnerEarning || 45}</span>
                      <span className="text-[9px] uppercase font-bold text-gray-400">{order.paymentMethod} Payment</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-gray-400 font-semibold">Earn flat ₹45 commission for every successfully completed kirana delivery order!</p>
            )}
          </div>
        </div>
      )}

      {/* Panel 2: Assigned Orders (Active rider deliveries) */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Active Deliveries</h2>

          {assignedLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-slate-850 rounded-2xl"></div>
              ))}
            </div>
          ) : assignedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length > 0 ? (
            <div className="space-y-6">
              {assignedOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').map(order => (
                <div key={order._id} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  
                  {/* Top order metadata block */}
                  <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-3 gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-accent-500 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20">{order.status}</span>
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-sm mt-1 uppercase">Track ID: {order.trackingId}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Collect cash</span>
                      <span className="text-sm font-black text-gray-905 dark:text-white block">₹{Math.round(order.pricing.totalPrice)} ({order.paymentMethod})</span>
                    </div>
                  </div>

                  {/* Customer shipping address details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-primary-500" /> Shipping Destination Address
                      </span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.shippingAddress.street}</p>
                      <p className="text-xs text-gray-450">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-blue-500" /> Customer Contact
                      </span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{order.user?.name || 'Customer'}</p>
                      <a href="tel:+919876543210" className="inline-flex items-center text-xs text-primary-500 hover:underline font-bold mt-0.5">
                        Call customer +91 98765 43210
                      </a>
                    </div>
                  </div>

                  {/* Actions checklist footer */}
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-850 flex flex-wrap gap-2.5 justify-end">
                    <button
                      onClick={() => alert(`Opening Google Maps navigation simulator for address: ${order.shippingAddress.street}, ${order.shippingAddress.city}`)}
                      className="px-4 py-2 border border-gray-250 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-655 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-slate-850 transition"
                    >
                      <Map className="w-4 h-4 text-blue-500" /> Navigate
                    </button>

                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Out For Delivery')}
                        className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Start Delivery: Out For Delivery
                      </button>
                    )}

                    {order.status === 'Out For Delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Confirm Delivered & Collect Cash
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm">
              <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No active assigned deliveries currently.</p>
              <button onClick={() => setActiveTab('pool')} className="text-xs text-primary-500 font-bold hover:underline block mt-2 mx-auto">Claim orders from the pool pool</button>
            </div>
          )}
        </div>
      )}

      {/* Panel 3: Order Pool (available deliveries) */}
      {activeTab === 'pool' && (
        <div className="space-y-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Delivery Order Pool</h2>
          
          {!isOnline ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 p-5 rounded-3xl text-center border border-amber-200">
              <p className="text-sm font-semibold">You are currently offline.</p>
              <p className="text-xs mt-1">Please toggle your state to Online in order to view and claim delivery orders from the available pool.</p>
            </div>
          ) : availableLoading ? (
            <div className="h-28 bg-gray-100 dark:bg-slate-850 rounded-2xl animate-pulse"></div>
          ) : availableOrders.length > 0 ? (
            <div className="space-y-4">
              {availableOrders.map(order => (
                <div key={order._id} className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded uppercase">{order.status}</span>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-xs mt-1">Order by {order.user?.name || 'Customer'}</h4>
                    <p className="text-xs text-gray-450 mt-1 max-w-md flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-primary-500 shrink-0" />
                      {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.zipCode}
                    </p>
                    <span className="text-[10px] text-primary-400 font-bold block mt-1.5">Payout: ₹45 Commission</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-gray-900 dark:text-white block">₹{Math.round(order.pricing.totalPrice)}</span>
                    <span className="text-[10px] text-gray-400 block">{order.paymentMethod}</span>
                    <button
                      onClick={() => handleClaimOrder(order._id)}
                      className="mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-655 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-sm"
                    >
                      Claim Delivery Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No available orders in the pool right now.</p>
              <p className="text-xs mt-0.5">Please check back in a few minutes when new customer orders are placed.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DeliveryPartnerDashboard;
