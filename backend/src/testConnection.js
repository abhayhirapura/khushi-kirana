import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const runTest = async () => {
  const uri = process.env.MONGODB_URI;
  console.log(`Using MONGODB_URI: ${uri}`);
  
  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI is not defined in your backend/.env file!');
    process.exit(1);
  }

  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('⚠️  WARNING: You are currently pointing to a LOCAL MongoDB instance.');
    console.log('To test MongoDB Atlas, please update the MONGODB_URI in backend/.env to your Atlas connection string.');
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB!');

    // 1. Create a test user in User Collection
    console.log('\n--- Testing User Collection ---');
    const testEmail = `atlas_test_${Math.floor(Math.random() * 10000)}@khushikirana.com`;
    console.log(`Creating test user with email: ${testEmail}`);
    
    const user = new User({
      name: 'Atlas Test Shopper',
      email: testEmail,
      password: 'securepassword123',
      role: 'user',
      addresses: [{
        street: '456 Kirana Bazar',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        label: 'Home',
        isDefault: true
      }]
    });

    const savedUser = await user.save();
    console.log(`Saved User Document ID: ${savedUser._id}`);
    console.log(`Saved User Name: ${savedUser.name}`);

    // 2. Create a test product in Product Collection
    console.log('\n--- Testing Product Collection ---');
    console.log('Creating test product...');
    const product = new Product({
      name: 'Premium Golden Sella Basmati Rice',
      description: 'Handpicked long-grain aromatic basmati rice, aged for 2 years. Perfect for Biryani and Special Occasions.',
      price: 180,
      discount: 10,
      category: 'Rice & Grains',
      stock: 120,
      ratings: 4.9,
      numReviews: 18,
      isTrending: true,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60'
    });

    const savedProduct = await product.save();
    console.log(`Saved Product Document ID: ${savedProduct._id}`);
    console.log(`Saved Product Name: ${savedProduct.name}`);

    // 3. Query the collection to verify insertion
    console.log('\n--- Querying Created Documents from Database ---');
    const foundUser = await User.findById(savedUser._id);
    console.log(`Fetched User: ${foundUser.name} (${foundUser.email})`);
    
    const foundProduct = await Product.findById(savedProduct._id);
    console.log(`Fetched Product: ${foundProduct.name} | Price: ₹${foundProduct.price} | Stock: ${foundProduct.stock} units`);

    console.log('\n=========================================');
    console.log(' 🎉 SUCCESS: MongoDB Atlas Test Completed!');
    console.log(' Log in to your MongoDB Atlas Dashboard to');
    console.log(' see your "users" and "products" collections.');
    console.log('=========================================');

  } catch (error) {
    console.error(`\n❌ ERROR: Database testing failed: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit();
  }
};

runTest();
