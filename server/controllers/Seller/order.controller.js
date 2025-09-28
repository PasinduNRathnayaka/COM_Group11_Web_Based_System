// controllers/Seller/order.controller.js
import UserOrder from '../../models/UserOrder.js';

// Get all orders with pagination
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get orders with user and product details
    const orders = await UserOrder.find()
      .populate('userId', 'name email avatar')
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalOrders = await UserOrder.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: `#${order._id.toString().slice(-5).toUpperCase()}`,
      date: order.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      customer: order.userId?.name || 'Unknown Customer',
      customerAvatar: order.userId?.avatar || '/default-avatar.png',
      customerEmail: order.userId?.email || '',
      status: order.status || 'pending',
      totalAmount: `Rs:${order.totalAmount.toFixed(2)}`,
      items: order.items.map(item => ({
        productName: item.productId?.name || 'Product Not Found',
        quantity: item.quantity,
        price: item.price,
        productImage: item.productId?.images?.[0] || '/default-product.png'
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get orders by date range
export const getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const orders = await UserOrder.find(dateFilter)
      .populate('userId', 'name email avatar')
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderId: `#${order._id.toString().slice(-5).toUpperCase()}`,
      date: order.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      customer: order.userId?.name || 'Unknown Customer',
      customerAvatar: order.userId?.avatar || '/default-avatar.png',
      status: order.status || 'pending',
      totalAmount: `Rs:${order.totalAmount.toFixed(2)}`,
      items: order.items
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching orders by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by date range',
      error: error.message
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await UserOrder.findById(id)
      .populate('userId', 'name email avatar phone')
      .populate('items.productId', 'productName brand images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const formattedOrder = {
      id: order._id,
      orderId: order.orderId,
      customerName: `${order.firstName} ${order.lastName}`,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      
      // Complete customer information
      firstName: order.firstName,
      lastName: order.lastName,
      companyName: order.companyName,
      country: order.country,
      streetAddress: order.streetAddress,
      city: order.city,
      zipCode: order.zipCode,
      phone: order.phone,
      email: order.email,
      
      // Payment and delivery info
      paymentMethod: order.paymentMethod,
      orderNotes: order.orderNotes,
      estimatedDelivery: order.estimatedDelivery,
      
      // Items with detailed product information
      items: order.items.map(item => ({
        productId: item.productId?._id,
        productName: item.productName || item.productId?.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.productId?.images?.[0],
        brand: item.productId?.brand,
        total: item.price * item.quantity
      })),

      // User information (if needed)
      user: order.userId ? {
        name: order.userId.name,
        email: order.userId.email,
        avatar: order.userId.avatar,
        phone: order.userId.phone
      } : null,
      
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.status(200).json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const order = await UserOrder.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};
