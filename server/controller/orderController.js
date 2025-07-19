const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Artisan = require('../models/artisanModel');
const Payment = require('../models/paymentModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify product availability and get artisan info
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      if (product.countInStock < item.qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      
      // Add artisan info to each order item
      item.artisan = product.artisan;
      
      // Update product stock
      product.countInStock -= item.qty;
      await product.save();
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Update artisan customer counts
    const artisanIds = [...new Set(orderItems.map(item => item.artisan.toString()))];
    
    for (const artisanId of artisanIds) {
      await Artisan.findByIdAndUpdate(artisanId, { $inc: { customers: 1 } });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name image',
      })
      .populate({
        path: 'orderItems.artisan',
        select: 'name image',
      });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (
      req.userType === 'user' &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // If artisan, check if they have products in this order
    if (req.userType === 'artisan') {
      const hasArtisanProducts = order.orderItems.some(
        (item) => item.artisan._id.toString() === req.user._id.toString()
      );

      if (!hasArtisanProducts) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Customer
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the customer who placed the order can mark it as paid
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check payment information
    const { paymentId } = req.body;
    let payment;

    if (paymentId) {
      payment = await Payment.findById(paymentId);
      
      if (!payment || payment.order.toString() !== order._id.toString()) {
        return res.status(400).json({ message: 'Invalid payment information' });
      }
      
      if (payment.status !== 'completed') {
        return res.status(400).json({ message: 'Payment not completed' });
      }
    } else {
      // For manual payment updates (e.g., cash on delivery)
      payment = new Payment({
        order: order._id,
        user: req.user._id,
        paymentMethod: req.body.paymentMethod || 'cod',
        amount: order.totalPrice,
        status: 'completed',
        transactionId: req.body.transactionId || `manual-${Date.now()}`,
      });
      
      await payment.save();
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: payment._id,
      status: payment.status,
      update_time: payment.updatedAt,
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Artisan/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courierService } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if artisan has products in this order
    if (req.userType === 'artisan') {
      const hasArtisanProducts = order.orderItems.some(
        (item) => item.artisan.toString() === req.user._id.toString()
      );

      if (!hasArtisanProducts) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    order.status = status || order.status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (courierService) {
      order.courierService = courierService;
    }

    // If status is delivered, update delivery info
    if (status === 'Delivered' && !order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private/Customer
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get artisan orders
// @route   GET /api/orders/artisan
// @access  Private/Artisan
exports.getArtisanOrders = async (req, res) => {
  try {
    // Find orders containing products from this artisan
    const orders = await Order.find({
      'orderItems.artisan': req.user._id,
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Filter order items to only include this artisan's products
    const filteredOrders = orders.map(order => {
      const artisanItems = order.orderItems.filter(
        item => item.artisan.toString() === req.user._id.toString()
      );
      
      // Calculate artisan's portion of the order
      const itemsPrice = artisanItems.reduce(
        (acc, item) => acc + item.price * item.qty, 0
      );
      
      return {
        _id: order._id,
        user: order.user,
        orderItems: artisanItems,
        shippingAddress: order.shippingAddress,
        itemsPrice,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        status: order.status,
        trackingNumber: order.trackingNumber,
        courierService: order.courierService,
        createdAt: order.createdAt,
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Order.countDocuments({});
    
    const orders = await Order.find({})
      .populate('user', 'id name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 