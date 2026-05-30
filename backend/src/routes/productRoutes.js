import express from 'express';
import {
  getProducts,
  getProductById,
  getTrendingProducts,
  getPopularProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/trending', getTrendingProducts);
router.get('/popular', getPopularProducts);
router.get('/categories', getCategories);
router.get('/recommendations', getRecommendations);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
