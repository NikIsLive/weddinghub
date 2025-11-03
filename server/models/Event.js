const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['Wedding', 'Social Gathering'],
    required: true
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    type: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Both']
    }
  },
  guestCount: {
    type: Number,
    required: true
  },
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  // Wedding specific fields
  weddingDetails: {
    brideName: String,
    groomName: String,
    ceremonies: [{
      name: String,
      date: Date,
      time: String,
      venue: String
    }]
  },
  // Social gathering specific fields
  socialGatheringDetails: {
    occasionType: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Corporate Event', 'Festival Celebration', 'Other']
    },
    hostName: String,
    theme: String
  },
  status: {
    type: String,
    enum: ['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ userId: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
