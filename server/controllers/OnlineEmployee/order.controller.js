import UserOrder from '../../models/UserOrder.model.js';

// Get paginated orders (for the table with pagination)
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await UserOrder.countDocuments();
    const userOrders = await UserOrder.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'productName brand')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Transform UserOrder data to match the expected format for OrderList.jsx
    const orders = userOrders.map(userOrder => ({
      _id: userOrder._id,
      product: userOrder.items.map(item => item.productName).join(', '), // Combine all product names
      orderId: userOrder.orderId,
      date: userOrder.orderDate,
      customerName: `${userOrder.firstName} ${userOrder.lastName}`,
      status: userOrder.status,
      amount: userOrder.totalAmount
    }));

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const userOrder = await UserOrder.findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId }
      ]
    })
    .populate('userId', 'name email')
    .populate('items.productId', 'productName brand');

    if (!userOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Transform to expected format
    const order = {
      _id: userOrder._id,
      orderId: userOrder.orderId,
      items: userOrder.items,
      totalAmount: userOrder.totalAmount,
      status: userOrder.status,
      paymentMethod: userOrder.paymentMethod,
      orderDate: userOrder.orderDate,
      estimatedDelivery: userOrder.estimatedDelivery,
      customer: {
        name: `${userOrder.firstName} ${userOrder.lastName}`,
        email: userOrder.email,
        phone: userOrder.phone
      },
      shippingAddress: {
        firstName: userOrder.firstName,
        lastName: userOrder.lastName,
        companyName: userOrder.companyName,
        streetAddress: userOrder.streetAddress,
        city: userOrder.city,
        zipCode: userOrder.zipCode,
        country: userOrder.country
      },
      orderNotes: userOrder.orderNotes
    };

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error('❌ Error fetching order details:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: 'Failed to fetch order details'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    const updatedOrder = await UserOrder.findOneAndUpdate(
      {
        $or: [
          { _id: orderId },
          { orderId: orderId }
        ]
      },
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
      message: 'Order status updated successfully',
      order: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Get order statistics for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await UserOrder.countDocuments();
    const pendingOrders = await UserOrder.countDocuments({ status: 'pending' });
    const deliveredOrders = await UserOrder.countDocuments({ status: 'delivered' });
    const cancelledOrders = await UserOrder.countDocuments({ status: 'cancelled' });

    // Calculate total revenue
    const revenueResult = await UserOrder.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('❌ Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};