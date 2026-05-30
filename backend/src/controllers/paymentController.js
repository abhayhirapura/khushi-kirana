import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Initialize Razorpay
// If environment variables are missing, we fall back to a mock mode
const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpay = null;
if (key_id && key_secret) {
  try {
    razorpay = new Razorpay({ key_id, key_secret });
  } catch (error) {
    console.error('Error initializing Razorpay:', error.message);
  }
}

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  try {
    // If Razorpay keys are not configured, run in Mock Mode
    if (!razorpay) {
      console.log('Razorpay is not configured. Running in Mock Mode.');
      return res.json({
        id: 'mock_order_' + Math.random().toString(36).substr(2, 9),
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: 'receipt_mock_' + Math.random().toString(36).substr(2, 9),
        isMock: true
      });
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: 'receipt_rp_' + Math.random().toString(36).substr(2, 9)
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    orderId,
    isMock
  } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle Mock Verification
    if (isMock || !razorpay) {
      console.log('Verifying payment in Mock Mode.');
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentResult = {
        id: razorpay_payment_id || 'mock_pay_' + Math.random().toString(36).substr(2, 9),
        status: 'Verified (Mock)',
        update_time: new Date().toISOString()
      };
      
      await order.save();
      return res.json({ success: true, message: 'Mock payment verified successfully', order });
    }

    // Standard cryptographic signature check
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'Verified',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };

      await order.save();
      res.json({ success: true, message: 'Payment verified successfully', order });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};
