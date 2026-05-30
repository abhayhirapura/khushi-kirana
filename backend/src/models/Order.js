import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Razorpay', 'COD'],
    default: 'COD'
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  pricing: {
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    deliveryCharges: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 }
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Placed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  trackingId: {
    type: String,
    unique: true,
    default: function() {
      return 'KK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  estimatedDelivery: {
    type: Date,
    default: function() {
      const now = new Date();
      now.setHours(now.getHours() + 3);
      return now;
    }
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryPartnerEarning: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for production database optimization
orderSchema.index({ user: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
