import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

const baselineHourly = [
  { hour: "12am", demand: 8200, rate: "off-peak" },
  { hour: "1am",  demand: 7800, rate: "off-peak" },
  { hour: "2am",  demand: 7400, rate: "off-peak" },
  { hour: "3am",  demand: 7100, rate: "off-peak" },
  { hour: "4am",  demand: 6900, rate: "off-peak" },
  { hour: "5am",  demand: 7200, rate: "off-peak" },
  { hour: "6am",  demand: 12000, rate: "off-peak" },
  { hour: "7am",  demand: 19000, rate: "off-peak" },
  { hour: "8am",  demand: 22000, rate: "off-peak" },
  { hour: "9am",  demand: 24000, rate: "off-peak" },
  { hour: "10am", demand: 24500, rate: "peak" },
  { hour: "11am", demand: 23800, rate: "peak" },
  { hour: "12pm", demand: 23500, rate: "peak" },
  { hour: "1pm",  demand: 24200, rate: "peak" },
  { hour: "2pm",  demand: 24000, rate: "peak" },
  { hour: "3pm",  demand: 23000, rate: "peak" },
  { hour: "4pm",  demand: 21000, rate: "peak" },
  { hour: "5pm",  demand: 17000, rate: "peak" },
  { hour: "6pm",  demand: 14000, rate: "off-peak" },
  { hour: "7pm",  demand: 12500, rate: "off-peak" },
  { hour: "8pm",  demand: 11500, rate: "off-peak" },
  { hour: "9pm",  demand: 10500, rate: "off-peak" },
  { hour: "10pm", demand: 9800, rate: "off-peak" },
  { hour: "11pm", demand: 8800, rate: "off-peak" },
];

// With ice storage: off-peak (10pm-8am) demand increases ~2000 (making ice),
// peak (10am-6pm) demand decreases ~3500 (using ice), others slight adjustment
const withIceHourly = baselineHourly.map((entry) => {
  const h = entry.hour;
  // Off-peak charging hours: 10pm through 8am (indices for 10pm,11pm,12am-8am)
  const chargingHours = [
    "10pm", "11pm", "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am",
  ];
  // Peak discharging hours: 10am through 5pm
  const dischargingHours = [
    "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  ];

  if (chargingHours.includes(h)) {
    return { ...entry, iceDemand: entry.demand + 2000 };
  } else if (dischargingHours.includes(h)) {
    return { ...entry, iceDemand: entry.demand - 3500 };
  } else {
    // Transition hours (9am, 6pm-9pm) — slight adjustment
    return { ...entry, iceDemand: entry.demand - 500 };
  }
});

// Merge into single chart data
const chartData = baselineHourly.map((entry, i) => ({
  hour: entry.hour,
  baseline: entry.demand,
  withIce: withIceHourly[i].iceDemand,
  rate: entry.rate,
}));

// Determine current simulated hour for the ice storage indicator
const getSimulatedHour = () => {
  const now = new Date();
  return now.getHours();
};

const SnowflakeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    <line x1="12" y1="2" x2="9" y2="5" />
    <line x1="12" y1="2" x2="15" y2="5" />
    <line x1="12" y1="22" x2="9" y2="19" />
    <line x1="12" y1="22" x2="15" y2="19" />
    <line x1="2" y1="12" x2="5" y2="9" />
    <line x1="2" y1="12" x2="5" y2="15" />
    <line x1="22" y1="12" x2="19" y2="9" />
    <line x1="22" y1="12" x2="19" y2="15" />
  </svg>
);

const SunIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#1a1d28",
        border: "1px solid #2a2d38",
        borderRadius: 8,
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ color: "#c8c8d0", fontWeight: 600, margin: "0 0 8px 0", fontSize: 13 }}>
        {label}
      </p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color, margin: "4px 0", fontSize: 12 }}>
          {entry.name}: {Number(entry.value).toLocaleString()} kWh/hr
        </p>
      ))}
    </div>
  );
};

export default function PeakShavingVisualization() {
  const [showIce, setShowIce] = useState(false);
  const [hoveredHour, setHoveredHour] = useState(null);

  // For the ice indicator, cycle through a visual representation
  // We'll show charging state by default, toggle to discharging when showIce is on
  const isCharging = !showIce;
  const fillPercent = isCharging ? 72 : 35;

  const statsData = [
    {
      metric: "Peak Demand",
      without: "24,500 kWh/hr",
      withIce: "21,000 kWh/hr",
      highlight: false,
    },
    {
      metric: "Daily Peak Cost",
      without: "$28,560",
      withIce: "$19,992",
      highlight: false,
    },
    {
      metric: "Daily Off-Peak Cost",
      without: "$17,440",
      withIce: "$19,380",
      highlight: false,
    },
    {
      metric: "Daily Total Cost",
      without: "$46,000",
      withIce: "$39,372",
      highlight: true,
    },
    {
      metric: "Daily Savings",
      without: "\u2014",
      withIce: "$6,628",
      highlight: true,
    },
    {
      metric: "Annual Savings",
      without: "\u2014",
      withIce: "$700K+",
      highlight: true,
    },
  ];

  return (
    <div
      style={{
        background: "#0f1117",
        minHeight: "100vh",
        padding: "40px 24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#c8c8d0",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#daa520",
                boxShadow: "0 0 12px rgba(218,165,32,0.5)",
              }}
            />
            <span
              style={{
                color: "#6b6f80",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              GridMind &mdash; Midwest State University
            </span>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 8px 0",
              letterSpacing: -0.5,
            }}
          >
            Thermal Ice Storage &mdash; Peak Demand Shaving
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#6b6f80",
              margin: 0,
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Shift cooling load from expensive peak hours to cheap off-peak hours
          </p>
        </div>

        {/* Toggle Button + Ice Storage Indicator Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setShowIce(!showIce)}
            style={{
              background: showIce
                ? "linear-gradient(135deg, #1abc9c, #27ae60)"
                : "linear-gradient(135deg, #2a2d38, #1a1d28)",
              color: showIce ? "#ffffff" : "#c8c8d0",
              border: showIce ? "1px solid #27ae60" : "1px solid #2a2d38",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.4s ease",
              boxShadow: showIce
                ? "0 4px 20px rgba(39,174,96,0.3)"
                : "0 2px 8px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                border: "2px solid",
                borderColor: showIce ? "#fff" : "#6b6f80",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                background: showIce ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
              {showIce && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            Show Ice Storage Impact
          </button>

          {/* Ice Storage State Indicator */}
          <div
            style={{
              background: "#1a1d28",
              border: "1px solid #2a2d38",
              borderRadius: 12,
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "all 0.4s ease",
            }}
          >
            {showIce ? <SunIcon /> : <SnowflakeIcon />}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: showIce ? "#e67e22" : "#3498db",
                  marginBottom: 6,
                  transition: "color 0.4s ease",
                }}
              >
                {showIce ? "DISCHARGING" : "CHARGING"}
              </div>
              <div
                style={{
                  width: 120,
                  height: 10,
                  background: "#0f1117",
                  borderRadius: 5,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${showIce ? 35 : 72}%`,
                    height: "100%",
                    background: showIce
                      ? "linear-gradient(90deg, #e67e22, #e74c3c)"
                      : "linear-gradient(90deg, #3498db, #1abc9c)",
                    borderRadius: 5,
                    transition: "all 0.8s ease",
                    boxShadow: showIce
                      ? "0 0 8px rgba(231,76,60,0.4)"
                      : "0 0 8px rgba(52,152,219,0.4)",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#6b6f80",
                  marginTop: 3,
                }}
              >
                Ice Tank: {showIce ? "35%" : "72%"} full
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: "linear-gradient(135deg, #e74c3c, #e67e22)",
              }}
            />
            <span style={{ fontSize: 13, color: "#c8c8d0" }}>
              Baseline Demand (No Ice Storage)
            </span>
          </div>
          {showIce && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #3498db, #1abc9c)",
                }}
              />
              <span style={{ fontSize: 13, color: "#c8c8d0" }}>
                With Ice Storage
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: "rgba(231,76,60,0.15)",
                border: "1px solid rgba(231,76,60,0.3)",
              }}
            />
            <span style={{ fontSize: 13, color: "#c8c8d0" }}>
              Peak Hours (10am&ndash;6pm)
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: "rgba(39,174,96,0.15)",
                border: "1px solid rgba(39,174,96,0.3)",
              }}
            />
            <span style={{ fontSize: 13, color: "#c8c8d0" }}>
              Off-Peak Charging (10pm&ndash;8am)
            </span>
          </div>
        </div>

        {/* Main Chart */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 16,
            border: "1px solid #2a2d38",
            padding: "24px 16px 16px 8px",
            marginBottom: 32,
          }}
        >
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <defs>
                <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e74c3c" stopOpacity={showIce ? 0.2 : 0.5} />
                  <stop offset="100%" stopColor="#e67e22" stopOpacity={showIce ? 0.02 : 0.05} />
                </linearGradient>
                <linearGradient id="iceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3498db" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#1abc9c" stopOpacity={0.08} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2a2d38"
                vertical={false}
              />

              {/* Peak hours shading */}
              <ReferenceArea
                x1="10am"
                x2="5pm"
                fill="rgba(231,76,60,0.1)"
                fillOpacity={1}
                strokeOpacity={0}
              />

              {/* Off-peak charging hours shading (shown in two segments since it wraps midnight) */}
              <ReferenceArea
                x1="10pm"
                x2="11pm"
                fill="rgba(39,174,96,0.1)"
                fillOpacity={1}
                strokeOpacity={0}
              />
              <ReferenceArea
                x1="12am"
                x2="8am"
                fill="rgba(39,174,96,0.1)"
                fillOpacity={1}
                strokeOpacity={0}
              />

              {/* Boundary reference lines */}
              <ReferenceLine
                x="10am"
                stroke="#e74c3c"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: "Peak Start",
                  position: "top",
                  fill: "#e74c3c",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
              <ReferenceLine
                x="5pm"
                stroke="#e74c3c"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: "Peak End",
                  position: "top",
                  fill: "#e74c3c",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />

              <XAxis
                dataKey="hour"
                tick={{ fill: "#6b6f80", fontSize: 11 }}
                axisLine={{ stroke: "#2a2d38" }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: "#6b6f80", fontSize: 11 }}
                axisLine={{ stroke: "#2a2d38" }}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                domain={[0, 28000]}
                label={{
                  value: "Demand (kWh/hr)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6b6f80",
                  fontSize: 12,
                  dx: -5,
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Baseline area — always shown */}
              <Area
                type="monotone"
                dataKey="baseline"
                name="Baseline"
                stroke={showIce ? "rgba(231,76,60,0.4)" : "#e74c3c"}
                strokeWidth={showIce ? 1.5 : 2.5}
                fill="url(#baselineGrad)"
                animationDuration={800}
                dot={false}
                activeDot={
                  showIce
                    ? false
                    : {
                        r: 5,
                        fill: "#e74c3c",
                        stroke: "#1a1d28",
                        strokeWidth: 2,
                      }
                }
              />

              {/* Ice storage area — shown only when toggle is on */}
              {showIce && (
                <Area
                  type="monotone"
                  dataKey="withIce"
                  name="With Ice Storage"
                  stroke="#1abc9c"
                  strokeWidth={2.5}
                  fill="url(#iceGrad)"
                  animationDuration={800}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#1abc9c",
                    stroke: "#1a1d28",
                    strokeWidth: 2,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Comparison Table */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 16,
            border: "1px solid #2a2d38",
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #2a2d38",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#ffffff",
                margin: 0,
              }}
            >
              Cost Comparison
            </h2>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 24px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b6f80",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    borderBottom: "1px solid #2a2d38",
                  }}
                >
                  Metric
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 24px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b6f80",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    borderBottom: "1px solid #2a2d38",
                  }}
                >
                  Without Ice Storage
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 24px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#27ae60",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    borderBottom: "1px solid #2a2d38",
                    background: "rgba(39,174,96,0.05)",
                  }}
                >
                  With Ice Storage
                </th>
              </tr>
            </thead>
            <tbody>
              {statsData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "14px 24px",
                      fontSize: 14,
                      fontWeight: row.highlight ? 700 : 400,
                      color: row.highlight ? "#ffffff" : "#c8c8d0",
                      borderBottom:
                        idx < statsData.length - 1
                          ? "1px solid #2a2d38"
                          : "none",
                    }}
                  >
                    {row.metric}
                  </td>
                  <td
                    style={{
                      padding: "14px 24px",
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: row.highlight ? 700 : 400,
                      color: row.highlight ? "#ffffff" : "#c8c8d0",
                      borderBottom:
                        idx < statsData.length - 1
                          ? "1px solid #2a2d38"
                          : "none",
                    }}
                  >
                    {row.without}
                  </td>
                  <td
                    style={{
                      padding: "14px 24px",
                      textAlign: "right",
                      fontSize: 14,
                      fontWeight: row.highlight ? 700 : 400,
                      color: row.highlight ? "#27ae60" : "#1abc9c",
                      borderBottom:
                        idx < statsData.length - 1
                          ? "1px solid #2a2d38"
                          : "none",
                      background: "rgba(39,174,96,0.05)",
                    }}
                  >
                    {row.withIce}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explanation Callout */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(52,152,219,0.08), rgba(26,188,156,0.08))",
            border: "1px solid rgba(52,152,219,0.25)",
            borderLeft: "4px solid #3498db",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(52,152,219,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3498db"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#3498db",
                  margin: "0 0 8px 0",
                }}
              >
                How It Works
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#c8c8d0",
                  margin: 0,
                }}
              >
                Ice is made at night when electricity costs{" "}
                <span style={{ color: "#27ae60", fontWeight: 600 }}>
                  $0.106/kWh
                </span>
                . During expensive peak hours (
                <span style={{ color: "#e74c3c", fontWeight: 600 }}>
                  $0.17/kWh
                </span>
                ), stored ice provides cooling instead of running chillers.
                Same comfort.{" "}
                <span style={{ color: "#daa520", fontWeight: 600 }}>
                  37% lower cost
                </span>{" "}
                per kWh shifted.
              </p>
            </div>
          </div>
        </div>

        {/* Investment Summary Box */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(218,165,32,0.08), rgba(218,165,32,0.03))",
            border: "2px solid rgba(218,165,32,0.35)",
            borderRadius: 12,
            padding: "24px 28px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#daa520"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#daa520",
                margin: 0,
              }}
            >
              Investment Summary
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 20,
            }}
          >
            {[
              { label: "System Cost", value: "$1.5M", color: "#c8c8d0" },
              { label: "Annual Savings", value: "$700K", color: "#27ae60" },
              { label: "Simple Payback", value: "2.1 years", color: "#3498db" },
              { label: "10-Year NPV", value: "$4.2M", color: "#daa520" },
            ].map((item, idx) => (
              <div key={idx}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6b6f80",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: -0.5,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            borderTop: "1px solid #2a2d38",
          }}
        >
          <span style={{ fontSize: 12, color: "#6b6f80" }}>
            GridMind Energy Analytics &mdash; Midwest State University &mdash;
            Thermal Storage Module v2.4
          </span>
        </div>
      </div>
    </div>
  );
}
