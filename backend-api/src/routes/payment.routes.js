const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const { Bill } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Razorpay order
router.post('/razorpay/create-order', async (req, res, next) => {
  try {
    const { billId } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const options = {
      amount: Math.round(bill.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: bill.invoiceNumber,
      notes: {
        billId: bill._id.toString(),
        flatId: bill.flat.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    bill.paymentDetails = { razorpayOrderId: order.id };
    await bill.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify Razorpay payment
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, billId } = req.body;

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    const bill = await Bill.findById(billId);
    bill.status = 'paid';
    bill.paidAmount = bill.totalAmount;
    bill.paidDate = new Date();
    bill.paymentMethod = 'razorpay';
    bill.transactionId = paymentId;
    bill.paymentDetails.razorpayPaymentId = paymentId;
    await bill.save();

    res.json({
      success: true,
      message: 'Payment successful.',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// Create Stripe payment intent
router.post('/stripe/create-intent', async (req, res, next) => {
  try {
    const { billId } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bill.totalAmount * 100), // Amount in cents
      currency: 'inr',
      metadata: {
        billId: bill._id.toString(),
        invoiceNumber: bill.invoiceNumber
      }
    });

    bill.paymentDetails = { stripePaymentIntentId: paymentIntent.id };
    await bill.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', async (req, res, next) => {
  try {
    const { paymentIntentId, billId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    const bill = await Bill.findById(billId);
    bill.status = 'paid';
    bill.paidAmount = bill.totalAmount;
    bill.paidDate = new Date();
    bill.paymentMethod = 'stripe';
    bill.transactionId = paymentIntentId;
    await bill.save();

    res.json({
      success: true,
      message: 'Payment successful.',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { status: 'paid' };
    
    // Residents see only their payments
    if (req.user.role === 'resident') {
      query.flat = req.user.flat;
    } else {
      query.society = req.user.society;
    }

    const payments = await Bill.find(query)
      .populate('flat', 'flatNumber block')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ paidDate: -1 });

    const total = await Bill.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
