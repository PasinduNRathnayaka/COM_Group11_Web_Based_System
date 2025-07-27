import express from 'express';
import { getOrderDetailsById} from '../../controllers/OnlineEmployee/orderDetails.controller.js';

const router = express.Router();

router.get('/:id',getOrderDetailsById);

export default router;

