import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrderTracking = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTracking = async () => {
    try {
      const { data: orderDetail } = await API.get(`/orders/${id}`);
      setOrder(orderDetail);

      const { data: track } = await API.get(`/orders/${id}/tracking`);
      setTrackingData(track);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tracking info:', err);
      setError(err.response?.data?.message || 'Failed to load tracking data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    // Auto-poll tracking data every 8 seconds for true real-time experience
    const interval = setInterval(fetchTracking, 8000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-semibold animate-pulse">Loading live tracking details...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !trackingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg p-4">
        <div className="max-w-md w-full bg-white dark:bg-darkCard p-8 rounded-3xl border border-gray-200 dark:border-darkBorder text-center shadow-lg">
          <div className="text-red-500 text-5xl mb-4 font-black">!</div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Order Tracking Unavailable</h3>
          <p className="text-sm text-gray-550 dark:text-gray-405 mt-2">{error || 'Order could not be located.'}</p>
          <Link to="/" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Map status values to index
  const statusStepMap = {
    'Placed': 0,
    'Processing': 1,
    'Shipped': 2,
    'Out For Delivery': 3,
    'Delivered': 4,
    'Cancelled': -1
  };

  const currentStepIndex = statusStepMap[order.status];

  // Steps detailed configuration
  const steps = [
    { label: 'Order Placed', desc: 'We have received your order.', icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Packed & Processing', desc: 'Annu Rajawat Heerapura’s store is packing your fresh items.', icon: Clock, color: 'text-amber-500' },
    { label: 'Shipped / Picked Up', desc: 'Rider picked up your package.', icon: Truck, color: 'text-indigo-500' },
    { label: 'Out For Delivery', desc: 'Rider is on the way to your door.', icon: Truck, color: 'text-purple-500' },
    { label: 'Delivered', desc: 'Enjoy your groceries!', icon: CheckCircle, color: 'text-green-500' }
  ];

  const getETAString = () => {
    if (order.status === 'Delivered') return 'Delivered successfully!';
    if (order.status === 'Cancelled') return 'Order was cancelled.';
    
    const etaDate = new Date(order.estimatedDelivery);
    const options = { hour: '2-digit', minute: '2-digit' };
    return `Arriving by ${etaDate.toLocaleTimeString([], options)} (Same Day)`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <Link to="/profile?tab=orders" className="inline-flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Orders
      </Link>

      <div className="space-y-6">
        
        {/* Live Status Header */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-accent-500 w-full"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-2.5 py-1 rounded-md">Live Status</span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                {order.status === 'Cancelled' ? 'Order Cancelled' : `Order is ${order.status}`}
              </h2>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {getETAString()}
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shrink-0">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Tracking ID</span>
              <span className="text-base font-black text-gray-800 dark:text-gray-100 tracking-wider block uppercase">{order.trackingId}</span>
            </div>
          </div>
        </div>

        {/* Timeline Tracking */}
        {order.status !== 'Cancelled' ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-6">Delivery Timeline</h3>
            
            <div className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 dark:border-slate-800 ml-3.5 space-y-8 pb-2">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <div key={idx} className="relative">
                    
                    {/* Circle Node */}
                    <div className={`absolute -left-[39px] sm:-left-[47px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20 scale-110'
                        : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h4 className={`text-sm font-bold transition ${
                          isCurrent 
                            ? 'text-primary-500 dark:text-primary-400 font-extrabold text-base' 
                            : isCompleted 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {step.label}
                        </h4>
                        <p className={`text-xs mt-0.5 max-w-md ${isCurrent ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400'}`}>
                          {step.desc}
                        </p>
                      </div>

                      {isCompleted && trackingData.steps[idx]?.date && (
                        <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                          {new Date(trackingData.steps[idx].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl p-6 text-center">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">This order was cancelled</h3>
            <p className="text-xs text-red-500 dark:text-red-450 mt-1">If money was deducted, it will be refunded back to your source account within 3-5 business days.</p>
          </div>
        )}

        {/* Assigned Rider Info */}
        {order.deliveryPartner && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-450 to-primary-600 flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Delivery Executive Assigned</span>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">Rider Exec</h4>
                <p className="text-xs text-gray-400 mt-0.5">Assigned to complete your delivery safely.</p>
              </div>
            </div>
            <a href="tel:+919876543210" className="p-3 bg-primary-50 dark:bg-primary-950/20 hover:bg-primary-100 text-primary-500 rounded-full transition">
              <Phone className="w-5 h-5" />
            </a>
          </div>
        )}

        {/* Delivery Details Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-black text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">
            Delivery Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Address */}
            <div className="space-y-1.5">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase">
                <MapPin className="w-4 h-4 mr-1 text-primary-500" /> Shipping Address
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {order.shippingAddress.street}
              </p>
              <p className="text-xs text-gray-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
              </p>
            </div>

            {/* Payment info */}
            <div className="space-y-1.5">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase">
                <ShieldCheck className="w-4 h-4 mr-1 text-accent-500" /> Payment & Billing
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                ₹{Math.round(order.pricing.totalPrice)}
              </p>
              <p className="text-xs text-gray-400 flex items-center">
                Method: <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">{order.paymentMethod}</span>
              </p>
              <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md ${
                order.isPaid
                  ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
              }`}>
                {order.isPaid ? 'PAID SUCCESSFULLY' : 'PAYMENT PENDING / CASH ON DELIVERY'}
              </span>
            </div>

          </div>

          {/* Items checklist */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Items Packed</h4>
            <div className="space-y-2.5">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs text-gray-750 dark:text-gray-300">
                  <span className="truncate">{item.name} <span className="font-bold text-gray-900 dark:text-white">x {item.quantity}</span></span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{Math.round(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
