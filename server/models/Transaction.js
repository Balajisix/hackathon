const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  receiver: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  features: {
    type: [Number],
    default: [],
  },
  riskScore: {
    type: Number,
    required: true,
  },
  riskCategory: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  // OTP field for medium risk transactions
  otp: {
    type: String,
    default: null,
  },
  // Email field to store the receiver's email (only needed for medium risk)
  email: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked', 'awaiting_verification'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transferredAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
