const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
// Prevent server crash by providing a fallback API key for development
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : require('stripe')('sk_test_51PbcnQVL0d5mm3axVxQnMockTestKey123456789');

// @desc    Create payment intent for Stripe
// @route   POST /api/payments/create-payment-intent
// @access  Private/Customer
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to smallest currency unit (e.g., cents)
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Create a payment record
    const payment = new Payment({
      order: order._id,
      user: req.user._id,
      paymentMethod: 'stripe',
      amount: order.totalPrice,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    await payment.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

// @desc    Process payment status update
// @route   POST /api/payments/update-payment-status
// @access  Private/Customer
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment belongs to the user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    payment.status = status;
    payment.transactionId = req.body.transactionId || payment.transactionId;
    
    await payment.save();

    // Update order if payment is successful
    if (status === 'completed') {
      const order = await Order.findById(payment.order);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: payment._id,
          status: 'completed',
          update_time: Date.now(),
          email_address: req.user.email,
        };
        
        await order.save();
      }
    }

    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user has access to this payment
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { orderId, userId } = paymentIntent.metadata;

    // Update payment status
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (payment) {
      payment.status = 'completed';
      payment.transactionId = paymentIntent.id;
      payment.paymentDetails = paymentIntent;
      await payment.save();
    }

    // Update order
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: payment ? payment._id : paymentIntent.id,
        status: 'completed',
        update_time: Date.now(),
        email_address: paymentIntent.receipt_email,
      };
      await order.save();
    }
  } catch (error) {
    console.error('Payment success handler error:', error);
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (payment) {
      payment.status = 'failed';
      payment.paymentDetails = paymentIntent;
      await payment.save();
    }
  } catch (error) {
    console.error('Payment failure handler error:', error);
  }
}

// @desc    Get payment methods options
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        icon: 'fa-credit-card',
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay securely with your PayPal account',
        icon: 'fa-paypal',
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'fa-money-bill',
      },
    ];

    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 