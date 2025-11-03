const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/events
// @desc    Get all events for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { eventType, status } = req.query;
    const query = { userId: req.user._id };

    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('bookings')
      .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('bookings')
      .populate('userId', 'name email phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, [
  body('eventType').isIn(['Wedding', 'Social Gathering']).withMessage('Event type must be Wedding or Social Gathering'),
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      userId: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(event, req.body);
    event.updatedAt = Date.now();
    await event.save();

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user owns this event
    if (event.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
