import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d28",
  cardAlt: "#14161f",
  gold: "#daa520",
  green: "#27ae60",
  red: "#e74c3c",
  blue: "#3498db",
  teal: "#1abc9c",
  purple: "#9b59b6",
  text: "#c8c8d0",
  muted: "#6b6f80",
  border: "#2a2d38",
};

const phases = [
  {
    id: 1,
    title: "Phase 1 (Year 1)",
    budget: "$2.8M",
    accent: COLORS.teal,
    items: [
      { name: "Strategic Smart Meter Deployment (20 bldgs)", cost: 200, savings: null, payback: "Enabler", justification: "20 buildings \u00d7 $10K/meter installed. Combined with existing 30 = 50 metered buildings covering ~70% of campus energy." },
      { name: "Lab VAV/DCV Retrofits \u2014 5 worst labs", cost: 1200, savings: 1400, payback: "10 mo", justification: "5 labs \u00d7 $240K each. UC Irvine achieved 61% savings across 13 labs (DOE Smart Labs). We model 40% conservatively. 5 \u00d7 4.9M kWh \u00d7 40% \u00d7 60% HVAC share \u00d7 $0.133/kWh = $1.4M/yr." },
      { name: "Steam Trap Monitoring Network", cost: 150, savings: 250, payback: "7 mo", justification: "500 wireless acoustic monitors \u00d7 $300 each. Industry data: 5\u201310% of traps fail open at any time, each wasting $5\u201315K/yr. 8% \u00d7 500 \u00d7 $6K avg = $240K+/yr waste detected." },
      { name: "Software Platform MVP + Proxy Metering", cost: 800, savings: 500, payback: "19 mo", justification: "Proxy metering engine + dashboard + scheduling integration. 60 academic buildings \u00d7 5% scheduling savings = 3.6M kWh = $480K/yr." },
      { name: "LED Retrofit + Controls (Residence Halls)", cost: 450, savings: 380, payback: "14 mo", justification: "25 residence halls. Lighting \u2248 20% of residential energy. LED saves 40\u201360%. 25 \u00d7 1.8M kWh \u00d7 20% \u00d7 50% = 4.5M kWh saved." },
    ],
    totalCost: 2800,
    totalSavings: 2530,
    savingsLabel: "$2.53M/yr savings",
  },
  {
    id: 2,
    title: "Phase 2 (Year 2\u20133)",
    budget: "$5.2M",
    accent: COLORS.blue,
    items: [
      { name: "Lab VAV/DCV \u2014 Remaining 15 labs", cost: 2800, savings: 2400, payback: "14 mo", justification: "15 labs \u00d7 $187K each (economies of scale from Phase 1). 15 \u00d7 4.9M kWh \u00d7 40% \u00d7 60% HVAC = 17.6M kWh saved." },
      { name: "Thermal Ice Storage System", cost: 1500, savings: 700, payback: "25 mo", justification: "Ice bank at central plant. Shift ~11M kWh from peak ($0.17) to off-peak ($0.106). 11M \u00d7 $0.064 = $704K/yr. Univ. of Arizona saves $456K/yr with similar system." },
      { name: "Advanced Analytics + Predictive Maintenance", cost: 500, savings: 400, payback: "15 mo", justification: "Anomaly detection on all 120 buildings. Fan power vs airflow, valve positions vs temps, filter \u0394P. Flags degradation before failure." },
      { name: "VFD Retrofits on 20 Major AHUs", cost: 400, savings: 300, payback: "16 mo", justification: "20 largest constant-speed AHUs \u00d7 $20K each. Affinity laws: 20% speed reduction = 49% power reduction." },
    ],
    totalCost: 5200,
    totalSavings: 3800,
    savingsLabel: "$3.8M/yr additional savings",
  },
  {
    id: 3,
    title: "Phase 3 (Year 4\u20135)",
    budget: "$4.0M",
    accent: COLORS.purple,
    items: [
      { name: "Building Envelope Upgrades (10 worst bldgs)", cost: 2000, savings: 600, payback: "3.3 yr", justification: "10 worst buildings \u00d7 $200K each. Window films + insulation + weather sealing, identified by analytics data." },
      { name: "Solar Canopy Pilot (3 parking structures)", cost: 1200, savings: 120, payback: "10 yr", justification: "~800kW across 3 parking structures. Indiana: ~4.2 peak sun hours. 1.2M kWh/yr. Included for ESG goals, not ROI." },
      { name: "Digital Twin + Continuous Optimization", cost: 400, savings: 300, payback: "16 mo", justification: "Full campus EnergyPlus model calibrated against 3 years of real data. Enables what-if simulation." },
      { name: "Contingency Reserve", cost: 400, savings: null, payback: "\u2014", justification: "3.3% reserve for overruns." },
    ],
    totalCost: 4000,
    totalSavings: 1020,
    savingsLabel: "$1.02M/yr additional savings",
  },
];

const cashFlowData = [
  { year: 1, capSpend: 2.8, annualSavings: 1.8, cumSavings: 1.8, netPosition: -1.0 },
  { year: 2, capSpend: 2.6, annualSavings: 4.3, cumSavings: 6.1, netPosition: 3.5 },
  { year: 3, capSpend: 2.6, annualSavings: 6.3, cumSavings: 12.4, netPosition: 6.1 },
  { year: 4, capSpend: 2.0, annualSavings: 7.3, cumSavings: 19.7, netPosition: 7.7 },
  { year: 5, capSpend: 2.0, annualSavings: 7.3, cumSavings: 27.0, netPosition: 15.0 },
];

const abatementData = [
  { name: "Steam Traps", costPerTon: 8, color: COLORS.green },
  { name: "Lab Ventilation", costPerTon: 12, color: COLORS.green },
  { name: "LED Retrofits", costPerTon: 18, color: COLORS.green },
  { name: "Scheduling Optimization", costPerTon: 22, color: COLORS.teal },
  { name: "VFD Retrofits", costPerTon: 25, color: COLORS.teal },
  { name: "Ice Storage", costPerTon: 35, color: COLORS.blue },
  { name: "Envelope Upgrades", costPerTon: 65, color: COLORS.gold },
  { name: "Solar", costPerTon: 180, color: COLORS.red },
];

const metrics = [
  { label: "Total Investment", value: "$12.0M", color: COLORS.gold },
  { label: "5-Year Net Savings", value: "$15.0M", color: COLORS.green },
  { label: "Simple Payback", value: "22 months", color: COLORS.teal },
  { label: "Internal Rate of Return", value: "45\u201355%", color: COLORS.blue },
];

function formatDollars(valInThousands) {
  if (valInThousands === null || valInThousands === undefined) return "\u2014";
  if (valInThousands >= 1000) return `$${(valInThousands / 1000).toFixed(1).replace(/\.0$/, "")}M`;
  return `$${valInThousands}K`;
}

function formatM(val, sign) {
  if (sign) {
    const prefix = val >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(val).toFixed(1)}M`;
  }
  return `$${val.toFixed(1)}M`;
}

function CustomBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: "10px 14px",
          color: COLORS.text,
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
        <div>${d.costPerTon}/ton CO\u2082 avoided</div>
      </div>
    );
  }
  return null;
}

export default function FinancialModel() {
  const [expandedPhases, setExpandedPhases] = useState({ 1: true, 2: false, 3: false });

  const togglePhase = (id) => {
    setExpandedPhases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sectionTitle = {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: "-0.01em",
  };

  const tableHeaderCell = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.muted,
    borderBottom: `1px solid ${COLORS.border}`,
  };

  const tableCell = {
    padding: "10px 16px",
    fontSize: 14,
    color: COLORS.text,
    borderBottom: `1px solid ${COLORS.border}`,
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "40px 24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: COLORS.text,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto 40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.gold,
              boxShadow: `0 0 12px ${COLORS.gold}60`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: COLORS.gold,
            }}
          >
            GridMind Financial Model
          </span>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Midwest State University
        </h1>
        <p style={{ fontSize: 16, color: COLORS.muted, margin: 0 }}>
          $12M budget over 5 years &mdash; phased deployment for maximum ROI
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* ───────────────────────────── SECTION 1: Phase Breakdown ───────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={sectionTitle}>Phase Breakdown</h2>

          {phases.map((phase) => {
            const isOpen = expandedPhases[phase.id];
            return (
              <div
                key={phase.id}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "16px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderLeft: `4px solid ${phase.accent}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span
                      style={{
                        fontSize: 18,
                        color: COLORS.muted,
                        transition: "transform 0.2s ease",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      &#9654;
                    </span>
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: phase.accent,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {phase.title}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: COLORS.muted,
                        fontWeight: 500,
                      }}
                    >
                      {phase.budget}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.green,
                      background: `${COLORS.green}18`,
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {phase.savingsLabel}
                  </span>
                </button>

                {/* Phase Table */}
                {isOpen && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                      }}
                    >
                      <colgroup>
                        <col style={{ width: "48%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "16%" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={tableHeaderCell}>Item</th>
                          <th style={{ ...tableHeaderCell, textAlign: "right" }}>Cost</th>
                          <th style={{ ...tableHeaderCell, textAlign: "right" }}>
                            Annual Savings
                          </th>
                          <th style={{ ...tableHeaderCell, textAlign: "right" }}>Payback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phase.items.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <tr
                              style={{
                                background: idx % 2 === 0 ? COLORS.cardAlt : COLORS.card,
                              }}
                            >
                              <td style={tableCell}>{item.name}</td>
                              <td style={{ ...tableCell, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                                {formatDollars(item.cost)}
                              </td>
                              <td
                                style={{
                                  ...tableCell,
                                  textAlign: "right",
                                  color: item.savings ? COLORS.green : COLORS.muted,
                                  fontWeight: item.savings ? 600 : 400,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {item.savings ? `${formatDollars(item.savings)}/yr` : "\u2014"}
                              </td>
                              <td
                                style={{
                                  ...tableCell,
                                  textAlign: "right",
                                  color: COLORS.muted,
                                }}
                              >
                                {item.payback}
                              </td>
                            </tr>
                            {item.justification && (
                              <tr style={{ background: idx % 2 === 0 ? COLORS.cardAlt : COLORS.card }}>
                                <td
                                  colSpan={4}
                                  style={{
                                    padding: "2px 16px 10px 40px",
                                    fontSize: 12,
                                    fontStyle: "italic",
                                    color: COLORS.muted,
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {item.justification}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {/* Total Row */}
                        <tr
                          style={{
                            borderTop: `2px solid ${phase.accent}40`,
                          }}
                        >
                          <td
                            style={{
                              ...tableCell,
                              fontWeight: 700,
                              color: phase.accent,
                              borderBottom: "none",
                            }}
                          >
                            {phase.title.toUpperCase()} TOTAL
                          </td>
                          <td
                            style={{
                              ...tableCell,
                              textAlign: "right",
                              fontWeight: 700,
                              color: "#ffffff",
                              borderBottom: "none",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {formatDollars(phase.totalCost)}
                          </td>
                          <td
                            style={{
                              ...tableCell,
                              textAlign: "right",
                              fontWeight: 700,
                              color: COLORS.green,
                              borderBottom: "none",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {formatDollars(phase.totalSavings)}/yr
                          </td>
                          <td style={{ ...tableCell, borderBottom: "none" }} />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.card} 0%, #1f2233 100%)`,
              border: `1px solid ${COLORS.gold}40`,
              borderRadius: 12,
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.gold }}>
              GRAND TOTAL
            </span>
            <div style={{ display: "flex", gap: 40 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                  Budget
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>
                  $12M
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                  Steady-State Savings
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.green, fontVariantNumeric: "tabular-nums" }}>
                  $7.35M/yr
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────── SECTION 2: Cash Flow Table ───────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={sectionTitle}>5-Year Cash Flow Projection</h2>
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Year", "Capital Spend", "Annual Savings", "Cumulative Savings", "Net Position"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          ...tableHeaderCell,
                          textAlign: h === "Year" ? "center" : "right",
                          padding: "14px 20px",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((row, idx) => {
                  const isBreakeven = row.year === 2;
                  const rowBg = isBreakeven
                    ? `${COLORS.green}12`
                    : idx % 2 === 0
                    ? COLORS.cardAlt
                    : COLORS.card;

                  return (
                    <tr
                      key={row.year}
                      style={{
                        background: rowBg,
                        borderLeft: isBreakeven ? `3px solid ${COLORS.green}` : "3px solid transparent",
                      }}
                    >
                      <td
                        style={{
                          ...tableCell,
                          textAlign: "center",
                          fontWeight: 700,
                          color: "#ffffff",
                          padding: "12px 20px",
                        }}
                      >
                        {row.year}
                        {isBreakeven && (
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 10,
                              fontWeight: 600,
                              color: COLORS.green,
                              background: `${COLORS.green}20`,
                              padding: "2px 8px",
                              borderRadius: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Breakeven
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          ...tableCell,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          padding: "12px 20px",
                        }}
                      >
                        {formatM(row.capSpend)}
                      </td>
                      <td
                        style={{
                          ...tableCell,
                          textAlign: "right",
                          color: COLORS.green,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                          padding: "12px 20px",
                        }}
                      >
                        {formatM(row.annualSavings)}
                      </td>
                      <td
                        style={{
                          ...tableCell,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          padding: "12px 20px",
                        }}
                      >
                        {formatM(row.cumSavings)}
                      </td>
                      <td
                        style={{
                          ...tableCell,
                          textAlign: "right",
                          fontWeight: 700,
                          color: row.netPosition >= 0 ? COLORS.green : COLORS.red,
                          fontVariantNumeric: "tabular-nums",
                          padding: "12px 20px",
                        }}
                      >
                        {formatM(row.netPosition, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ───────────────────────────── SECTION 3: Key Financial Metrics ───────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={sectionTitle}>Key Financial Metrics</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: "24px 20px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Accent glow at top */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: m.color,
                    boxShadow: `0 2px 16px ${m.color}50`,
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: COLORS.muted,
                    marginBottom: 10,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: m.label === "5-Year Net Savings" ? 36 : 30,
                    fontWeight: 800,
                    color: m.color,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    textShadow: `0 0 24px ${m.color}30`,
                  }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───────────────────────────── SECTION 4: Marginal Abatement Cost Curve ───────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={sectionTitle}>Marginal Abatement Cost Curve</h2>
          <p
            style={{
              fontSize: 14,
              color: COLORS.muted,
              margin: "0 0 24px",
              fontStyle: "italic",
            }}
          >
            Prioritize cheapest CO&#8322; reductions first &mdash; this is why we phase in this order
          </p>
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "24px 20px 16px",
            }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={abatementData}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: COLORS.muted, fontSize: 12 }}
                  axisLine={{ stroke: COLORS.border }}
                  tickLine={{ stroke: COLORS.border }}
                  domain={[0, 200]}
                  tickFormatter={(v) => `$${v}`}
                  label={{
                    value: "$/ton CO\u2082",
                    position: "insideBottomRight",
                    offset: -4,
                    fill: COLORS.muted,
                    fontSize: 12,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: COLORS.text, fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <ReferenceLine
                  x={50}
                  stroke={COLORS.gold}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: "Typical carbon credit price ($50/ton)",
                    position: "top",
                    fill: COLORS.gold,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: `${COLORS.border}40` }} />
                <Bar dataKey="costPerTon" radius={[0, 6, 6, 0]} barSize={28} label={({ x, y, width, height, value }) => (
                  <text
                    x={x + width + 8}
                    y={y + height / 2}
                    fill={COLORS.text}
                    fontSize={12}
                    fontWeight={600}
                    dominantBaseline="central"
                  >
                    ${value}/ton
                  </text>
                )}>
                  {abatementData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 0 16px",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            GridMind Financial Model &mdash; Midwest State University &mdash; $12M / 5-Year Deployment
          </span>
        </div>
      </div>
    </div>
  );
}
