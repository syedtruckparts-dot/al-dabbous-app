import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA8Pg_6hlZ2dlPUWErDRLx0GkWWJ-m219E",
  authDomain: "al-dabbous-system.firebaseapp.com",
  projectId: "al-dabbous-system",
  storageBucket: "al-dabbous-system.firebasestorage.app",
  messagingSenderId: "187643398356",
  appId: "1:187643398356:web:0e61fff5d10c4349df9341"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

// 🔹 Applications
const APPLICATIONS = {
  "Vacuum Tank": { baseCost: 3200 },
  "Dump Body": { baseCost: 2100 },
  "Crane Body": { baseCost: 1500 }
};

export default function App() {
  const [rfq, setRfq] = useState({
    customer: "",
    application: "Vacuum Tank"
  });

  const baseCost = APPLICATIONS[rfq.application].baseCost;

  // ✅ WORKING SAVE FUNCTION
  async function saveDeal() {
    alert("Button clicked");

    try {
      const quoteData = {
        ...rfq,
        baseCost,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "quotes"), quoteData);

      alert("✅ Quote saved successfully!");

    } catch (error) {
      console.error(error);
      alert("❌ Error: " + error.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Al Dabbous System</h1>

      <h2>Customer</h2>
      <input
        placeholder="Customer name"
        value={rfq.customer}
        onChange={(e) => setRfq({ ...rfq, customer: e.target.value })}
      />

      <h2>Application</h2>
      <select
        value={rfq.application}
        onChange={(e) => setRfq({ ...rfq, application: e.target.value })}
      >
        {Object.keys(APPLICATIONS).map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>

      <h3>Cost: {baseCost}</h3>

      <button onClick={saveDeal}>
        Save Deal
      </button>
    </div>
  );
}

// 🔹 Render
createRoot(document.getElementById("root")).render(<App />);
