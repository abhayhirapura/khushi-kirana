import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    pricing
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // Check inventory stock before finalizing
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${product.stock}` });
      }
    }

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      pricing,
      estimatedDelivery: req.body.estimatedDelivery || undefined,
      // If Cash on Delivery, set payment as false, status is Placed.
      isPaid: false,
      status: 'Placed'
    });

    const createdOrder = await order.save();

    // Clear user's cart on successful checkout
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if logged in user is the owner or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, unauthorized order view' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tracking details for an order
// @route   GET /api/orders/:id/tracking
// @access  Private
export const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('status trackingId estimatedDelivery updatedAt createdAt');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Define standard steps for grocery order delivery
    const steps = [
      { name: 'Placed', description: 'Order received and confirmed', completed: false, date: null },
      { name: 'Processing', description: 'Groceries are being packed', completed: false, date: null },
      { name: 'Shipped', description: 'Order left the local store', completed: false, date: null },
      { name: 'Out For Delivery', description: 'Rider is on the way to your address', completed: false, date: null },
      { name: 'Delivered', description: 'Delivered to your doorstep', completed: false, date: null }
    ];

    // Determine current index based on status
    const statusMap = {
      'Placed': 0,
      'Processing': 1,
      'Shipped': 2,
      'Out For Delivery': 3,
      'Delivered': 4,
      'Cancelled': -1
    };

    const currentIndex = statusMap[order.status];

    // Set timestamps and completed states
    for (let i = 0; i <= currentIndex; i++) {
      if (steps[i]) {
        steps[i].completed = true;
        // Mock timestamps based on order logs
        if (i === 0) steps[i].date = order.createdAt;
        else if (i === currentIndex) steps[i].date = order.updatedAt;
        else {
          // interpolate dates
          const diff = order.updatedAt.getTime() - order.createdAt.getTime();
          const stepTime = new Date(order.createdAt.getTime() + (diff * (i / currentIndex)));
          steps[i].date = stepTime;
        }
      }
    }

    res.json({
      orderId: order._id,
      trackingId: order.trackingId,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      steps
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN ACTIONS BELOW

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (status) {
        order.status = status;
      }
      
      if (req.body.deliveryPartner !== undefined) {
        order.deliveryPartner = req.body.deliveryPartner || null;
        // When partner is assigned, order status automatically advances to Shipped if it was Placed or Processing
        if (order.status === 'Placed' || order.status === 'Processing') {
          order.status = 'Shipped';
        }
      }
      
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        // If payment method is COD, make sure delivering also marks it as paid
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available unassigned orders for delivery partners
// @route   GET /api/orders/delivery/available
// @access  Private/Delivery
export const getAvailableOrders = async (req, res) => {
  try {
    // Orders that are Placed or Processing and have NO delivery partner assigned yet
    const orders = await Order.find({
      status: { $in: ['Placed', 'Processing', 'Shipped'] },
      $or: [
        { deliveryPartner: { $exists: false } },
        { deliveryPartner: null }
      ]
    }).populate('user', 'name').sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders assigned to the logged-in delivery partner
// @route   GET /api/orders/delivery/assigned
// @access  Private/Delivery
export const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user._id
    }).populate('user', 'name').sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Self-assign an order to the logged-in delivery partner
// @route   PUT /api/orders/:id/assign
// @access  Private/Delivery
export const assignOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({ message: 'Order already assigned to another partner' });
    }

    order.deliveryPartner = req.user._id;
    order.status = 'Shipped'; // update to Shipped upon partner pick up
    order.deliveryPartnerEarning = 45; // flat ₹45 per successful delivery commission

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order delivery status by delivery partner
// @route   PUT /api/orders/:id/delivery-status
// @access  Private/Delivery
export const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body; // should be 'Out For Delivery' or 'Delivered'

  if (!['Out For Delivery', 'Delivered', 'Shipped'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status for delivery partner' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.deliveryPartner && order.deliveryPartner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, order assigned to someone else' });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      // If COD, mark as paid upon delivery
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings summary for the delivery partner
// @route   GET /api/orders/delivery/earnings
// @access  Private/Delivery
export const getDeliveryEarnings = async (req, res) => {
  try {
    const completedOrders = await Order.find({
      deliveryPartner: req.user._id,
      status: 'Delivered'
    });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryPartnerEarning || 0), 0);

    res.json({
      completedDeliveriesCount: completedOrders.length,
      totalEarnings,
      commissionPerDelivery: 45
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
