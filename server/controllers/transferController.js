const Transaction = require('../models/Transaction');

exports.transferMoney = async (req, res, next) => {
  try {
    const { amount, receiver, transactionId } = req.body;

    // If any required fields are missing, return an error
    if (!amount || !receiver || !transactionId) {
      return res.status(400).json({
        message: "Missing fields: amount, receiver, and transactionId are required."
      });
    }

    // Find the transaction record by ID
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // If risk is too high, block the transaction
    if (transaction.riskScore >= 0.7) {
      transaction.status = "blocked";
      await transaction.save();
      return res.status(200).json({ message: "Transaction blocked due to high risk." });
    }

    // Otherwise, update the transaction with transfer details
    transaction.status = "approved";
    transaction.amount = amount;
    transaction.receiver = receiver;
    transaction.transferredAt = new Date();
    await transaction.save();

    res.status(200).json({
      message: `₹${amount} sent to ${receiver}`,
      transactionId
    });
  } catch (error) {
    next(error);
  }
};
