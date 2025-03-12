const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  features: {
    type: [Number],
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: 'pending',
  },
  amount: {
    type: Number,
  },
  receiver: {
    type: String,
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
