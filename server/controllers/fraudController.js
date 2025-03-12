const Transaction = require('../models/Transaction');

exports.predictFraud = async (req, res, next) => {
  try {
    const { features } = req.body;
    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Invalid input. "features" must be an array.' });
    }

    // Simulate risk score using a random number between 0 and 1
    const riskScore = Math.random();

    // Create a new transaction record with the simulated risk score
    const newTransaction = new Transaction({
      features,
      riskScore,
      status: "pending",
      createdAt: new Date(),
    });

    await newTransaction.save();

    // Return both the risk_score and the transaction ID
    res.json({
      risk_score: riskScore,
      transactionId: newTransaction._id
    });
  } catch (error) {
    next(error);
  }
};
