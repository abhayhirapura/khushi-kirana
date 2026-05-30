import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrderTracking,
  getOrders,
  updateOrderStatus,
  getAvailableOrders,
  getAssignedOrders,
  assignOrder,
  updateDeliveryStatus,
  getDeliveryEarnings
} from '../controllers/orderController.js';
import { protect, admin, delivery } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(admin, getOrders);

// Delivery partner actions
router.get('/delivery/available', delivery, getAvailableOrders);
router.get('/delivery/assigned', delivery, getAssignedOrders);
router.get('/delivery/earnings', delivery, getDeliveryEarnings);
router.put('/:id/assign', delivery, assignOrder);
router.put('/:id/delivery-status', delivery, updateDeliveryStatus);

router.get('/myorders', getMyOrders);
router.get('/:id/tracking', getOrderTracking);

router.get('/:id', getOrderById);
router.put('/:id/status', admin, updateOrderStatus);

export default router;
