import express from 'express';
import UserOrder from '../models/UserOrder.model.js'; // ✅ Fixed import name
import Product from '../models/Seller/Product.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// POST /api/user-orders - Create new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      firstName,
      lastName,
      companyName,
      country,
      streetAddress,
      city,
      zipCode,
      phone,
      email,
      paymentMethod,
      orderNotes
    } = req.body;

    // ✅ Add validation for required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items provided in the order' 
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid total amount' 
      });
    }

    // Check stock and reduce it
    const orderItems = [];
    for (const item of items) {
      // ✅ Check if item has required fields
      if (!item.id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID is required for all items' 
        });
      }

      const product = await Product.findById(item.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.name || 'Unknown'} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.productName}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      });
    }

    const orderId = generateOrderId();
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const newOrder = new UserOrder({
      userId: req.user.id,
      orderId,
      items: orderItems,
      totalAmount,
      firstName,
      lastName,
      companyName,
      country,
      streetAddress,
      city,
      zipCode,
      phone,
      email,
      paymentMethod,
      orderNotes,
      estimatedDelivery
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: newOrder.orderId,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        estimatedDelivery: newOrder.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    // ✅ More detailed error logging
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/user-orders/user - Get user's orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await UserOrder.find({ userId: req.user.id })
      .populate('items.productId', 'productName brand')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      orderDate: order.orderDate,
      estimatedDelivery: order.estimatedDelivery,
      shippingAddress: {
        firstName: order.firstName,
        lastName: order.lastName,
        streetAddress: order.streetAddress,
        city: order.city,
        zipCode: order.zipCode,
        country: order.country
      }
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

export default router;