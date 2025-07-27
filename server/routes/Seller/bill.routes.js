import express from 'express';
import Bill from '../../models/Bill.model.js';
import Product from '../../models/Seller/Product.model.js';

const router = express.Router();

// POST /api/bills - Create a new bill
router.post('/', async (req, res) => {
  try {
    const {
      billNumber,
      customerName,
      customerPhone,
      items, // Array of { productId, quantity, unitPrice }
      totalAmount,
      paymentStatus = 'paid',
      paidAmount,
      employeeId,
      notes
    } = req.body;

    // Validate required fields
    if (!billNumber || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ 
        error: 'Bill number, items, and total amount are required' 
      });
    }

    // Validate and process items
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const { productId, quantity, unitPrice } = item;

      if (!productId || !quantity || quantity <= 0 || !unitPrice || unitPrice < 0) {
        return res.status(400).json({ 
          error: 'Invalid item data. Each item must have productId, quantity > 0, and unitPrice >= 0' 
        });
      }

      // Find the product
      const product = await Product.findOne({ productId });
      if (!product) {
        return res.status(404).json({ 
          error: `Product with ID ${productId} not found` 
        });
      }

      // Check stock availability
      if (product.stock < quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.productName}. Available: ${product.stock}, Requested: ${quantity}` 
        });
      }

      const totalPrice = quantity * unitPrice;
      calculatedTotal += totalPrice;

      processedItems.push({
        productId,
        productName: product.productName,
        quantity,
        unitPrice,
        totalPrice,
        product: product._id
      });
    }

    // Verify total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ 
        error: 'Total amount mismatch. Calculated total does not match provided total' 
      });
    }

    // Create the bill
    const newBill = new Bill({
      billNumber,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      items: processedItems,
      totalAmount,
      itemCount: processedItems.length,
      paymentStatus,
      paidAmount: paidAmount || totalAmount,
      employeeId: employeeId || null,
      notes: notes || ''
    });

    // Save the bill
    const savedBill = await newBill.save();

    // Update product stock for each item
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    res.status(201).json({
      message: 'Bill created successfully',
      bill: savedBill
    });

  } catch (error) {
    console.error('❌ Error creating bill:', error);
    
    // Handle duplicate bill number
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Bill number already exists. Please use a unique bill number.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create bill', 
      details: error.message 
    });
  }
});

// GET /api/bills - Get all bills with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      customerName,
      billNumber,
      paymentStatus,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    
    if (billNumber) {
      filter.billNumber = { $regex: billNumber, $options: 'i' };
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.billDate = {};
      if (startDate) {
        filter.billDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.billDate.$lte = new Date(endDate);
      }
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get bills with pagination
    const bills = await Bill.find(filter)
      .populate('items.product', 'productName category brand image')
      .populate('employeeId', 'name email')
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalBills = await Bill.countDocuments(filter);
    const totalPages = Math.ceil(totalBills / limitNum);

    // Calculate summary statistics
    const stats = await Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
          averageBillAmount: { $avg: '$totalAmount' },
          totalItems: { $sum: '$itemCount' }
        }
      }
    ]);

    res.json({
      bills,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBills,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      stats: stats[0] || {
        totalRevenue: 0,
        totalBills: 0,
        averageBillAmount: 0,
        totalItems: 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching bills:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bills', 
      details: error.message 
    });
  }
});

// GET /api/bills/:id - Get specific bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('items.product', 'productName category brand image stock')
      .populate('employeeId', 'name email');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);

  } catch (error) {
    console.error('❌ Error fetching bill:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bill', 
      details: error.message 
    });
  }
});

// GET /api/bills/number/:billNumber - Get bill by bill number
router.get('/number/:billNumber', async (req, res) => {
  try {
    const bill = await Bill.findOne({ billNumber: req.params.billNumber })
      .populate('items.product', 'productName category brand image stock')
      .populate('employeeId', 'name email');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);

  } catch (error) {
    console.error('❌ Error fetching bill:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bill', 
      details: error.message 
    });
  }
});

// PUT /api/bills/:id - Update bill (limited fields)
router.put('/:id', async (req, res) => {
  try {
    const { customerName, customerPhone, paymentStatus, paidAmount, notes } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Only allow updating certain fields
    const updateFields = {};
    if (customerName !== undefined) updateFields.customerName = customerName;
    if (customerPhone !== undefined) updateFields.customerPhone = customerPhone;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) updateFields.paidAmount = paidAmount;
    if (notes !== undefined) updateFields.notes = notes;

    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('items.product', 'productName category brand image')
     .populate('employeeId', 'name email');

    res.json({
      message: 'Bill updated successfully',
      bill: updatedBill
    });

  } catch (error) {
    console.error('❌ Error updating bill:', error);
    res.status(500).json({ 
      error: 'Failed to update bill', 
      details: error.message 
    });
  }
});

// DELETE /api/bills/:id - Delete bill (also restore product stock)
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Restore product stock
    for (const item of bill.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Delete the bill
    await Bill.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Bill deleted successfully and product stock restored' 
    });

  } catch (error) {
    console.error('❌ Error deleting bill:', error);
    res.status(500).json({ 
      error: 'Failed to delete bill', 
      details: error.message 
    });
  }
});

// GET /api/bills/analytics/summary - Get billing analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const analytics = await Bill.aggregate([
      {
        $match: {
          billDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalBills: { $sum: 1 },
          averageBillAmount: { $avg: '$totalAmount' },
          totalItems: { $sum: '$itemCount' },
          maxBillAmount: { $max: '$totalAmount' },
          minBillAmount: { $min: '$totalAmount' }
        }
      }
    ]);

    // Daily revenue trend
    const dailyTrend = await Bill.aggregate([
      {
        $match: {
          billDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$billDate' }
          },
          revenue: { $sum: '$totalAmount' },
          billCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Top selling products
    const topProducts = await Bill.aggregate([
      {
        $match: {
          billDate: { $gte: startDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          avgPrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      period: `${periodDays} days`,
      summary: analytics[0] || {
        totalRevenue: 0,
        totalBills: 0,
        averageBillAmount: 0,
        totalItems: 0,
        maxBillAmount: 0,
        minBillAmount: 0
      },
      dailyTrend,
      topProducts
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics', 
      details: error.message 
    });
  }
});

export default router;