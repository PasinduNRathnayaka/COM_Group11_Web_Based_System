import Order from '../../models/OnlineEmployee/order.model.js';

// Get paginated orders (for the table with pagination)
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find().skip(skip).limit(limit).sort({ date: -1 });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};