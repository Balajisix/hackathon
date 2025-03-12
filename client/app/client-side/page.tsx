"use client";

import { useState } from "react";

export default function Home() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskCategory, setRiskCategory] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // For verification inputs
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  // Email input is shown only if risk is medium
  const [email, setEmail] = useState("");

  const handleRiskAnalysis = async () => {
    setLoading(true);
    setMessage("Analyzing transaction risk...");
    setRiskScore(null);
    setRiskCategory(null);
    setTransactionId(null);

    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver,
          amount: Number(amount),
          features: [Number(amount)]
        }),
      });
      const data = await res.json();
      console.log("Predict API:", data);

      setRiskScore(data.risk_score);
      setRiskCategory(data.riskCategory);
      setTransactionId(data.transactionId);

      if (data.riskCategory === "high") {
        setMessage("Transaction blocked due to high risk.");
      } else if (data.riskCategory === "medium") {
        setMessage("Medium risk: Please enter your email and then click 'Send OTP'.");
      } else {
        setMessage("Low risk: Please enter your PIN.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error during risk analysis.");
    }
    setLoading(false);
  };

  const handleSendOTP = async () => {
    if (!transactionId) {
      setMessage("No transactionId available. Please analyze risk first.");
      return;
    }
    if (!email) {
      setMessage("Email is required for medium-risk transactions.");
      return;
    }
    setLoading(true);
    setMessage("Sending OTP...");

    try {
      const res = await fetch("http://localhost:5000/api/sendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, email }),
      });
      const data = await res.json();
      console.log("Send OTP API:", data);
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error sending OTP.");
    }
    setLoading(false);
  };

  const handleFinalizeTransaction = async () => {
    if (!transactionId) {
      setMessage("No transactionId available. Please analyze risk first.");
      return;
    }
    setLoading(true);
    setMessage("Finalizing transaction...");

    let userAction = "";
    if (riskCategory === "low") {
      if (!pin) {
        setLoading(false);
        setMessage("PIN is required for low-risk transactions.");
        return;
      }
      userAction = "pin_entered";
    } else if (riskCategory === "medium") {
      if (!otp) {
        setLoading(false);
        setMessage("OTP is required for medium-risk transactions.");
        return;
      }
      userAction = "otp_verified";
    } else {
      setLoading(false);
      setMessage("Cannot finalize a high-risk transaction.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          receiver,
          transactionId,
          userAction,
          otp, // For medium risk; ignored for low risk.
        }),
      });
      const data = await res.json();
      console.log("Transfer API:", data);
      setMessage(data.message || "Transfer completed.");
    } catch (err) {
      console.error(err);
      setMessage("Error finalizing transaction.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Money Transfer</h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">UPI ID</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Enter UPI ID"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={handleRiskAnalysis}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition mb-4"
        >
          {loading ? "..." : "Analyze Risk"}
        </button>

        {riskCategory === "medium" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Receiver Email (for OTP)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter receiver email"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="mt-2 w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition"
            >
              {loading ? "..." : "Send OTP"}
            </button>
          </div>
        )}

        {riskCategory === "low" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Enter PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="****"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}
        {riskCategory === "medium" && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        <button
          onClick={handleFinalizeTransaction}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition mb-4"
        >
          {loading ? "..." : "Finalize"}
        </button>

        {message && <p className="mt-4 text-center text-lg">{message}</p>}
        <p className="mt-2 text-center text-sm text-gray-500">
          Risk Score: {typeof riskScore === "number" ? riskScore.toFixed(2) : "N/A"}
        </p>
        <p className="text-center text-sm text-gray-500">
          Risk Category: {riskCategory || "N/A"}
        </p>
      </div>
    </div>
  );
}
