// controllers/orderDetails.controller.js

import OrderDetails from '../../models/OnlineEmployee/OrderDetails.model.js';

// @desc    Get order details by orderId
// @route   GET /api/orderdetails/:id
// @access  Public
export const getOrderDetailsById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await OrderDetails.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

