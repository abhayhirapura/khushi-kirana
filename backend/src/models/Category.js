import mongoose from 'mongoose';
import { VALID_CATEGORIES } from './Product.js';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: VALID_CATEGORIES
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
