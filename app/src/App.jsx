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
          alignItems: "center",
          gap: "6px",
          padding: "14px 24px",
          background: "#1a1d28",
          borderBottom: "1px solid #2a2d38",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#daa520",
            letterSpacing: "0.04em",
            marginRight: "20px",
          }}
        >
          GRIDMIND
        </span>
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => setActive(p.key)}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: active === p.key ? "1px solid #daa520" : "1px solid transparent",
              background: active === p.key ? "#daa52015" : "transparent",
              color: active === p.key ? "#daa520" : "#8b8b96",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: active === p.key ? 600 : 500,
              letterSpacing: "0.01em",
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
