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

export default router;