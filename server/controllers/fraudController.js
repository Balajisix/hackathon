const Transaction = require('../models/Transaction');

exports.predictFraud = async (req, res, next) => {
  try {
    const { receiver, amount, features } = req.body;
    if (!receiver || !amount) {
      return res.status(400).json({ error: "Missing receiver or amount" });
    }

    // Example: Count recent transactions for this receiver in the last hour.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Transaction.countDocuments({
      receiver,
      createdAt: { $gte: oneHourAgo },
    });

    // Start with a random base risk score
    let riskScore = Math.random();
    riskScore += recentCount * 0.05;
    if (amount > 1000) riskScore += 0.2;
    if (riskScore > 1) riskScore = 1;

    // Determine risk category
    let riskCategory = 'low';
    if (riskScore < 0.4) {
      riskCategory = 'low';
    } else if (riskScore < 0.7) {
      riskCategory = 'medium';
    } else {
      riskCategory = 'high';
    }

    // Create a new transaction record (email not provided at this step)
    const newTransaction = new Transaction({
      receiver,
      amount,
      features: features || [],
      riskScore,
      riskCategory,
      status: "pending",
    });

    await newTransaction.save();

    res.json({
      risk_score: riskScore,
      riskCategory,
      transactionId: newTransaction._id,
    });
  } catch (error) {
    next(error);
  }
};
