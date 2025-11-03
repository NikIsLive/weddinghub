const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payments/create-order
router.post(
  '/create-order',
  auth,
  [
    body('bookingId').notEmpty().withMessage('bookingId is required'),
    body('amount').isInt({ gt: 0 }).withMessage('amount (paise) is required and > 0'),
    body('currency').optional().isIn(['INR']).withMessage('Only INR supported'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, amount, currency = 'INR' } = req.body;

      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      // Ensure the current user owns the booking
      if (
        booking.userId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount, // in paise
        currency,
        receipt: `booking_${bookingId}`,
      });

      res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Failed to create payment order' });
    }
  }
);

// POST /api/payments/verify
router.post(
  '/verify',
  auth,
  [
    body('bookingId').notEmpty(),
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;
      if (!isAuthentic) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      // Update booking as paid and confirmed
      booking.paymentStatus = 'Paid';
      booking.status = 'Confirmed';
      booking.updatedAt = Date.now();
      await booking.save();

      res.json({ message: 'Payment verified and booking confirmed' });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ message: 'Failed to verify payment' });
    }
  }
);

module.exports = router;
