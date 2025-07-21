import express from 'express';
import { getOrders } from '../../controllers/OnlineEmployee/order.controller.js';

const router = express.Router();

// GET /api/employee/orders?page=1
router.get('/orders', getOrders);

export default router;