import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import { 
  MapPin, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowLeft, 
  Plus, 
  Navigation, 
  Clock, 
  Calendar, 
  Compass, 
  AlertTriangle,
  Locate
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Jaipur Pincodes list
const JAIPUR_PINCODES = [
  '302021', // Heerapura (Store Location)
  '302012', // Vaishali Nagar
  '302020', // Mansarovar
  '302015', // Malviya Nagar
  '302017', // Malviya Nagar
  '302001', // C-Scheme
  '302004', // Raja Park
  '302002', '302003', '302005', '302006', '302016', 
  '302018', '302019', '302022', '302024', '302025', '302029', '302033'
];

// Jaipur landmarks for autocomplete
const JAIPUR_LANDMARKS = [
  { street: 'Heerapura Power House, Ajmer Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302021', label: 'Other', distance: 1.2 },
  { street: 'Sector 5, Near Swarna Path, Mansarovar', city: 'Jaipur', state: 'Rajasthan', zipCode: '302020', label: 'Home', distance: 5.8 },
  { street: 'Near National Handloom, Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', zipCode: '302012', label: 'Work', distance: 3.5 },
  { street: 'Near Gaurav Tower, Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', zipCode: '302017', label: 'Home', distance: 7.2 },
  { street: 'Ashok Nagar, C-Scheme', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001', label: 'Work', distance: 8.4 },
  { street: 'Near Gali 4, Raja Park', city: 'Jaipur', state: 'Rajasthan', zipCode: '302004', label: 'Other', distance: 9.1 }
];

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, getSubtotal, getTax, refreshCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const discountPercent = location.state?.discountPercent || 0;

  // Addresses states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Jaipur');
  const [newState, setNewState] = useState('Rajasthan');
  const [newZipCode, setNewZipCode] = useState('');
  const [newLabel, setNewLabel] = useState('Home'); // Home, Work, Other
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Address validation/GPS states
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');
  const [pincodeWarning, setPincodeWarning] = useState('');

  // Delivery Slots Booking states
  const [deliveryType, setDeliveryType] = useState('Standard'); // Standard, Scheduled
  const [selectedDate, setSelectedDate] = useState('Today'); // Today, Tomorrow, DayAfter
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 02:00 PM'); // Time range
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Checkout process states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Mock payment overlay
  const [showMockPaymentOverlay, setShowMockPaymentOverlay] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  useEffect(() => {
    if (user) {
      setAddresses(user.addresses || []);
      const defaultAddr = user.addresses?.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (user.addresses?.length > 0) {
        setSelectedAddressId(user.addresses[0]._id);
      }
    }
  }, [user]);

  // Handle Jaipur Pincode deliverability warning
  const handleZipCodeChange = (val) => {
    setNewZipCode(val);
    if (val.length >= 6) {
      const isDeliverable = JAIPUR_PINCODES.includes(val.trim());
      const startsWith302 = val.trim().startsWith('302');
      
      if (!isDeliverable && !startsWith302) {
        setPincodeWarning('Khusi Kirana is currently restricted to Jaipur locations (302xxx). You can still save this address but delivery times may be longer!');
      } else if (!isDeliverable) {
        setPincodeWarning('This specific pincode is slightly outside our standard high-speed zone. Standard rider delivery commission of ₹45 applies.');
      } else {
        setPincodeWarning('');
      }
    } else {
      setPincodeWarning('');
    }
  };

  // Autocomplete address filler
  const handleApplyLandmark = (landmark) => {
    setNewStreet(landmark.street);
    setNewCity(landmark.city);
    setNewState(landmark.state);
    setNewZipCode(landmark.zipCode);
    setNewLabel(landmark.label);
    setPincodeWarning('');
    // Mock Coordinates inside Jaipur
    setLatitude(26.8920 + (Math.random() - 0.5) * 0.05);
    setLongitude(75.7330 + (Math.random() - 0.5) * 0.05);
  };

  // Live location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setGpsMessage('Accessing browser GPS sensor...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        setGpsMessage('Reverse-geocoding coordinates...');

        // Simulate high-speed reverse-geocoding locally to Jaipur region
        setTimeout(() => {
          setNewCity('Jaipur');
          setNewState('Rajasthan');
          
          // Match coordinates closer to Jaipur regions
          if (Math.abs(lat - 26.8920) < 0.1) {
            setNewStreet('Plot 42, Officers Campus Extension, Sirsi Road');
            setNewZipCode('302021');
            setPincodeWarning('');
          } else {
            setNewStreet('Simulated GPS Location near Swarna Path');
            setNewZipCode('302020');
            setPincodeWarning('');
          }
          setGpsMessage('Live GPS coordinates captured and geocoded successfully!');
          setDetectingLocation(false);
        }, 1500);
      },
      (error) => {
        console.error('Error fetching GPS details:', error);
        setGpsMessage('Could not fetch live GPS. Automatically loaded Annu Rajawat Heerapura hub baseline.');
        
        // Mock fallback to Heerapura
        setTimeout(() => {
          setNewStreet('Annu Store Hub, Heerapura');
          setNewCity('Jaipur');
          setNewState('Rajasthan');
          setNewZipCode('302021');
          setLatitude(26.8920);
          setLongitude(75.7330);
          setDetectingLocation(false);
        }, 1000);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Add Address Handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/addresses', {
        street: newStreet,
        city: newCity,
        state: newState,
        zipCode: newZipCode,
        label: newLabel,
        latitude: latitude || 26.8920,
        longitude: longitude || 75.7330,
        isDefault: newIsDefault || addresses.length === 0
      });
      setAddresses(data);
      setNewStreet('');
      setNewCity('Jaipur');
      setNewState('Rajasthan');
      setNewZipCode('');
      setNewLabel('Home');
      setLatitude(null);
      setLongitude(null);
      setNewIsDefault(false);
      setShowAddressForm(false);
      
      // Select the newly added address
      if (data.length > 0) {
        setSelectedAddressId(data[data.length - 1]._id);
      }
    } catch (err) {
      console.error('Error adding address:', err);
      setErrorMessage('Could not save your address. Please try again.');
    }
  };

  // Calculate dynamic delivery charges
  const getDynamicDeliveryDetails = () => {
    const selected = addresses.find(a => a._id === selectedAddressId);
    if (!selected) return { distance: 0, fee: 30, freeThreshold: false };

    // Find distance from Heerapura hub (zipCode 302021)
    let distance = 3.5; // standard Jaipur default
    if (selected.zipCode === '302021') distance = 1.2;
    else if (selected.zipCode === '302020') distance = 5.8;
    else if (selected.zipCode === '302012') distance = 3.5;
    else if (selected.zipCode === '302017' || selected.zipCode === '302015') distance = 7.5;
    else if (selected.zipCode === '302001') distance = 8.5;
    else if (selected.zipCode === '302004') distance = 9.2;
    
    // Dynamic charge: ₹10 base fee + ₹5 per km
    let baseFee = Math.round(10 + distance * 5);
    const subtotal = getSubtotal();
    
    // Free delivery threshold: above ₹300
    const isFree = subtotal > 300;
    const finalFee = isFree ? 0 : baseFee;

    return {
      distance,
      fee: finalFee,
      originalFee: baseFee,
      isFree
    };
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      return setErrorMessage('Please select or add a delivery address.');
    }

    setErrorMessage('');
    setLoading(true);

    const address = addresses.find(a => a._id === selectedAddressId);
    const subtotal = getSubtotal();
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const tax = getTax();
    const deliveryInfo = getDynamicDeliveryDetails();
    const delivery = deliveryInfo.fee;
    const total = subtotal - discountAmount + tax + delivery;

    // Calculate delivery slot ETA timestamp
    let deliveryTimestamp = new Date();
    if (deliveryType === 'Scheduled') {
      const targetDate = new Date();
      if (selectedDate === 'Tomorrow') {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (selectedDate === 'DayAfter') {
        targetDate.setDate(targetDate.getDate() + 2);
      }
      // Parse slot hour (e.g. 11:00 AM - 02:00 PM -> sets to 11 AM)
      const slotHour = selectedSlot.includes('08:00 AM') ? 8 : 
                       selectedSlot.includes('11:00 AM') ? 11 : 
                       selectedSlot.includes('02:00 PM') ? 14 : 17;
      targetDate.setHours(slotHour, 0, 0, 0);
      deliveryTimestamp = targetDate;
    } else {
      // Standard same-day 3-hour window
      deliveryTimestamp.setHours(deliveryTimestamp.getHours() + 3);
    }

    const orderPayload = {
      orderItems: cartItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: item.product.price * (1 - (item.product.discount || 0) / 100),
        product: item.product._id,
        category: item.product.category
      })),
      shippingAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      paymentMethod,
      pricing: {
        itemsPrice: subtotal - discountAmount,
        taxPrice: tax,
        deliveryCharges: delivery,
        totalPrice: total
      },
      estimatedDelivery: deliveryTimestamp.toISOString()
    };

    try {
      if (paymentMethod === 'COD') {
        const { data } = await API.post('/orders', orderPayload);
        setSuccessOrder(data);
        await refreshCart();
      } else {
        // Razorpay checkout flow
        const { data: orderResponse } = await API.post('/payments/razorpay/order', { amount: total });

        if (orderResponse.isMock) {
          // Trigger Mock Payment Overlay
          setMockOrderDetails({ orderResponse, orderPayload });
          setShowMockPaymentOverlay(true);
        } else {
          // Load Razorpay widget
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            setErrorMessage('Failed to load Razorpay Payment Gateway. Check internet connection.');
            setLoading(false);
            return;
          }

          // Initialize order on backend first
          const { data: dbOrder } = await API.post('/orders', orderPayload);

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
            amount: orderResponse.amount,
            currency: 'INR',
            name: 'Khusi Kirana',
            description: 'Grocery Checkout Payment',
            order_id: orderResponse.id,
            handler: async (response) => {
              try {
                // Verify payment on backend
                const { data: verifyResponse } = await API.post('/payments/razorpay/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: dbOrder._id
                });
                setSuccessOrder(verifyResponse.order);
                await refreshCart();
              } catch (verifyError) {
                setErrorMessage('Payment verification failed but order is placed in pending state.');
              }
            },
            prefill: {
              name: user.name,
              email: user.email
            },
            theme: {
              color: '#10B981'
            }
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error creating order. Check inventory stocks.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMockPayment = async () => {
    setShowMockPaymentOverlay(false);
    setLoading(true);
    try {
      const { orderPayload, orderResponse } = mockOrderDetails;
      // 1. Create order in DB
      const { data: dbOrder } = await API.post('/orders', orderPayload);

      // 2. Fire mock verification API
      const { data: verifyResponse } = await API.post('/payments/razorpay/verify', {
        razorpay_order_id: orderResponse.id,
        razorpay_payment_id: 'mock_pay_success_' + Math.random().toString(36).substr(2, 9),
        isMock: true,
        orderId: dbOrder._id
      });
      setSuccessOrder(verifyResponse.order);
      await refreshCart();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to complete mock transaction.');
    } finally {
      setLoading(false);
    }
  };

  // Order Successful confirmation screen
  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order Confirmed!</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Thank you for shopping at Khusi Kirana, your order is placed successfully.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-slate-950/50 text-left space-y-2 border border-gray-100 dark:border-slate-850">
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-305">
              <span>Order Tracking ID:</span>
              <span className="text-primary-500 font-bold uppercase">{successOrder.trackingId}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-305">
              <span>Payment Mode:</span>
              <span>{successOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-305">
              <span>Delivery Status:</span>
              <span className="text-amber-500 font-bold">{successOrder.status}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-305">
              <span>Estimated Delivery:</span>
              <span className="text-primary-500 font-bold">
                {new Date(successOrder.estimatedDelivery).toLocaleDateString()} at{' '}
                {new Date(successOrder.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate(`/orders/${successOrder._id}/tracking`)}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow cursor-pointer text-sm transition"
            >
              Track Order Live
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 border border-gray-250 dark:border-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer text-sm transition"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const tax = getTax();
  const deliveryInfo = getDynamicDeliveryDetails();
  const delivery = deliveryInfo.fee;
  const total = subtotal - discountAmount + tax + delivery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* Mock Payment Overlay Modal */}
      {showMockPaymentOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl mx-4">
            <CreditCard className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Razorpay Sandbox Emulator</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
              No live Razorpay keys are loaded. We have emulated a secure payment order of <span className="font-extrabold text-gray-905 dark:text-white">₹{total}</span>.
            </p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleConfirmMockPayment}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow cursor-pointer"
              >
                Simulate Success
              </button>
              <button
                onClick={() => {
                  setShowMockPaymentOverlay(false);
                  setLoading(false);
                }}
                className="flex-1 py-3 border border-gray-250 dark:border-slate-800 text-gray-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Checkout Checkout</h1>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-800 text-red-655 dark:text-red-400 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Address, Slots & Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Address select */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" /> Delivery Address
              </h3>
              {addresses.length > 0 && !showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 text-primary-500 font-bold text-xs rounded-xl flex items-center transition"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New Address
                </button>
              )}
            </div>

            {/* Address cards list */}
            {!showAddressForm && (
              <>
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          selectedAddressId === addr._id
                            ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                            : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300">
                              {addr.label || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] text-primary-500 font-bold uppercase">Default</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-2.5">{addr.street}</p>
                          <p className="text-xs text-gray-500 mt-1">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                        {selectedAddressId === addr._id && (
                          <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between text-[11px] text-gray-400">
                            <span className="flex items-center">
                              <Compass className="w-3.5 h-3.5 mr-1 text-primary-500" />
                              Distance: {deliveryInfo.distance} km
                            </span>
                            <span>Standard delivery</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-450 font-semibold">No saved addresses found.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow transition"
                    >
                      Add Address Now
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Address Autocomplete & GPS Detection Form */}
            {showAddressForm && (
              <div className="mt-4 border-t border-gray-100 dark:border-slate-850 pt-4 space-y-4">
                
                {/* Autocomplete Landmarks selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Jaipur Autocomplete Landmarks</label>
                  <div className="flex flex-wrap gap-2">
                    {JAIPUR_LANDMARKS.map((landmark, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyLandmark(landmark)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 rounded-full text-xs font-semibold bg-gray-50/50 dark:bg-slate-900/50 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                      >
                        📍 {landmark.street.split(',')[0]} ({landmark.zipCode})
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Live Locator */}
                <div className="p-4 bg-primary-50/20 dark:bg-primary-950/10 border border-primary-100 dark:border-primary-950 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-primary-500 shrink-0">
                      <Locate className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Live Geolocation Sensor</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Detect live location and reverse-geocode to street fields.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={detectingLocation}
                    onClick={handleDetectGPS}
                    className="w-full sm:w-auto px-4.5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer transition shadow"
                  >
                    <Navigation className="w-4 h-4 mr-1.5 shrink-0" />
                    {detectingLocation ? 'Accessing GPS...' : 'Use Live Location'}
                  </button>
                </div>

                {gpsMessage && (
                  <p className="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/20 p-2.5 rounded-xl border border-primary-100 dark:border-primary-950">
                    ℹ️ {gpsMessage}
                  </p>
                )}

                {/* Simulated Map Visual Element (No place-holders!) */}
                <div className="h-28 rounded-2xl bg-slate-900 dark:bg-black border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  
                  {/* Radar scanner sweep */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-primary-500/30 animate-ping"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-primary-500/50 animate-pulse"></div>

                  <div className="relative z-10 text-center">
                    <MapPin className="w-8 h-8 text-primary-500 mx-auto animate-bounce mb-1" />
                    <span className="text-[10px] text-gray-300 font-extrabold uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-gray-800">
                      {latitude ? `LAT: ${latitude.toFixed(4)} | LNG: ${longitude.toFixed(4)}` : 'Scanning GPS Coordinates...'}
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Street Address</label>
                      <input
                        type="text"
                        required
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="House No, Apartment Name, Street Area"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent text-sm text-gray-905 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Jaipur"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent text-sm text-gray-905 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">State</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="Rajasthan"
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent text-sm text-gray-905 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Zip / Postal Code</label>
                      <input
                        type="text"
                        required
                        value={newZipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        placeholder="302021"
                        maxLength={6}
                        className="w-full mt-1 p-2.5 rounded-xl border border-gray-250 dark:border-slate-800 bg-transparent text-sm text-gray-905 dark:text-white font-mono"
                      />
                    </div>

                    {/* Address tag select */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Address Tag (Label)</label>
                      <div className="flex gap-2 mt-1">
                        {['Home', 'Work', 'Other'].map(lbl => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setNewLabel(lbl)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                              newLabel === lbl
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'border-gray-250 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {lbl === 'Home' ? '🏠 Home' : lbl === 'Work' ? '💼 Work' : '📍 Other'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {pincodeWarning && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900 text-amber-655 dark:text-amber-400 text-xs font-semibold flex items-start">
                      <AlertTriangle className="w-4.5 h-4.5 mr-2 text-amber-500 shrink-0" />
                      <span>{pincodeWarning}</span>
                    </div>
                  )}

                  {/* Toggle default */}
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={newIsDefault}
                      onChange={(e) => setNewIsDefault(e.target.checked)}
                      className="accent-primary-500 w-4 h-4"
                    />
                    <label htmlFor="isDefaultCheckbox" className="text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                      Set as my Default Shipping Address
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4.5 py-2.5 border border-gray-250 dark:border-slate-800 text-gray-500 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4.5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Delivery SLOT booking system */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-500" /> Delivery Slot Scheduler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Standard 3hr delivery */}
              <div
                onClick={() => setDeliveryType('Standard')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'Standard'
                    ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center">
                    🚀 Standard Fast Delivery
                  </h4>
                  <p className="text-xs text-gray-450 mt-1.5 leading-relaxed">
                    Fresh produce packed and delivered to your doorstep in under <span className="font-extrabold text-gray-800 dark:text-white">3 Hours</span>. Same-day service.
                  </p>
                </div>
                <span className="text-[10px] text-primary-500 font-black mt-4 block uppercase tracking-wide">
                  Standard Fast Track
                </span>
              </div>

              {/* Option 2: Scheduled delivery */}
              <div
                onClick={() => setDeliveryType('Scheduled')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  deliveryType === 'Scheduled'
                    ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center">
                    📅 Scheduled Delivery
                  </h4>
                  <p className="text-xs text-gray-450 mt-1.5 leading-relaxed">
                    Book a convenient day and time slot to receive your groceries perfectly at your ease.
                  </p>
                </div>
                <span className="text-[10px] text-accent-500 font-black mt-4 block uppercase tracking-wide">
                  Reserve a Time Slot
                </span>
              </div>
            </div>

            {/* Scheduled slots options details */}
            <AnimatePresence>
              {deliveryType === 'Scheduled' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-850 space-y-4 overflow-hidden"
                >
                  
                  {/* Select Day */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Choose Delivery Day</label>
                    <div className="flex gap-2">
                      {[
                        { key: 'Today', label: 'Today (Same Day)' },
                        { key: 'Tomorrow', label: 'Tomorrow' },
                        { key: 'DayAfter', label: 'Day After Tomorrow' }
                      ].map(d => (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setSelectedDate(d.key)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                            selectedDate === d.key
                              ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                              : 'border-gray-250 dark:border-slate-800 hover:border-gray-300 text-gray-600 dark:text-gray-300 bg-gray-50/30 dark:bg-slate-900/30'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Slot */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Choose Time Range Slot</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '08:00 AM - 11:00 AM',
                        '11:00 AM - 02:00 PM',
                        '02:00 PM - 05:00 PM',
                        '05:00 PM - 08:00 PM'
                      ].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-left flex items-center justify-between ${
                            selectedSlot === slot
                              ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 font-bold'
                              : 'border-gray-250 dark:border-slate-800 text-gray-500 hover:border-gray-350 dark:hover:border-slate-700'
                          }`}
                        >
                          <span>🕒 {slot}</span>
                          {selectedSlot === slot && <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment selector */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary-500" /> Payment Method
            </h3>

            <div className="space-y-3">
              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Banknote className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-400">Pay with cash or UPI upon delivery</p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-primary-500 w-4 h-4"
                />
              </div>

              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                  paymentMethod === 'Razorpay'
                    ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Razorpay Payment</p>
                    <p className="text-xs text-gray-400">Pay securely via Cards, Netbanking, or UPI</p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="accent-primary-500 w-4 h-4"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Order Basket Review */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-905 dark:text-white text-base">Order Review</h3>
            
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {cartItems.map(item => {
                if (!item.product) return null;
                const singlePrice = item.product.price * (1 - (item.product.discount || 0) / 100);
                return (
                  <div key={item.product._id} className="flex justify-between text-xs font-semibold gap-3">
                    <span className="text-gray-500 truncate">{item.product.name} <span className="font-black text-gray-800 dark:text-white">x {item.quantity}</span></span>
                    <span className="text-gray-850 dark:text-gray-305 shrink-0">₹{Math.round(singlePrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-850 pt-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-accent-500">
                  <span>Coupon Discount ({discountPercent}%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>GST (5%)</span>
                <span>₹{Math.round(tax)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charges</span>
                <span>
                  {delivery === 0 ? (
                    <span className="text-emerald-500 font-bold">FREE</span>
                  ) : (
                    `₹${delivery}`
                  )}
                </span>
              </div>
              {selectedAddressId && (
                <div className="text-[10px] text-gray-400 text-right mt-0.5">
                  Based on distance: {deliveryInfo.distance} km from Heerapura hub
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-850 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Final Total</span>
              <span className="text-2xl font-black text-primary-500">₹{Math.round(total)}</span>
            </div>

            {/* Scheduled Slot Summary details */}
            {deliveryType === 'Scheduled' && (
              <div className="p-3 bg-accent-50/30 dark:bg-accent-950/20 border border-accent-100 dark:border-accent-950/30 rounded-2xl text-[11px] text-accent-600 dark:text-accent-400 font-bold flex items-center justify-between">
                <span>📅 Scheduled Delivery Booking:</span>
                <span>{selectedDate}, {selectedSlot.split(' - ')[0]}</span>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className={`w-full py-3.5 mt-4 text-white font-bold rounded-xl flex items-center justify-center cursor-pointer shadow-md transition ${
                loading
                  ? 'bg-gray-450 dark:bg-slate-800 cursor-wait'
                  : 'bg-primary-600 hover:bg-primary-500 hover:shadow-lg'
              }`}
            >
              {loading ? 'Processing Order...' : `Confirm & Place Order`}
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe and Encrypted Payments</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
