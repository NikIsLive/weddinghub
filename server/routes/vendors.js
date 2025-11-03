const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all vendors with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, search, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minPrice) query['priceRange.min'] = { $gte: Number(minPrice) };
    if (maxPrice) query['priceRange.max'] = { $lte: Number(maxPrice) };
    
    if (search) {
      query.$or = [
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const vendors = await Vendor.find(query)
      .populate('userId', 'name email phone')
      .sort({ 'ratings.average': -1, createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/vendors/categories
// @desc    Get all vendor categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [
    'Tent House',
    'DJ',
    'Catering',
    'Confectioner',
    'Photography',
    'Videography',
    'Decoration',
    'Mehendi Artist',
    'Makeup Artist',
    'Bridal Wear',
    'Groom Wear',
    'Jewelry',
    'Florist',
    'Transportation',
    'Wedding Planner',
    'Sound System',
    'Generator',
    'Lighting',
    'Furniture',
    'Other'
  ];
  res.json(categories);
});

// @route   GET /api/vendors/:id
// @desc    Get vendor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/vendors
// @desc    Create vendor profile
// @access  Private
router.post('/', auth, [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('address.city').trim().notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ userId: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ message: 'User already has a vendor profile' });
    }

    const vendorData = {
      ...req.body,
      userId: req.user._id
    };

    const vendor = new Vendor(vendorData);
    await vendor.save();

    // Update user to mark as vendor
    await User.findByIdAndUpdate(req.user._id, {
      isVendor: true,
      vendorProfile: vendor._id,
      role: 'vendor'
    });

    res.status(201).json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/vendors/:id
// @desc    Update vendor profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if user owns this vendor profile or is admin
    if (vendor.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(vendor, req.body);
    vendor.updatedAt = Date.now();
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/vendors/:id
// @desc    Delete vendor profile
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if user owns this vendor profile or is admin
    if (vendor.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(vendor.userId, {
      isVendor: false,
      vendorProfile: null
    });

    res.json({ message: 'Vendor profile deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
