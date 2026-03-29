import { useState } from "react";
import EnergySimulation from "./energy_simulation";
import CampusDashboard from "./campus_dashboard";
import AIOptimizationEngine from "./ai_engine";
import PeakShavingVisualization from "./peak_shaving";
import FinancialModel from "./financial_model";
import IoTArchitecture from "./iot_architecture";

const pages = [
  { key: "simulation", label: "Energy Simulation", component: EnergySimulation },
  { key: "dashboard", label: "Campus Dashboard", component: CampusDashboard },
  { key: "ai", label: "AI Engine", component: AIOptimizationEngine },
  { key: "peak", label: "Peak Shaving", component: PeakShavingVisualization },
  { key: "financial", label: "Financial Model", component: FinancialModel },
  { key: "iot", label: "IoT Architecture", component: IoTArchitecture },
];

export default function App() {
  const [active, setActive] = useState("simulation");
  const ActiveComponent = pages.find((p) => p.key === active).component;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117" }}>
      <nav
        style={{
          display: "flex",
          gap: "4px",
          padding: "12px 16px",
          background: "#1a1d28",
          borderBottom: "1px solid #2a2d38",
          flexWrap: "wrap",
        }}
      >
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: active === p.key ? "1px solid #daa520" : "1px solid #2a2d38",
              background: active === p.key ? "#daa52020" : "transparent",
              color: active === p.key ? "#daa520" : "#c8c8d0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: active === p.key ? 600 : 400,
              transition: "all 0.2s ease",
            }}
          >
            {p.label}
          </button>
        ))}
      </nav>
      <ActiveComponent />
    </div>
  );
}
