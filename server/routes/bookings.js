const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, eventId } = req.query;
    const query = {};

    // If user is vendor, show their bookings, else show customer bookings
    if (req.user.isVendor) {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (vendor) {
        query.vendorId = vendor._id;
      } else {
        return res.json([]);
      }
    } else {
      query.userId = req.user._id;
    }

    if (status) query.status = status;
    if (eventId) query.eventId = eventId;

    const bookings = await Booking.find(query)
      .populate('eventId', 'eventName eventType startDate endDate')
      .populate('vendorId', 'businessName category')
      .populate('userId', 'name email phone')
      .sort({ eventDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('eventId')
      .populate('vendorId')
      .populate('userId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.isVendor) {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (vendor && booking.vendorId._id.toString() !== vendor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      if (booking.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify event belongs to user
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to book for this event' });
    }

    // Verify vendor exists
    const vendor = await Vendor.findById(req.body.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const bookingData = {
      ...req.body,
      userId: req.user._id,
      bookingDate: new Date()
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Add booking to event
    event.bookings.push(booking._id);
    await event.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.isVendor) {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || booking.vendorId.toString() !== vendor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    Object.assign(booking, req.body);
    booking.updatedAt = Date.now();
    await booking.save();

    // Update vendor rating if rating is provided
    if (req.body.rating && req.body.rating !== booking.rating) {
      await updateVendorRating(booking.vendorId);
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove booking from event
    await Event.findByIdAndUpdate(booking.eventId, {
      $pull: { bookings: booking._id }
    });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update vendor rating
async function updateVendorRating(vendorId) {
  const bookings = await Booking.find({
    vendorId,
    rating: { $exists: true, $ne: null }
  });

  if (bookings.length > 0) {
    const totalRating = bookings.reduce((sum, b) => sum + b.rating, 0);
    const averageRating = totalRating / bookings.length;

    await Vendor.findByIdAndUpdate(vendorId, {
      'ratings.average': averageRating,
      'ratings.count': bookings.length
    });
  }
}

module.exports = router;
