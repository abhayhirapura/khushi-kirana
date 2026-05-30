import mongoose from 'mongoose';

export const VALID_CATEGORIES = [
  'Fruits & Vegetables',
  'Rice & Grains',
  'Atta & Flour',
  'Pulses & Dal',
  'Oil & Ghee',
  'Spices & Masala',
  'Snacks & Namkeen',
  'Biscuits & Bakery',
  'Tea & Coffee',
  'Dry Fruits',
  'Instant Food',
  'Noodles & Pasta',
  'Sauces & Pickles',
  'Personal Care',
  'Bath & Body',
  'Cleaning Essentials',
  'Household Items',
  'Baby Care',
  'Pet Food',
  'Frozen Food',
  'Stationery',
  'Kitchen Essentials'
];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // Percentage discount
  category: { 
    type: String, 
    required: true,
    enum: VALID_CATEGORIES
  },
  stock: { type: Number, required: true, default: 0, min: 0 },
  ratings: { type: Number, default: 4.5, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isTrending: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
export { productSchema };
