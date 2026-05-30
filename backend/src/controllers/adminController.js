import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get Admin Dashboard Stats (Cards, Analytics, Charts)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    // 2. Revenue analytics (Sum of total pricing of PAID orders)
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.pricing.totalPrice, 0);

    // 3. Low stock inventory check (less than 10 units)
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select('name stock price category').limit(5);

    // 4. Sales by category
    const categorySalesMap = {};
    paidOrders.forEach(order => {
      order.orderItems.forEach(item => {
        // Find product category
        const cat = item.category || 'Other';
        const lineTotal = item.price * item.quantity;
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + lineTotal;
      });
    });

    const categorySales = Object.keys(categorySalesMap).map(key => ({
      name: key,
      value: Math.round(categorySalesMap[key])
    }));

    // 5. Monthly Sales chart data (last 6 months)
    const monthlySalesMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    paidOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlySalesMap[monthYear] = (monthlySalesMap[monthYear] || 0) + order.pricing.totalPrice;
    });

    // Format sales data
    const monthlySales = Object.keys(monthlySalesMap).map(key => ({
      month: key,
      sales: Math.round(monthlySalesMap[key])
    })).slice(-6); // last 6 records

    res.json({
      cards: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockCount
      },
      lowStockProducts,
      categorySales,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'admin', 'delivery'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role type' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
        // Prevent accidental deletion of primary admin
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot delete the last administrator user' });
        }
      }
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
