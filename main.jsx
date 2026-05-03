import React, { useMemo, useState } from "react";

const APPLICATIONS = {
  "Vacuum Tank": {
    baseCost: 3200,
    material: "ASTM A283 Grade C",
    requiresPump: true,
    requiresCrane: false,
  },
  "Dump Body": {
    baseCost: 2100,
    material: "High tensile steel",
    requiresPump: false,
    requiresCrane: false,
  },
  "Crane Body": {
    baseCost: 1450,
    material: "Heavy duty sub-frame",
    requiresPump: false,
    requiresCrane: true,
  }
};

const TECH_LIBRARY = {
  "Vacuum Tank": {
    title: "Vacuum Tanker Specification",
    code: "DS-VT-001",
    sections: [
      ["Tank Material", "ASTM A283 Grade C"],
      ["Pump System", "PTO driven vacuum pump"],
      ["Safety", "Relief valves, shutoff system"]
    ],
    drawings: ["Side View", "Rear View", "Pump Layout"]
  },
  "Dump Body": {
    title: "Dump Body Specification",
    code: "DS-DB-001",
    sections: [
      ["Body", "Heavy duty steel"],
      ["Hydraulics", "Tipping cylinder"],
      ["Safety", "Body lock system"]
    ],
    drawings: ["Side View", "Tipping View"]
  },
  "Crane Body": {
    title: "Crane Body Specification",
    code: "DS-CR-001",
    sections: [
      ["Sub-frame", "Reinforced"],
      ["Crane Mount", "Hydraulic system"],
      ["Stability", "Outriggers"]
    ],
    drawings: ["Crane Layout", "Mounting"]
  }
};

const PUMPS = {
  "Not Required": 0,
  "MORO M9": 1450
};

const CRANES = {
  "Not Required": 0,
  "5 Ton Crane": 3800
};

export default function App() {
  const [rfq, setRfq] = useState({
    application: "Vacuum Tank",
    pump: "MORO M9",
    crane: "Not Required",
    margin: 18,
  });

  const app = APPLICATIONS[rfq.application];
  const tech = TECH_LIBRARY[rfq.application];

  const totalCost = app.baseCost + PUMPS[rfq.pump] + CRANES[rfq.crane];
  const selling = totalCost / (1 - rfq.margin / 100);

  return (
    <div style={{ padding: 20 }}>
      <h1>Al Dabbous Quotation System</h1>

      <h2>RFQ</h2>
      <select onChange={(e) => setRfq({...rfq, application: e.target.value})}>
        {Object.keys(APPLICATIONS).map(a => <option key={a}>{a}</option>)}
      </select>

      {app.requiresPump && (
        <select onChange={(e) => setRfq({...rfq, pump: e.target.value})}>
          {Object.keys(PUMPS).map(p => <option key={p}>{p}</option>)}
        </select>
      )}

      {app.requiresCrane && (
        <select onChange={(e) => setRfq({...rfq, crane: e.target.value})}>
          {Object.keys(CRANES).map(c => <option key={c}>{c}</option>)}
        </select>
      )}

      <h2>Cost</h2>
      <p>Total Cost: {totalCost}</p>
      <p>Selling Price: {selling.toFixed(2)}</p>

      <h2>Technical Spec</h2>
      <p>{tech.title}</p>
      {tech.sections.map(([k,v]) => (
        <div key={k}>{k}: {v}</div>
      ))}

      <h2>Drawings</h2>
      {tech.drawings.map(d => (
        <div key={d} style={{border:"1px dashed gray", padding:10, margin:5}}>
          {d} (placeholder)
        </div>
      ))}
    </div>
  );
}
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(<App />);
