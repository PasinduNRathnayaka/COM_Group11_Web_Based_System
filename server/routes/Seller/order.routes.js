// routes/Seller/order.routes.js
import express from 'express';
import UserOrder from '../../models/UserOrder.model.js';

const router = express.Router();

// GET /api/seller/orders - Get all orders from database
router.get('/', async (req, res) => {
  try {
    const orders = await UserOrder.find()
      .sort({ createdAt: -1 }) // Latest orders first
      .populate('items.productId', 'productName');

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      customerName: `${order.firstName} ${order.lastName}`,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      items: order.items
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// PUT /api/seller/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await UserOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
});

// GET /api/seller/orders/:id - Get single order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await UserOrder.findById(id)
      .populate('items.productId', 'productName brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format the order for the frontend
    const formattedOrder = {
      id: order._id,
      orderId: order.orderId,
      customerName: `${order.firstName} ${order.lastName}`,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      
      // Customer details
      firstName: order.firstName,
      lastName: order.lastName,
      companyName: order.companyName,
      country: order.country,
      streetAddress: order.streetAddress,
      city: order.city,
      zipCode: order.zipCode,
      phone: order.phone,
      email: order.email,
      
      // Order details
      paymentMethod: order.paymentMethod,
      orderNotes: order.orderNotes,
      estimatedDelivery: order.estimatedDelivery,
      
      // Items with populated product details
      items: order.items.map(item => ({
        productId: item.productId?._id,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        total: item.price * item.quantity
      })),
      
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

export default router;