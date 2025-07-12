import express from 'express';
import { createProduct, getProducts } from '../../controllers/Seller/product.controller.js';

const router = express.Router();

router.post('/add', createProduct);
router.get('/list', getProducts);

export default router;
