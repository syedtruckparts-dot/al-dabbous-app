import React, { useMemo, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const STORAGE_KEY = "al_dabbous_quotes_v2";

const APPLICATIONS = {
  "Drop Side Cargo Body": { baseCost: 850, material: "MS chequered plate / steel structure", requiresPump: false, requiresCrane: false },
  "Crane Installation with Cargo Body": { baseCost: 1450, material: "Heavy duty reinforced sub-frame + cargo body", requiresPump: false, requiresCrane: true },
  "Fuel Tank": { baseCost: 2200, material: "ASTM A283 Grade C / MS tank steel", requiresPump: false, requiresCrane: false },
  "Water Tank": { baseCost: 1800, material: "MS tank steel / optional stainless steel", requiresPump: true, requiresCrane: false },
  "Vacuum Tank": { baseCost: 3200, material: "ASTM A283 Grade C or equivalent", requiresPump: true, requiresCrane: false },
  "Dump Body": { baseCost: 2100, material: "High tensile steel / Hardox optional", requiresPump: false, requiresCrane: false },
  "Recovery Truck Body": { baseCost: 2600, material: "Heavy duty steel platform", requiresPump: false, requiresCrane: false }
};

const TECH_LIBRARY = {
  "Drop Side Cargo Body": {
    title: "Normal Drop Side Cargo Body - Technical Specification",
    code: "DS-DSB-TYP-001",
    sections: [
      ["Body Structure", "Steel sub-frame with cross members, side panels, rear gate and front guard."],
      ["Floor", "MS chequered plate floor suitable for general cargo application."],
      ["Side Panels", "Drop side panels with hinges, locks and reinforcement ribs."],
      ["Painting", "Primer and final paint as per customer requirement."],
      ["Accessories", "Mudguards, lights brackets, reflectors and safety finishing."]
    ],
    drawings: ["Side view layout", "Rear gate view", "Sub-frame reference"]
  },
  "Crane Installation with Cargo Body": {
    title: "Crane Installation with Cargo Body - Technical Specification",
    code: "DS-CRN-TYP-001",
    sections: [
      ["Crane Sub-frame", "Heavy duty reinforced sub-frame for crane mounting load distribution."],
      ["Cargo Body", "Cargo platform/body integrated behind crane mounting area."],
      ["Hydraulic Integration", "PTO / hydraulic interface subject to crane model and chassis approval."],
      ["Stabilizer Support", "Reinforcement and outrigger support as required by crane capacity."],
      ["Safety", "Warning decals, stabilizer markings and clearance checks."]
    ],
    drawings: ["Crane position drawing", "Sub-frame layout", "Cargo body rear view"]
  },
  "Fuel Tank": {
    title: "Truck Mounted Fuel Tank - Technical Specification",
    code: "DS-FT-TYP-001",
    sections: [
      ["Tank Material", "ASTM A283 Grade C / MS tank steel or equivalent."],
      ["Tank Construction", "Tank with internal baffles and manhole access."],
      ["Discharge Arrangement", "Fuel discharge piping, valves and fittings as required."],
      ["Safety", "Grounding point, fire extinguisher bracket and safety labels."],
      ["Painting", "Primer and fuel-resistant protective finish."]
    ],
    drawings: ["Tank side view", "Rear piping view", "Manhole / baffle reference"]
  },
  "Water Tank": {
    title: "Truck Mounted Water Tank - Technical Specification",
    code: "DS-WT-TYP-001",
    sections: [
      ["Tank Material", "MS tank steel with optional stainless steel."],
      ["Tank Construction", "Internal baffles, filling point, manhole and discharge system."],
      ["Pump System", "Hydraulic / PTO water pump when selected."],
      ["Spray System", "Rear spray bar, side spray nozzles or hose reel optional."],
      ["Accessories", "Ladder, catwalk, mudguards, toolbox and lighting brackets."]
    ],
    drawings: ["Water tank side view", "Rear spray bar layout", "Pump location reference"]
  },
  "Vacuum Tank": {
    title: "Truck Mounted Vacuum Tanker - Technical Specification",
    code: "DS-VT-TYP-001",
    sections: [
      ["Tank Capacity", "Nominal capacity as per RFQ with ullage allowance subject to final engineering confirmation."],
      ["Tank Construction", "ASTM A283 Grade C or equivalent; shell and dish-end thickness based on capacity and service."],
      ["Vacuum Pump System", "PTO / hydraulic driven vacuum pump with suction and discharge arrangement."],
      ["Vacuum Safety System", "Pressure relief valve, vacuum relief valve, primary shutoff, secondary shutoff, security filter and silencer/filter arrangement."],
      ["Suction & Discharge", "Ball valve with quick coupling, suction hose carrier and rear access arrangement."],
      ["Corrosion Protection", "Internal sand blasting and epoxy coating optional for wastewater/sludge service."]
    ],
    drawings: ["Vacuum tanker side view", "Rear door view", "Pump and suction line layout"]
  },
  "Dump Body": {
    title: "Rear Tipping Dump Body - Technical Specification",
    code: "DS-DB-TYP-001",
    sections: [
      ["Body Structure", "Heavy duty rear tipping body with reinforced floor, sides and tailgate."],
      ["Hydraulic System", "Front or underbody tipping cylinder subject to chassis and capacity."],
      ["Sub-frame", "Reinforced sub-frame with pivot brackets and tipping support."],
      ["Tailgate", "Manual or automatic tailgate locking arrangement."],
      ["Safety", "Body safety prop, hydraulic protection and warning markings."]
    ],
    drawings: ["Dump body side view", "Tipping angle reference", "Rear tailgate view"]
  },
  "Recovery Truck Body": {
    title: "Recovery Truck Body - Technical Specification",
    code: "DS-RT-TYP-001",
    sections: [
      ["Platform", "Heavy duty steel recovery platform suitable for vehicle loading and transport."],
      ["Winch Provision", "Winch mounting and cable guide subject to selected winch capacity."],
      ["Loading Ramps", "Rear ramps or slide/tilt arrangement based on selected design."],
      ["Accessories", "Toolbox, safety lights, side guards, mudguards and tie-down points."],
      ["Painting", "Primer and final paint as per customer requirement."]
    ],
    drawings: ["Recovery platform side view", "Rear ramp view", "Winch mounting reference"]
  }
};

const PUMPS = {
  "Not Required": { cost: 0, spec: "No pump required." },
  "MORO M9": { cost: 1450, spec: "Rotary vane vacuum pump, approx. 15,000 L/min, suitable up to 15 inHg vacuum." },
  "Jurop PR200": { cost: 2100, spec: "Heavy duty vacuum pump suitable for high airflow industrial vacuum applications." },
  "Hydraulic Water Pump": { cost: 450, spec: "Hydraulic / PTO water pump for water tanker discharge and transfer." }
};

const CRANES = {
  "Not Required": { cost: 0, spec: "No crane required." },
  "3 Ton Crane": { cost: 2200, spec: "Light truck mounted crane with hydraulic stabilizers." },
  "5 Ton Crane": { cost: 3800, spec: "Medium duty truck mounted crane with sub-frame and hydraulic stabilizers." },
  "6 Ton Crane": { cost: 4600, spec: "Heavy duty truck mounted crane installation with reinforced sub-frame." }
};

const S = {
  page: { minHeight: "100vh", background: "#f4f7fb", padding: 24, fontFamily: "Arial, sans-serif", color: "#172033" },
  wrap: { maxWidth: 1200, margin: "0 auto" },
  header: { background: "white", borderRadius: 18, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 },
  h1: { fontSize: 26, margin: 0, fontWeight: 800 },
  small: { color: "#64748b", fontSize: 13 },
  tabs: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tab: { border: "1px solid #cbd5e1", background: "white", padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
  active: { background: "#0f172a", color: "white", border: "1px solid #0f172a" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 },
  card: { background: "white", borderRadius: 18, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  label: { fontSize: 13, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" },
  row: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #eef2f7", gap: 10 },
  button: { border: 0, background: "#0f172a", color: "white", padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 800 },
  outline: { border: "1px solid #cbd5e1", background: "white", color: "#0f172a", padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 800 },
  danger: { border: 0, background: "#b91c1c", color: "white", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  td: { padding: 10, border: "1px solid #e2e8f0", verticalAlign: "top" },
  th: { background: "#f1f5f9", padding: 10, textAlign: "left", border: "1px solid #e2e8f0" },
  badge: { display: "inline-block", padding: "4px 9px", background: "#e0f2fe", borderRadius: 999, fontSize: 12, fontWeight: 700 }
};

function defaultRFQ() {
  return {
    quoteNo: "DS-" + new Date().getFullYear().toString().slice(2) + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().slice(0, 10),
    customer: "",
    contact: "",
    email: "",
    phone: "",
    chassis: "Hino / FAW / Isuzu",
    wheelbase: "",
    application: "Vacuum Tank",
    capacity: "3,000 US Gallons",
    pump: "MORO M9",
    crane: "Not Required",
    accessories: 250,
    labor: 500,
    margin: 18,
    pricingMode: "Manual",
    manualPrice: 0,
    includeTechnicalSpec: true,
    includeDrawing: true,
    notes: "Delivery, chassis suitability and final technical approval are subject to engineering confirmation."
  };
}

function App() {
  const [tab, setTab] = useState("rfq");
  const [deals, setDeals] = useState([]);
  const [rfq, setRfq] = useState(defaultRFQ());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDeals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  }, [deals]);

  const app = APPLICATIONS[rfq.application];
  const tech = TECH_LIBRARY[rfq.application];
  const pump = PUMPS[rfq.pump];
  const crane = CRANES[rfq.crane];

  const totals = useMemo(() => {
    const totalCost = app.baseCost + pump.cost + crane.cost + Number(rfq.accessories || 0) + Number(rfq.labor || 0);
    const margin = Math.min(Math.max(Number(rfq.margin || 0), 0), 80);
    const autoSelling = totalCost / (1 - margin / 100);
    const finalSelling = rfq.pricingMode === "Manual" ? Number(rfq.manualPrice || 0) : autoSelling;
    return { totalCost, autoSelling, finalSelling, margin };
  }, [rfq, app, pump, crane]);

  function update(key, value) {
    setRfq((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "application") {
        const selected = APPLICATIONS[value];
        if (!selected.requiresPump) next.pump = "Not Required";
        if (!selected.requiresCrane) next.crane = "Not Required";
        if (selected.requiresPump && next.pump === "Not Required") next.pump = value === "Water Tank" ? "Hydraulic Water Pump" : "MORO M9";
        if (selected.requiresCrane && next.crane === "Not Required") next.crane = "5 Ton Crane";
      }
      return next;
    });
  }

  function saveDeal() {
    const quote = {
      id: Date.now(),
      ...rfq,
      value: totals.finalSelling,
      autoSelling: totals.autoSelling,
      totalCost: totals.totalCost,
      status: "Quote Sent",
      savedAt: new Date().toLocaleString()
    };
    setDeals([quote, ...deals]);
    alert("✅ Quote saved locally on this browser");
    setTab("deals");
  }

  function loadDeal(deal) {
    setRfq({
      ...defaultRFQ(),
      ...deal
    });
    setTab("rfq");
  }

  function deleteDeal(id) {
    if (confirm("Delete this saved quote?")) {
      setDeals(deals.filter((d) => d.id !== id));
    }
  }

  function newQuote() {
    setRfq(defaultRFQ());
    setTab("rfq");
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>Al Dabbous Steel Quotation System</h1>
            <div style={S.small}>Free local version: RFQ, manual pricing, technical specs, drawing placeholders and quote history.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.outline} onClick={newQuote}>New Quote</button>
            <button style={S.button} onClick={saveDeal}>Save Quote</button>
            <button style={S.outline} onClick={() => window.print()}>Print Proposal</button>
          </div>
        </div>

        <div style={S.tabs}>
          {["rfq", "quote", "technical", "drawings", "deals", "library"].map((x) => (
            <button key={x} onClick={() => setTab(x)} style={{ ...S.tab, ...(tab === x ? S.active : {}) }}>
              {x === "rfq" ? "RFQ Configurator" : x === "quote" ? "Quote Preview" : x === "technical" ? "Technical Spec" : x === "drawings" ? "Drawings" : x === "deals" ? `Saved Quotes (${deals.length})` : "Libraries"}
            </button>
          ))}
        </div>

        {tab === "rfq" && <RFQ rfq={rfq} update={update} app={app} pump={pump} crane={crane} tech={tech} totals={totals} />}
        {tab === "quote" && <Quote rfq={rfq} app={app} pump={pump} crane={crane} tech={tech} totals={totals} />}
        {tab === "technical" && <Technical rfq={rfq} tech={tech} pump={pump} crane={crane} />}
        {tab === "drawings" && <Drawings rfq={rfq} tech={tech} />}
        {tab === "deals" && <Deals deals={deals} loadDeal={loadDeal} deleteDeal={deleteDeal} />}
        {tab === "library" && <Libraries />}
      </div>
    </div>
  );
}

function RFQ({ rfq, update, app, pump, crane, tech, totals }) {
  return (
    <div style={S.grid}>
      <div style={S.card}>
        <h2>RFQ Details</h2>
        <div style={S.formGrid}>
          <Field label="Quote No" value={rfq.quoteNo} onChange={(v) => update("quoteNo", v)} />
          <Field label="Date" type="date" value={rfq.date} onChange={(v) => update("date", v)} />
          <Field label="Customer" value={rfq.customer} onChange={(v) => update("customer", v)} />
          <Field label="Contact Person" value={rfq.contact} onChange={(v) => update("contact", v)} />
          <Field label="Email" value={rfq.email} onChange={(v) => update("email", v)} />
          <Field label="Phone" value={rfq.phone} onChange={(v) => update("phone", v)} />
          <Field label="Chassis" value={rfq.chassis} onChange={(v) => update("chassis", v)} />
          <Field label="Wheelbase" value={rfq.wheelbase} onChange={(v) => update("wheelbase", v)} />
          <Select label="Application Type" value={rfq.application} options={Object.keys(APPLICATIONS)} onChange={(v) => update("application", v)} />
          <Field label="Capacity" value={rfq.capacity} onChange={(v) => update("capacity", v)} />
          <Select label="Pump Selection" value={rfq.pump} options={Object.keys(PUMPS)} onChange={(v) => update("pump", v)} disabled={!app.requiresPump} />
          <Select label="Crane Selection" value={rfq.crane} options={Object.keys(CRANES)} onChange={(v) => update("crane", v)} disabled={!app.requiresCrane} />

          <Select label="Pricing Mode" value={rfq.pricingMode} options={["Manual", "Auto Costing"]} onChange={(v) => update("pricingMode", v)} />
          <Field label="Manual Total Quote Price KWD" type="number" value={rfq.manualPrice} onChange={(v) => update("manualPrice", v)} />

          <Field label="Accessories Cost KWD" type="number" value={rfq.accessories} onChange={(v) => update("accessories", v)} />
          <Field label="Labor Cost KWD" type="number" value={rfq.labor} onChange={(v) => update("labor", v)} />
          <Field label="Margin % for Auto Costing" type="number" value={rfq.margin} onChange={(v) => update("margin", v)} />

          <Check label="Attach Technical Specification" checked={rfq.includeTechnicalSpec} onChange={(v) => update("includeTechnicalSpec", v)} />
          <Check label="Attach Typical Drawing" checked={rfq.includeDrawing} onChange={(v) => update("includeDrawing", v)} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Notes</label>
          <textarea style={{ ...S.input, minHeight: 80 }} value={rfq.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
      </div>

      <div style={S.card}>
        <h2>Internal Costing</h2>
        <Cost label="Base Fabrication" value={app.baseCost} />
        <Cost label="Pump" value={pump.cost} />
        <Cost label="Crane" value={crane.cost} />
        <Cost label="Accessories" value={rfq.accessories} />
        <Cost label="Labor" value={rfq.labor} />
        <Cost label="Internal Total Cost" value={totals.totalCost} bold />
        <Cost label="Auto Selling Price" value={totals.autoSelling} />
        <div style={{ marginTop: 18, padding: 18, borderRadius: 14, background: "#eef2ff" }}>
          <div style={S.small}>Final Quote Price Shown to Customer</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>KWD {totals.finalSelling.toFixed(3)}</div>
          <span style={S.badge}>{rfq.pricingMode}</span>
        </div>
        <h3>Auto Attachments</h3>
        <Cost label="Technical Spec" value={rfq.includeTechnicalSpec ? tech.code : "No"} text />
        <Cost label="Drawing" value={rfq.includeDrawing ? "Typical layout" : "No"} text />
      </div>
    </div>
  );
}

function Quote({ rfq, app, pump, crane, tech, totals }) {
  return (
    <div style={S.card}>
      <Header subtitle="Quotation / Technical Proposal" />
      <div style={{ marginTop: 20, background: "#f1f5f9", padding: 16, borderRadius: 14, textAlign: "center" }}>
        <h2 style={{ margin: 0, textTransform: "uppercase" }}>{rfq.application} Proposal</h2>
        <div style={S.small}>Quote No: {rfq.quoteNo} | Date: {rfq.date}</div>
      </div>

      <h3>Customer / Project</h3>
      <table style={S.table}><tbody>
        <Row label="Customer" value={rfq.customer || "-"} />
        <Row label="Contact" value={rfq.contact || "-"} />
        <Row label="Chassis" value={rfq.chassis} />
        <Row label="Application" value={rfq.application} />
        <Row label="Capacity" value={rfq.capacity} />
      </tbody></table>

      <h3>Technical Summary</h3>
      <table style={S.table}><tbody>
        <Row label="Material" value={app.material} />
        <Row label="Pump" value={pump.spec} />
        <Row label="Crane" value={crane.spec} />
        <Row label="Attachment" value={`${rfq.includeTechnicalSpec ? tech.title : "No technical spec"} | ${rfq.includeDrawing ? tech.code : "No drawing"}`} />
        <Row label="Notes" value={rfq.notes} />
      </tbody></table>

      <h3>Commercial Offer</h3>
      <table style={S.table}><tbody>
        <Row label="Total Offer Price" value={`KWD ${totals.finalSelling.toFixed(3)}`} />
        <Row label="Validity" value="30 days" />
        <Row label="Delivery" value="Subject to confirmation" />
        <Row label="Payment" value="As agreed" />
      </tbody></table>
    </div>
  );
}

function Technical({ rfq, tech, pump, crane }) {
  return (
    <div style={S.card}>
      <Header subtitle="Technical Specification" />
      <h2>{tech.title}</h2>
      <span style={S.badge}>Document Code: {tech.code}</span>
      <table style={{ ...S.table, marginTop: 16 }}><tbody>
        <Row label="Application" value={rfq.application} />
        <Row label="Chassis" value={rfq.chassis} />
        <Row label="Capacity" value={rfq.capacity} />
        <Row label="Pump Selection" value={pump.spec} />
        <Row label="Crane Selection" value={crane.spec} />
        {tech.sections.map(([label, value]) => <Row key={label} label={label} value={value} />)}
      </tbody></table>
      <p style={S.small}>Final design, dimensions and mounting arrangement are subject to chassis confirmation and engineering approval.</p>
    </div>
  );
}

function Drawings({ rfq, tech }) {
  return (
    <div style={S.card}>
      <Header subtitle="Drawing Library / Typical Layouts" />
      <h2>{rfq.application} Drawing Attachments</h2>
      <p style={S.small}>These placeholders can later be replaced with actual PDF/JPG/PNG engineering drawings.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {tech.drawings.map((d, i) => (
          <div key={d}>
            <div style={{ border: "2px dashed #94a3b8", borderRadius: 14, minHeight: 150, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#f8fafc", color: "#475569", fontWeight: 800 }}>
              Drawing {i + 1}<br />{d}<br /><br />Placeholder
            </div>
            <div style={{ marginTop: 8, fontSize: 13 }}><b>Code:</b> {tech.code}-{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Deals({ deals, loadDeal, deleteDeal }) {
  return (
    <div style={S.card}>
      <h2>Saved Quotes</h2>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Quote No</th>
            <th style={S.th}>Customer</th>
            <th style={S.th}>Application</th>
            <th style={S.th}>Value</th>
            <th style={S.th}>Pricing</th>
            <th style={S.th}>Saved</th>
            <th style={S.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id}>
              <td style={S.td}>{d.quoteNo}</td>
              <td style={S.td}>{d.customer || "-"}</td>
              <td style={S.td}>{d.application}</td>
              <td style={S.td}>KWD {Number(d.value || 0).toFixed(3)}</td>
              <td style={S.td}>{d.pricingMode}</td>
              <td style={S.td}>{d.savedAt}</td>
              <td style={S.td}>
                <button style={S.outline} onClick={() => loadDeal(d)}>Load</button>{" "}
                <button style={S.danger} onClick={() => deleteDeal(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deals.length === 0 && <p style={{ textAlign: "center", color: "#64748b" }}>No saved quotes yet.</p>}
    </div>
  );
}

function Libraries() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Library title="Applications" data={APPLICATIONS} />
      <Library title="Technical Spec Library" data={TECH_LIBRARY} />
      <Library title="Pumps" data={PUMPS} />
      <Library title="Cranes" data={CRANES} />
    </div>
  );
}

function Library({ title, data }) {
  return (
    <div style={S.card}>
      <h2>{title}</h2>
      {Object.entries(data).map(([name, item]) => (
        <div key={name} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <b>{name}</b>
          <div style={S.small}>Code/Cost: {item.code || `KWD ${Number(item.baseCost || item.cost || 0).toFixed(3)}`}</div>
          <div style={S.small}>{item.title || item.spec || item.material}</div>
        </div>
      ))}
    </div>
  );
}

function Header({ subtitle }) {
  return (
    <div style={{ borderBottom: "4px solid #0f172a", paddingBottom: 16, display: "flex", justifyContent: "space-between", gap: 20 }}>
      <div style={{ width: 130, height: 80, border: "1px solid #cbd5e1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 900, fontSize: 12 }}>AL DABBOUS<br />STEEL</div>
      <div style={{ textAlign: "right" }}>
        <h2 style={{ margin: 0 }}>AL DABBOUS STEEL FACTORY</h2>
        <div style={S.small}>{subtitle}</div>
        <div style={{ ...S.small, marginTop: 8 }}>P.O. Box 46770 Fahaheel | Industrial Area - Plot 135 | Kuwait</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return <div><label style={S.label}>{label}</label><input style={S.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Select({ label, value, options, onChange, disabled }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select style={{ ...S.input, background: disabled ? "#f1f5f9" : "white" }} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#334155" }}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}

function Cost({ label, value, bold, text }) {
  return <div style={{ ...S.row, fontWeight: bold ? 900 : 500 }}><span>{label}</span><span>{text ? value : `KWD ${Number(value || 0).toFixed(3)}`}</span></div>;
}

function Row({ label, value }) {
  return <tr><td style={{ ...S.td, background: "#f8fafc", fontWeight: 800, width: "30%" }}>{label}</td><td style={S.td}>{value}</td></tr>;
}

createRoot(document.getElementById("root")).render(<App />);
