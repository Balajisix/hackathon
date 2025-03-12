"use client";

import { useState } from "react";

export default function Home() {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setMessage("Analyzing transaction risk...");
    setRiskScore(null);

    try {
      // 1) Call the Express risk analysis endpoint
      const predictRes = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: [Number(amount)] }),
      });
      const predictData = await predictRes.json();
      console.log("Predict API response:", predictData);

      // Extract the risk score and transactionId
      setRiskScore(predictData.risk_score);
      const transactionId = predictData.transactionId;

      // 2) If the risk is acceptable, call the transfer endpoint
      if (predictData.risk_score < 0.7) {
        const transferRes = await fetch("http://localhost:5000/api/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, receiver, transactionId }),
        });
        const transferData = await transferRes.json();
        setMessage(transferData.message);
      } else {
        setMessage("Transaction blocked due to high risk.");
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      setMessage("Error processing transaction. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Money Transfer</h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Receiver</label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="Enter receiver ID"
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
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Send Payment"}
        </button>

        {message && <p className="mt-4 text-center text-lg">{message}</p>}
        <p className="mt-2 text-center text-sm text-gray-500">
          Risk Score:{" "}
          {typeof riskScore === "number" ? riskScore.toFixed(2) : "N/A"}
        </p>
      </div>
    </div>
  );
}
