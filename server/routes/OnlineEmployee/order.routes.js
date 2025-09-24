import express from 'express';
import { 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  getOrderStats 
} from '../../controllers/OnlineEmployee/order.controller.js';

const router = express.Router();

// GET /api/orders?page=1 - Get paginated orders for OrderList.jsx
router.get('/orders', getOrders);

// GET /api/orders/:orderId - Get single order details
router.get('/orders/:orderId', getOrderById);

// PUT /api/orders/:orderId/status - Update order status
router.put('/orders/:orderId/status', updateOrderStatus);

// GET /api/orders/stats - Get order statistics
router.get('/stats', getOrderStats);

export default router;