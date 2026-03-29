import { useState } from "react";

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d28",
  border: "#262a38",
  orange: "#e67e22",
  blue: "#3498db",
  green: "#27ae60",
  gold: "#daa520",
  text: "#c8c8d0",
  muted: "#6b6f80",
  bright: "#e8e8ee",
};

const pill = (label, color = COLORS.blue) => ({
  display: "inline-block",
  padding: "2px 9px",
  margin: "3px 3px",
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 10,
  background: color + "22",
  color: color,
  border: `1px solid ${color}44`,
  whiteSpace: "nowrap",
});

const cardBase = (accent) => ({
  background: COLORS.card,
  border: `1px solid ${accent}55`,
  borderRadius: 10,
  padding: "16px 14px",
  position: "relative",
  flex: 1,
  minWidth: 0,
});

const buildings = [
  {
    name: "Research Lab",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="12" width="24" height="16" rx="2" fill={COLORS.orange + "33"} stroke={COLORS.orange} strokeWidth="1.5" />
        <rect x="8" y="6" width="16" height="8" rx="1" fill={COLORS.orange + "22"} stroke={COLORS.orange} strokeWidth="1" />
        <rect x="10" y="16" width="4" height="4" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="18" y="16" width="4" height="4" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="10" y="22" width="4" height="4" rx="0.5" fill={COLORS.orange + "44"} />
        <rect x="18" y="22" width="4" height="4" rx="0.5" fill={COLORS.orange + "44"} />
        <circle cx="16" cy="3" r="2" fill={COLORS.orange} opacity="0.7" />
      </svg>
    ),
    sensors: ["VOC", "CO2", "VAV Controller", "Steam Trap Monitor"],
    protocol: "BACnet/IP",
    color: COLORS.orange,
  },
  {
    name: "Academic Building",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="14" width="26" height="14" rx="2" fill={COLORS.orange + "33"} stroke={COLORS.orange} strokeWidth="1.5" />
        <polygon points="16,4 3,14 29,14" fill={COLORS.orange + "22"} stroke={COLORS.orange} strokeWidth="1" />
        <rect x="8" y="18" width="4" height="4" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="20" y="18" width="4" height="4" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="13" y="22" width="6" height="6" rx="1" fill={COLORS.orange + "55"} />
        <circle cx="16" cy="9" r="2" fill={COLORS.orange} opacity="0.6" />
      </svg>
    ),
    sensors: ["CO2", "Power Meter", "Schedule Integration"],
    protocol: "BACnet/IP",
    color: COLORS.orange,
  },
  {
    name: "Residence Hall",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="8" width="20" height="20" rx="2" fill={COLORS.orange + "33"} stroke={COLORS.orange} strokeWidth="1.5" />
        <rect x="10" y="12" width="3" height="3" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="19" y="12" width="3" height="3" rx="0.5" fill={COLORS.orange + "66"} />
        <rect x="10" y="18" width="3" height="3" rx="0.5" fill={COLORS.orange + "55"} />
        <rect x="19" y="18" width="3" height="3" rx="0.5" fill={COLORS.orange + "55"} />
        <rect x="13" y="22" width="6" height="6" rx="1" fill={COLORS.orange + "66"} />
        <rect x="6" y="4" width="20" height="6" rx="1" fill={COLORS.orange + "22"} stroke={COLORS.orange} strokeWidth="1" />
      </svg>
    ),
    sensors: ["PIR Motion", "Smart Thermostat", "LED Controls"],
    protocol: "LoRaWAN",
    color: COLORS.orange,
  },
];

const costData = [
  { component: "CO2 Sensors (200)", cost: "$12,000" },
  { component: "VOC Sensors (40)", cost: "$12,000" },
  { component: "Power Meters (50)", cost: "$7,500" },
  { component: "Steam Trap Mon (300)", cost: "$60,000" },
  { component: "Motion/PIR (300)", cost: "$6,000" },
  { component: "LoRa Gateways (12)", cost: "$3,600" },
  { component: "Installation", cost: "$200,000" },
  { component: "Smart Meters (20)", cost: "$100,000" },
];

const engineModules = [
  { label: "Proxy Metering Model", color: COLORS.blue },
  { label: "AI Load Balancer", color: COLORS.blue },
  { label: "Predictive Maintenance", color: COLORS.blue },
  { label: "Dashboard + Alerts", color: COLORS.blue },
];

function ArrowDown({ x, y1, y2, color = COLORS.muted, label, labelSide = "right" }) {
  const mx = x;
  return (
    <g>
      <line x1={mx} y1={y1} x2={mx} y2={y2} stroke={color} strokeWidth="1.5" strokeDasharray="5,4" />
      <polygon
        points={`${mx},${y2} ${mx - 5},${y2 - 8} ${mx + 5},${y2 - 8}`}
        fill={color}
      />
      {label && (
        <text
          x={labelSide === "right" ? mx + 8 : mx - 8}
          y={(y1 + y2) / 2}
          fill={COLORS.muted}
          fontSize="9"
          textAnchor={labelSide === "right" ? "start" : "end"}
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function ArrowUp({ x, y1, y2, color = COLORS.muted, label, labelSide = "left" }) {
  const mx = x;
  return (
    <g>
      <line x1={mx} y1={y1} x2={mx} y2={y2} stroke={color} strokeWidth="1.5" strokeDasharray="5,4" />
      <polygon
        points={`${mx},${y2} ${mx - 5},${y2 + 8} ${mx + 5},${y2 + 8}`}
        fill={color}
      />
      {label && (
        <text
          x={labelSide === "left" ? mx - 8 : mx + 8}
          y={(y1 + y2) / 2}
          fill={COLORS.muted}
          fontSize="9"
          textAnchor={labelSide === "left" ? "end" : "start"}
          fontFamily="inherit"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export default function IoTArchitecture() {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "32px 24px",
        fontFamily: "'DM Sans', sans-serif",
        color: COLORS.text,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            color: COLORS.gold,
            fontSize: 28,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          GridMind IoT System Architecture
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, margin: 0, letterSpacing: 0.5 }}>
          Midwest State University — Smart Campus Energy Platform
        </p>
      </div>

      {/* Main layout: diagram + side panel */}
      <div style={{ display: "flex", gap: 24, maxWidth: 1200, margin: "0 auto", alignItems: "flex-start" }}>
        {/* Left: Architecture diagram */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ============ LAYER 3: GridMind Platform (top) ============ */}
          <div style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: COLORS.blue,
                }}
              />
              <span style={{ color: COLORS.blue, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Layer 3 — Software Platform
              </span>
            </div>
            <div
              style={{
                ...cardBase(COLORS.blue),
                padding: "20px 24px",
                borderWidth: 2,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill={COLORS.blue + "33"} stroke={COLORS.blue} strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" fill={COLORS.blue} opacity="0.7" />
                    <line x1="12" y1="2" x2="12" y2="6" stroke={COLORS.blue} strokeWidth="1.5" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke={COLORS.blue} strokeWidth="1.5" />
                    <line x1="2" y1="12" x2="6" y2="12" stroke={COLORS.blue} strokeWidth="1.5" />
                    <line x1="18" y1="12" x2="22" y2="12" stroke={COLORS.blue} strokeWidth="1.5" />
                  </svg>
                  <span style={{ color: COLORS.bright, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    GridMind Engine
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {engineModules.map((mod, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredModule(i)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{
                      background: hoveredModule === i ? COLORS.blue + "33" : COLORS.bg,
                      border: `1px solid ${hoveredModule === i ? COLORS.blue : COLORS.border}`,
                      borderRadius: 8,
                      padding: "10px 18px",
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: hoveredModule === i ? COLORS.bright : COLORS.text,
                      cursor: "default",
                      transition: "all 0.2s ease",
                      minWidth: 140,
                    }}
                  >
                    {mod.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SVG arrows between Layer 3 and Layer 2 */}
          <div style={{ position: "relative", height: 60 }}>
            <svg
              width="100%"
              height="60"
              style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
              preserveAspectRatio="none"
            >
              {/* Down arrows — commands */}
              <ArrowDown x={180} y1={0} y2={50} color={COLORS.blue} label="Optimized setpoints, schedules, commands" labelSide="right" />
              {/* Up arrows — data */}
              <ArrowUp x={520} y1={50} y2={0} color={COLORS.green} label="Sensor data, meter readings, BAS telemetry" labelSide="right" />
            </svg>
          </div>

          {/* ============ LAYER 2: Connectivity (middle) ============ */}
          <div style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: COLORS.green,
                }}
              />
              <span style={{ color: COLORS.green, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Layer 2 — Network / Connectivity
              </span>
            </div>
            <div
              style={{
                ...cardBase(COLORS.green),
                padding: "16px 20px",
              }}
            >
              {/* LoRaWAN Gateways */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <span style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>LoRaWAN Gateways:</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3].map((g) => (
                    <div
                      key={g}
                      style={{
                        width: 36,
                        height: 28,
                        background: COLORS.green + "22",
                        border: `1px solid ${COLORS.green}66`,
                        borderRadius: 5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="7" width="12" height="8" rx="2" fill={COLORS.green + "55"} stroke={COLORS.green} strokeWidth="1" />
                        <line x1="9" y1="3" x2="9" y2="7" stroke={COLORS.green} strokeWidth="1.5" />
                        <circle cx="9" cy="3" r="1.5" fill={COLORS.green} />
                      </svg>
                    </div>
                  ))}
                </div>
                <span style={{ color: COLORS.muted, fontSize: 10 }}>x12 across campus</span>
              </div>

              {/* Campus Network Backbone bar */}
              <div
                style={{
                  background: `linear-gradient(90deg, ${COLORS.green}11 0%, ${COLORS.green}33 50%, ${COLORS.green}11 100%)`,
                  border: `1.5px solid ${COLORS.green}88`,
                  borderRadius: 8,
                  padding: "10px 20px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <span style={{ color: COLORS.bright, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.04em" }}>
                  Campus Network Backbone
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={pill(null, COLORS.orange)}>
                    BACnet/IP
                  </span>
                  <span style={{ color: COLORS.muted, fontSize: 10, alignSelf: "center" }}>Ethernet + Fiber</span>
                  <span style={pill(null, COLORS.green)}>
                    LoRaWAN
                  </span>
                </div>
              </div>

              {/* Protocol labels */}
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
                <span style={{ color: COLORS.orange, fontSize: 10, fontWeight: 600 }}>
                  Existing BAS via BACnet/IP
                </span>
                <span style={{ color: COLORS.green, fontSize: 10, fontWeight: 600 }}>
                  New IoT Sensors via LoRaWAN
                </span>
              </div>
            </div>
          </div>

          {/* SVG arrows between Layer 2 and Layer 1 */}
          <div style={{ position: "relative", height: 50 }}>
            <svg
              width="100%"
              height="50"
              style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
            >
              {/* Vertical lines connecting each building to the network */}
              <line x1="14%" y1="0" x2="14%" y2="50" stroke={COLORS.orange + "88"} strokeWidth="1.5" strokeDasharray="4,3" />
              <line x1="50%" y1="0" x2="50%" y2="50" stroke={COLORS.orange + "88"} strokeWidth="1.5" strokeDasharray="4,3" />
              <line x1="86%" y1="0" x2="86%" y2="50" stroke={COLORS.green + "88"} strokeWidth="1.5" strokeDasharray="4,3" />
              {/* Protocol labels on connectors */}
              <text x="14%" y="28" fill={COLORS.orange} fontSize="9" textAnchor="middle" fontFamily="inherit" fontWeight="600">BACnet/IP</text>
              <text x="50%" y="28" fill={COLORS.orange} fontSize="9" textAnchor="middle" fontFamily="inherit" fontWeight="600">BACnet/IP</text>
              <text x="86%" y="28" fill={COLORS.green} fontSize="9" textAnchor="middle" fontFamily="inherit" fontWeight="600">LoRaWAN</text>
            </svg>
          </div>

          {/* ============ LAYER 1: Buildings (bottom) ============ */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: COLORS.orange,
                }}
              />
              <span style={{ color: COLORS.orange, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Layer 1 — Physical / Buildings
              </span>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {buildings.map((b, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredBuilding(i)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  style={{
                    ...cardBase(b.color),
                    borderColor: hoveredBuilding === i ? b.color : b.color + "55",
                    transform: hoveredBuilding === i ? "translateY(-2px)" : "none",
                    boxShadow: hoveredBuilding === i ? `0 4px 20px ${b.color}22` : "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "16px 12px 14px",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>{b.icon}</div>
                  <div
                    style={{
                      color: COLORS.bright,
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {b.name}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
                    {b.sensors.map((s, si) => (
                      <span key={si} style={pill(s, b.color)}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 10,
                      color: COLORS.muted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {b.protocol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ SIDE PANEL: Cost Summary ============ */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: COLORS.green,
              }}
            />
            <span style={{ color: COLORS.green, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
              Cost Summary
            </span>
          </div>
          <div
            style={{
              ...cardBase(COLORS.green),
              padding: "18px 16px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      color: COLORS.gold,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      paddingBottom: 8,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    Component
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      color: COLORS.gold,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      paddingBottom: 8,
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {costData.map((row, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        padding: "7px 0",
                        color: COLORS.text,
                        borderBottom: `1px solid ${COLORS.border}44`,
                        fontWeight: 500,
                      }}
                    >
                      {row.component}
                    </td>
                    <td
                      style={{
                        padding: "7px 0",
                        color: COLORS.bright,
                        textAlign: "right",
                        borderBottom: `1px solid ${COLORS.border}44`,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.cost}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr>
                  <td
                    style={{
                      padding: "10px 0 4px",
                      color: COLORS.gold,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 13,
                      borderTop: `2px solid ${COLORS.green}66`,
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      padding: "10px 0 4px",
                      color: COLORS.gold,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: "right",
                      borderTop: `2px solid ${COLORS.green}66`,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    $401,100
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Callout */}
            <div
              style={{
                marginTop: 16,
                background: COLORS.green + "15",
                border: `1px solid ${COLORS.green}44`,
                borderRadius: 8,
                padding: "10px 14px",
                textAlign: "center",
              }}
            >
              <span style={{ color: COLORS.green, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                Under 3.4%
              </span>
              <span style={{ color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                {" "}of the{" "}
              </span>
              <span style={{ color: COLORS.bright, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                $12M budget
              </span>
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              marginTop: 20,
              ...cardBase(COLORS.border),
              padding: "14px 16px",
            }}
          >
            <div style={{ color: COLORS.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Legend
            </div>
            {[
              { label: "Engineering / Physical", color: COLORS.orange },
              { label: "Software / Platform", color: COLORS.blue },
              { label: "Network / Finance", color: COLORS.green },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: item.color + "44",
                    border: `1.5px solid ${item.color}`,
                  }}
                />
                <span style={{ color: COLORS.text, fontSize: 11, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Data flow legend */}
          <div
            style={{
              marginTop: 12,
              ...cardBase(COLORS.border),
              padding: "14px 16px",
            }}
          >
            <div style={{ color: COLORS.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Data Flow
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg width="30" height="12" viewBox="0 0 30 12">
                <line x1="0" y1="6" x2="22" y2="6" stroke={COLORS.blue} strokeWidth="1.5" strokeDasharray="4,3" />
                <polygon points="30,6 22,2 22,10" fill={COLORS.blue} />
              </svg>
              <span style={{ color: COLORS.text, fontSize: 10 }}>Commands down</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="30" height="12" viewBox="0 0 30 12">
                <line x1="8" y1="6" x2="30" y2="6" stroke={COLORS.green} strokeWidth="1.5" strokeDasharray="4,3" />
                <polygon points="0,6 8,2 8,10" fill={COLORS.green} />
              </svg>
              <span style={{ color: COLORS.text, fontSize: 10 }}>Telemetry up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <span style={{ color: COLORS.muted, fontSize: 11 }}>
          GridMind IoT Architecture v1.0 — Midwest State University
        </span>
      </div>
    </div>
  );
}
