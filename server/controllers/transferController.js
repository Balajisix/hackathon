const Transaction = require('../models/Transaction');

exports.transferMoney = async (req, res, next) => {
  try {
    const { amount, receiver, transactionId, userAction, otp } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ message: "Missing transactionId." });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Block high-risk transactions immediately
    if (transaction.riskCategory === 'high') {
      transaction.status = "blocked";
      await transaction.save();
      return res.status(200).json({ message: "Transaction blocked due to high risk." });
    }

    // For medium risk, verify OTP
    if (transaction.riskCategory === 'medium') {
      if (userAction !== 'otp_verified' || !otp) {
        return res.status(400).json({
          message: "Medium risk requires OTP verification. Provide userAction=otp_verified and the OTP."
        });
      }
      if (otp !== transaction.otp) {
        return res.status(400).json({ message: "Invalid OTP provided." });
      }
    }

    // For low risk, verify PIN (simulated)
    if (transaction.riskCategory === 'low') {
      if (userAction !== 'pin_entered') {
        return res.status(400).json({
          message: "Low risk requires PIN verification. Provide userAction=pin_entered."
        });
      }
    }

    // Approve the transaction
    transaction.status = "approved";
    transaction.amount = amount;
    transaction.receiver = receiver;
    transaction.transferredAt = new Date();
    await transaction.save();

    res.status(200).json({
      message: `₹${amount} sent to ${receiver}`,
      transactionId,
    });
  } catch (error) {
    next(error);
  }
};
