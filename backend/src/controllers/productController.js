import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';

// @desc    Get all products (with search and filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let apiQuery = Product.find(query);

    // Sorting
    if (sort) {
      if (sort === 'price_low') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === 'price_high') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        apiQuery = apiQuery.sort({ ratings: -1 });
      } else if (sort === 'discount') {
        apiQuery = apiQuery.sort({ discount: -1 });
      } else {
        apiQuery = apiQuery.sort({ createdAt: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular products
// @route   GET /api/products/popular
// @access  Public
export const getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find({ isPopular: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN ACTIONS BELOW

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, discount, isTrending, isPopular } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock,
      discount: discount || 0,
      isTrending: isTrending || false,
      isPopular: isPopular || false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, discount, isTrending, isPopular } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.discount = discount !== undefined ? discount : product.discount;
      product.isTrending = isTrending !== undefined ? isTrending : product.isTrending;
      product.isPopular = isPopular !== undefined ? isPopular : product.isPopular;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get smart product recommendations based on history
// @route   GET /api/products/recommendations
// @access  Public (Optional auth)
export const getRecommendations = async (req, res) => {
  try {
    let userId = null;
    
    // Check if token is passed in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        userId = decoded.id;
      } catch (err) {
        console.error('Error verifying token for optional recommendations:', err);
      }
    }

    let buyAgain = [];
    let frequentlyOrdered = [];
    let recentlyPurchased = [];
    let monthlyEssentials = [];
    let recommendedGroceries = [];

    // Categories that represent monthly grocery essentials
    const essentialsCategories = [
      'Rice & Grains',
      'Atta & Flour',
      'Pulses & Dal',
      'Oil & Ghee',
      'Spices & Masala',
      'Cleaning Essentials',
      'Household Items'
    ];

    // Fetch fallback monthly essentials
    monthlyEssentials = await Product.find({
      category: { $in: essentialsCategories }
    }).limit(6);

    // Fetch fallback general recommendations (highest discount/ratings)
    recommendedGroceries = await Product.find({
      $or: [{ isPopular: true }, { isTrending: true }]
    }).limit(8);

    if (userId) {
      // Fetch user's orders to analyze purchase history
      const orders = await Order.find({ user: userId, status: { $ne: 'Cancelled' } }).sort({ createdAt: -1 });

      if (orders.length > 0) {
        // Recently Purchased items from the last order
        const lastOrder = orders[0];
        const lastOrderProductIds = lastOrder.orderItems.map(item => item.product);
        recentlyPurchased = await Product.find({ _id: { $in: lastOrderProductIds } });

        // Compile product counts for frequently ordered items
        const productFrequency = {};
        orders.forEach(order => {
          order.orderItems.forEach(item => {
            const pId = item.product.toString();
            productFrequency[pId] = (productFrequency[pId] || 0) + item.quantity;
          });
        });

        // Sort productIds by frequency
        const sortedProductIds = Object.keys(productFrequency)
          .sort((a, b) => productFrequency[b] - productFrequency[a]);

        // Get full product documents
        const pastPurchasedProducts = await Product.find({ _id: { $in: sortedProductIds } });
        
        // Match the sorting order from the frequency calculation
        const orderedPurchases = sortedProductIds
          .map(id => pastPurchasedProducts.find(p => p._id.toString() === id))
          .filter(Boolean);

        buyAgain = orderedPurchases.slice(0, 8);
        frequentlyOrdered = orderedPurchases.filter(p => productFrequency[p._id.toString()] > 1).slice(0, 8);
        
        // If frequently ordered is empty, fill it with general buyAgain items
        if (frequentlyOrdered.length === 0) {
          frequentlyOrdered = buyAgain.slice(0, 4);
        }

        // Custom recommended: popular products that the user has NOT purchased yet
        const purchasedIds = new Set(sortedProductIds);
        const popularProducts = await Product.find({
          $or: [{ isPopular: true }, { isTrending: true }],
          _id: { $nin: Array.from(purchasedIds) }
        }).limit(8);

        if (popularProducts.length > 0) {
          recommendedGroceries = popularProducts;
        }
      }
    }

    res.json({
      buyAgain,
      frequentlyOrdered,
      recentlyPurchased,
      monthlyEssentials,
      recommendedGroceries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
