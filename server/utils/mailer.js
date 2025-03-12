const nodemailer = require('nodemailer');

async function createTestAccountAndTransport() {
  // Create a test account (Ethereal)
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'brainbric@gmail.com',
      pass: 'vhoa kfcc xmsp asmx'
    }
  });
  return transporter;
}

async function sendOTPEmail(receiverEmail, otp) {
  const transporter = await createTestAccountAndTransport();
  const mailOptions = {
    from: '"Fraud Detection" <no-reply@example.com>',
    to: receiverEmail,
    subject: "Your OTP for Transaction Verification",
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`
  };

  let info = await transporter.sendMail(mailOptions);
  console.log("OTP Email sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = { sendOTPEmail };
