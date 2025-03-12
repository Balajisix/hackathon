const Transaction = require('../models/Transaction');
const { sendOTPEmail } = require('../utils/mailer');

exports.sendOTP = async (req, res, next) => {
  try {
    const { transactionId, email } = req.body;
    if (!transactionId || !email) {
      return res.status(400).json({ message: "Missing transactionId or email" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Only for medium risk
    if (transaction.riskCategory !== 'medium') {
      return res.status(400).json({ message: "OTP only for medium risk transactions." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    transaction.otp = otp;
    transaction.email = email; // store the user’s email
    await transaction.save();

    // Send email via Gmail
    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to the provided email." });
  } catch (error) {
    console.error("Send OTP Error:", error); // Log the full error
    next(error);
  }
};
