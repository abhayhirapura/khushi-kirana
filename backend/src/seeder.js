import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

await connectDB();

// Predefined categories with Unsplash images
const categories = [
  { name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1610832958506-ee56336191d8?w=500&auto=format&fit=crop&q=60' },
  { name: 'Rice & Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60' },
  { name: 'Atta & Flour', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=60' },
  { name: 'Pulses & Dal', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
  { name: 'Oil & Ghee', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60' },
  { name: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=60' },
  { name: 'Snacks & Namkeen', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=60' },
  { name: 'Biscuits & Bakery', image: 'https://images.unsplash.com/photo-1558961309-db6f1a3eb84d?w=500&auto=format&fit=crop&q=60' },
  { name: 'Tea & Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60' },
  { name: 'Dry Fruits', image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&auto=format&fit=crop&q=60' },
  { name: 'Instant Food', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=500&auto=format&fit=crop&q=60' },
  { name: 'Noodles & Pasta', image: 'https://images.unsplash.com/photo-1612966608967-312ba599102e?w=500&auto=format&fit=crop&q=60' },
  { name: 'Sauces & Pickles', image: 'https://images.unsplash.com/photo-1589135002245-dfd227b686e0?w=500&auto=format&fit=crop&q=60' },
  { name: 'Personal Care', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&auto=format&fit=crop&q=60' },
  { name: 'Bath & Body', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop&q=60' },
  { name: 'Cleaning Essentials', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=60' },
  { name: 'Household Items', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=60' },
  { name: 'Baby Care', image: 'https://images.unsplash.com/photo-1522849475742-159e6feec3e8?w=500&auto=format&fit=crop&q=60' },
  { name: 'Pet Food', image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60' },
  { name: 'Frozen Food', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=60' },
  { name: 'Stationery', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60' },
  { name: 'Kitchen Essentials', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60' }
];

const products = [
  // Fruits & Vegetables
  {
    name: 'Fresh Organic Apples',
    description: 'Crisp and sweet organic red apples, packed with nutrients and direct from Himachal orchards.',
    price: 180,
    discount: 10,
    category: 'Fruits & Vegetables',
    stock: 50,
    ratings: 4.8,
    numReviews: 24,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },
  {
    name: 'Fresh Spinach (Palak) - 250g',
    description: 'Freshly harvested green spinach leaves, washed and ready to cook. High in iron.',
    price: 30,
    discount: 0,
    category: 'Fruits & Vegetables',
    stock: 30,
    ratings: 4.5,
    numReviews: 12,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60',
    isTrending: false,
    isPopular: true
  },
  {
    name: 'Fresh Tomatoes - 1kg',
    description: 'Juicy red tomatoes, perfect for curries, salads, and soups.',
    price: 45,
    discount: 15,
    category: 'Fruits & Vegetables',
    stock: 80,
    ratings: 4.2,
    numReviews: 40,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: false
  },

  // Rice & Grains
  {
    name: 'Basmati Rice Premium - 5kg',
    description: 'Long grain, highly aromatic Basmati rice, aged to perfection for beautiful biryanis and pulaos.',
    price: 650,
    discount: 12,
    category: 'Rice & Grains',
    stock: 25,
    ratings: 4.7,
    numReviews: 35,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Atta & Flour
  {
    name: 'Chakki Fresh Atta - 10kg',
    description: '100% whole wheat flour, stone-ground to retain natural nutrients, for soft rotis.',
    price: 460,
    discount: 8,
    category: 'Atta & Flour',
    stock: 40,
    ratings: 4.6,
    numReviews: 50,
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Pulses & Dal
  {
    name: 'Premium Toor Dal - 1kg',
    description: 'Unpolished and high-protein Arhar/Toor Dal, suitable for daily nutrition.',
    price: 160,
    discount: 5,
    category: 'Pulses & Dal',
    stock: 60,
    ratings: 4.4,
    numReviews: 18,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    isTrending: false,
    isPopular: true
  },

  // Oil & Ghee
  {
    name: 'Pure Desi Cow Ghee - 1L',
    description: 'Traditional danedar cow ghee with rich aroma and golden texture, packed in a tin.',
    price: 720,
    discount: 10,
    category: 'Oil & Ghee',
    stock: 20,
    ratings: 4.9,
    numReviews: 60,
    image: 'https://images.unsplash.com/photo-1622484211148-716598e04041?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Spices & Masala
  {
    name: 'Turmeric Powder (Haldi) - 200g',
    description: 'High-curcumin turmeric powder, ground from selected dried roots. Enhances immunity.',
    price: 55,
    discount: 5,
    category: 'Spices & Masala',
    stock: 100,
    ratings: 4.7,
    numReviews: 14,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60',
    isTrending: false,
    isPopular: false
  },

  // Snacks & Namkeen
  {
    name: 'Aloo Bhujia Namkeen - 400g',
    description: 'Crispy, spicy potato-chickpea flour noodles. The classic Indian teatime snack.',
    price: 110,
    discount: 10,
    category: 'Snacks & Namkeen',
    stock: 15, // Test low stock
    ratings: 4.6,
    numReviews: 28,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Biscuits & Bakery
  {
    name: 'Chocolate Chip Cookies - 150g',
    description: 'Rich, crumbly cookies packed with premium milk chocolate chips.',
    price: 80,
    discount: 15,
    category: 'Biscuits & Bakery',
    stock: 45,
    ratings: 4.5,
    numReviews: 20,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=60',
    isTrending: false,
    isPopular: true
  },

  // Tea & Coffee
  {
    name: 'Classic Assam Tea - 1kg',
    description: 'Strong, orthodox black tea leaves from Assam gardens, ideal for making aromatic milk chai.',
    price: 380,
    discount: 10,
    category: 'Tea & Coffee',
    stock: 35,
    ratings: 4.7,
    numReviews: 42,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Dry Fruits
  {
    name: 'Premium Almonds (Badam) - 500g',
    description: 'Handpicked California almonds, crunchy, healthy, and high in vitamin E.',
    price: 490,
    discount: 15,
    category: 'Dry Fruits',
    stock: 30,
    ratings: 4.8,
    numReviews: 33,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  },

  // Noodles & Pasta
  {
    name: 'Instant Masala Noodles - 8 Pack',
    description: 'Fast, easy-to-cook noodles with a spicy tastemaker. Family pack.',
    price: 120,
    discount: 5,
    category: 'Noodles & Pasta',
    stock: 5, // Test low stock
    ratings: 4.4,
    numReviews: 95,
    image: 'https://images.unsplash.com/photo-1612966608967-312ba599102e?w=500&auto=format&fit=crop&q=60',
    isTrending: true,
    isPopular: true
  }
];

const importData = async () => {
  try {
    // Clear DB collections
    await Category.deleteMany();
    await Product.deleteMany();

    // 1. Seed Categories
    const seededCategories = await Category.insertMany(categories);
    console.log(`${seededCategories.length} Categories seeded successfully!`);

    // 2. Seed Products
    const seededProducts = await Product.insertMany(products);
    console.log(`${seededProducts.length} Products seeded successfully!`);

    console.log('Seeding process complete.');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding database: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    console.log('Database collections wiped clean!');
    process.exit();
  } catch (error) {
    console.error(`Error wiping data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
