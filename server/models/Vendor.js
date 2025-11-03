const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  contactInfo: {
    phone: String,
    alternatePhone: String,
    email: String,
    website: String
  },
  priceRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  services: [{
    name: String,
    description: String,
    price: Number
  }],
  images: [String],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  availability: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

vendorSchema.index({ category: 1 });
vendorSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
