import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  bg: "#0f1117",
  card: "#1a1d28",
  border: "#2a2d38",
  gold: "#daa520",
  green: "#27ae60",
  red: "#e74c3c",
  blue: "#3498db",
  teal: "#1abc9c",
  text: "#c8c8d0",
  muted: "#6b6f80",
  white: "#f0f0f5",
};

const STATUS_COLORS = {
  green: COLORS.green,
  yellow: COLORS.gold,
  red: COLORS.red,
};

const buildingsBase = [
  { name: "Chemistry Lab", type: "Research Lab", kwhPerHour: 612, status: "red", metered: true },
  { name: "Physics Lab", type: "Research Lab", kwhPerHour: 580, status: "red", metered: true },
  { name: "Bio Research Center", type: "Research Lab", kwhPerHour: 545, status: "red", metered: false },
  { name: "Materials Science Lab", type: "Research Lab", kwhPerHour: 498, status: "red", metered: false },
  { name: "Engineering Hall", type: "Academic", kwhPerHour: 180, status: "yellow", metered: true },
  { name: "Liberal Arts", type: "Academic", kwhPerHour: 145, status: "green", metered: false },
  { name: "Business School", type: "Academic", kwhPerHour: 160, status: "yellow", metered: true },
  { name: "Mathematics Building", type: "Academic", kwhPerHour: 130, status: "green", metered: false },
  { name: "West Residence", type: "Residence Hall", kwhPerHour: 220, status: "yellow", metered: false },
  { name: "South Dormitory", type: "Residence Hall", kwhPerHour: 240, status: "red", metered: false },
  { name: "Field House", type: "Athletic", kwhPerHour: 310, status: "yellow", metered: true },
  { name: "Aquatic Center", type: "Athletic", kwhPerHour: 285, status: "red", metered: false },
];

const optimizedStatusMap = {
  "Chemistry Lab": "yellow",
  "Physics Lab": "yellow",
  "Bio Research Center": "green",
  "Materials Science Lab": "yellow",
  "Engineering Hall": "green",
  "Liberal Arts": "green",
  "Business School": "green",
  "Mathematics Building": "green",
  "West Residence": "green",
  "South Dormitory": "yellow",
  "Field House": "green",
  "Aquatic Center": "yellow",
};

const baselineHourly = [
  8200, 7800, 7400, 7100, 6900, 7200, 12000, 19000, 22000, 24000, 24500,
  23800, 23500, 24200, 24000, 23000, 21000, 17000, 14000, 12500, 11500,
  10500, 9800, 8800,
];

const alertsData = [
  {
    id: 1,
    text: "Chemistry Lab \u2014 Full ventilation running, occupancy: 0 people \u2014 wasting $34/hr",
    severity: "red",
    resolved: "Chemistry Lab \u2014 Ventilation scaled to unoccupied mode \u2014 saving $34/hr",
  },
  {
    id: 2,
    text: "South Dormitory \u2014 Evening spike detected, 40% above typical \u2014 investigate",
    severity: "yellow",
    resolved: "South Dormitory \u2014 Load shifted to off-peak schedule \u2014 spike mitigated",
  },
  {
    id: 3,
    text: "Bio Research Center \u2014 AHU fan power +18% vs 30-day avg \u2014 possible filter clog",
    severity: "red",
    resolved: "Bio Research Center \u2014 Fan speed optimized, maintenance ticket created",
  },
  {
    id: 4,
    text: "Aquatic Center \u2014 Peak pricing active \u2014 recommend reducing pool pump speed",
    severity: "yellow",
    resolved: "Aquatic Center \u2014 Pool pump speed reduced 30% during peak pricing",
  },
  {
    id: 5,
    text: "Engineering Hall \u2014 Setback mode active, 12% below baseline \u2014 optimal",
    severity: "green",
    resolved: null,
  },
];

const BASELINE_KWH = 575342;
const BASELINE_COST = 76521;
const OPTIMIZATION_FACTOR = 0.78;

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function formatCurrency(n) {
  return "$" + n.toLocaleString("en-US");
}

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 600 }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start + (diff * step) / steps));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {formatNumber(display)}
      {suffix}
    </span>
  );
}

function ToggleSwitch({ on, onToggle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        background: on
          ? "linear-gradient(135deg, rgba(39,174,96,0.15), rgba(26,188,156,0.15))"
          : "linear-gradient(135deg, rgba(231,76,60,0.1), rgba(218,165,32,0.1))",
        borderRadius: 16,
        border: `2px solid ${on ? COLORS.green : COLORS.red}`,
        cursor: "pointer",
        transition: "all 0.5s ease",
        userSelect: "none",
      }}
      onClick={onToggle}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: on ? COLORS.muted : COLORS.red,
          letterSpacing: 1,
          textTransform: "uppercase",
          transition: "all 0.5s ease",
        }}
      >
        OFF
      </span>
      <div
        style={{
          width: 64,
          height: 32,
          borderRadius: 16,
          background: on
            ? "linear-gradient(90deg, #27ae60, #1abc9c)"
            : "#3a3d48",
          position: "relative",
          transition: "all 0.5s ease",
          boxShadow: on
            ? "0 0 20px rgba(39,174,96,0.5), 0 0 40px rgba(39,174,96,0.2)"
            : "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: on ? "#fff" : "#888",
            position: "absolute",
            top: 3,
            left: on ? 35 : 3,
            transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
            boxShadow: on
              ? "0 2px 8px rgba(39,174,96,0.5)"
              : "0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: on ? COLORS.green : COLORS.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
          transition: "all 0.5s ease",
        }}
      >
        ON
      </span>
    </div>
  );
}

function StatCard({ label, value, prefix, suffix, color, subLabel, subValue }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 12,
        padding: "20px 24px",
        flex: 1,
        minWidth: 160,
        border: `1px solid ${COLORS.border}`,
        transition: "all 0.5s ease",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: color || COLORS.white,
          transition: "color 0.5s ease",
          lineHeight: 1.2,
        }}
      >
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      {subLabel && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.muted,
            marginTop: 6,
            transition: "all 0.5s ease",
          }}
        >
          {subLabel}{" "}
          <span style={{ color: color, fontWeight: 600, transition: "color 0.5s ease" }}>
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}

function BuildingCard({ building, optimized }) {
  const currentKwh = optimized
    ? Math.round(building.kwhPerHour * OPTIMIZATION_FACTOR)
    : building.kwhPerHour;
  const currentStatus = optimized
    ? optimizedStatusMap[building.name]
    : building.status;
  const statusColor = STATUS_COLORS[currentStatus];

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 10,
        padding: "16px 18px",
        borderLeft: `4px solid ${statusColor}`,
        border: `1px solid ${COLORS.border}`,
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
        transition: "all 0.5s ease",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow when optimized and green */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            optimized && currentStatus === "green"
              ? `radial-gradient(ellipse at top left, rgba(39,174,96,0.06), transparent 70%)`
              : "transparent",
          transition: "all 0.5s ease",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.white,
              marginBottom: 2,
            }}
          >
            {building.name}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>{building.type}</div>
        </div>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: statusColor,
            flexShrink: 0,
            marginTop: 4,
            transition: "background 0.5s ease",
            boxShadow: `0 0 8px ${statusColor}40`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: statusColor,
              transition: "color 0.5s ease",
            }}
          >
            {currentKwh}
          </span>
          <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: 4 }}>kWh/hr</span>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            background: building.metered
              ? "rgba(52,152,219,0.12)"
              : "rgba(218,165,32,0.1)",
            color: building.metered ? COLORS.blue : COLORS.gold,
            border: building.metered
              ? `1px solid ${COLORS.blue}40`
              : `1px dashed ${COLORS.gold}60`,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {building.metered ? "Smart Metered" : "Proxy Metered"}
        </div>
      </div>
      {optimized && building.status === "red" && (
        <div
          style={{
            fontSize: 10,
            color: COLORS.green,
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.5s ease",
          }}
        >
          <span style={{ fontSize: 14 }}>{"\u2193"}</span>
          {Math.round((1 - OPTIMIZATION_FACTOR) * 100)}% reduction applied
        </div>
      )}
    </div>
  );
}

function EnergyChart({ optimized }) {
  const chartData = baselineHourly.map((val, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    baseline: val,
    optimized: Math.round(val * OPTIMIZATION_FACTOR),
  }));

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${COLORS.border}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.white,
              marginBottom: 4,
            }}
          >
            24-Hour Energy Curve
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>
            Campus-wide consumption (kWh)
          </div>
        </div>
        {optimized && (
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 11,
              color: COLORS.muted,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 3,
                  background: COLORS.red,
                  borderRadius: 2,
                  opacity: 0.5,
                }}
              />
              Baseline
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 3,
                  background: COLORS.green,
                  borderRadius: 2,
                }}
              />
              Optimized
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.red} stopOpacity={optimized ? 0.15 : 0.4} />
                <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.4} />
                <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke={COLORS.muted}
              tick={{ fontSize: 10, fill: COLORS.muted }}
              tickLine={false}
              axisLine={{ stroke: COLORS.border }}
              interval={5}
            />
            <YAxis
              stroke={COLORS.muted}
              tick={{ fontSize: 10, fill: COLORS.muted }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#1e2130",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 12,
                color: COLORS.text,
              }}
              formatter={(value, name) => [
                `${formatNumber(value)} kWh`,
                name === "baseline" ? "Baseline" : "Optimized",
              ]}
              labelStyle={{ color: COLORS.muted, marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke={optimized ? `${COLORS.red}80` : COLORS.red}
              strokeWidth={optimized ? 1.5 : 2}
              fill="url(#gradBaseline)"
              animationDuration={800}
            />
            {optimized && (
              <Area
                type="monotone"
                dataKey="optimized"
                stroke={COLORS.green}
                strokeWidth={2.5}
                fill="url(#gradOptimized)"
                animationDuration={800}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AlertRow({ alert, optimized }) {
  const isResolved = optimized && alert.severity !== "green";
  const dotColor = isResolved
    ? COLORS.green
    : STATUS_COLORS[alert.severity] || COLORS.muted;
  const displayText = isResolved ? alert.resolved : alert.text;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        background: COLORS.card,
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        transition: "all 0.5s ease",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          boxShadow: `0 0 8px ${dotColor}50`,
          transition: "all 0.5s ease",
        }}
      />
      <div
        style={{
          flex: 1,
          fontSize: 13,
          color: isResolved ? COLORS.muted : COLORS.text,
          textDecoration: isResolved ? "line-through" : "none",
          transition: "all 0.5s ease",
          lineHeight: 1.5,
        }}
      >
        {displayText}
      </div>
      {isResolved && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: COLORS.green,
            background: "rgba(39,174,96,0.12)",
            padding: "4px 10px",
            borderRadius: 6,
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            transition: "all 0.5s ease",
          }}
        >
          Resolved
        </div>
      )}
      {!isResolved && alert.severity === "green" && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: COLORS.green,
            background: "rgba(39,174,96,0.12)",
            padding: "4px 10px",
            borderRadius: 6,
            letterSpacing: 1,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Optimal
        </div>
      )}
    </div>
  );
}

export default function CampusDashboard() {
  const [optimized, setOptimized] = useState(false);

  const currentKwh = optimized
    ? Math.round(BASELINE_KWH * OPTIMIZATION_FACTOR)
    : BASELINE_KWH;
  const currentCost = optimized
    ? Math.round(BASELINE_COST * OPTIMIZATION_FACTOR)
    : BASELINE_COST;
  const baselinePercent = optimized
    ? `-${Math.round((1 - OPTIMIZATION_FACTOR) * 100)}%`
    : "+0%";
  const activeAlerts = optimized ? 1 : 4;

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: 28,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: COLORS.text,
      }}
    >
      {/* ============ PANEL 1: TOP STATS BAR ============ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -0.5,
            }}
          >
            MSU Campus Energy Monitor
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
            Midwest State University &middot; GridMind Analytics Platform
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: optimized ? COLORS.green : COLORS.muted,
              transition: "color 0.5s ease",
              letterSpacing: 0.5,
            }}
          >
            GridMind Optimization
          </span>
          <ToggleSwitch on={optimized} onToggle={() => setOptimized((v) => !v)} />
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <StatCard
          label="Today's kWh"
          value={currentKwh}
          color={optimized ? COLORS.green : COLORS.text}
          subLabel="campus total"
          subValue={optimized ? "optimized" : "baseline"}
        />
        <StatCard
          label="Today's Cost"
          value={currentCost}
          prefix="$"
          color={optimized ? COLORS.green : COLORS.text}
          subLabel="est. daily"
          subValue={
            optimized
              ? `saving ${formatCurrency(BASELINE_COST - currentCost)}`
              : "at current rate"
          }
        />
        <StatCard
          label="vs Baseline"
          value={optimized ? Math.round((1 - OPTIMIZATION_FACTOR) * 100) : 0}
          prefix={optimized ? "-" : ""}
          suffix="%"
          color={optimized ? COLORS.green : COLORS.gold}
          subLabel="energy change"
          subValue={optimized ? "reducing" : "neutral"}
        />
        <StatCard
          label="Active Alerts"
          value={activeAlerts}
          color={
            activeAlerts <= 1
              ? COLORS.green
              : activeAlerts <= 2
              ? COLORS.gold
              : COLORS.red
          }
          subLabel="requiring action"
          subValue={optimized ? "1 remaining" : "4 critical"}
        />
      </div>

      {/* ============ PANELS 2 & 3: BUILDINGS + CHART ============ */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 28,
          minHeight: 520,
        }}
      >
        {/* Panel 2: Building Grid */}
        <div style={{ flex: "0 0 60%", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: COLORS.white,
                  marginBottom: 4,
                }}
              >
                Building Status
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {buildingsBase.length} monitored buildings
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                fontSize: 11,
                color: COLORS.muted,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: COLORS.green,
                  }}
                />
                Efficient
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: COLORS.gold,
                  }}
                />
                Normal
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: COLORS.red,
                  }}
                />
                Wasting
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}
          >
            {buildingsBase.map((b) => (
              <BuildingCard key={b.name} building={b} optimized={optimized} />
            ))}
          </div>
        </div>

        {/* Panel 3: 24-Hour Energy Chart */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EnergyChart optimized={optimized} />
        </div>
      </div>

      {/* ============ PANEL 4: ALERT FEED ============ */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.white,
                marginBottom: 4,
              }}
            >
              Alert Feed
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>
              {optimized
                ? "4 alerts auto-resolved by GridMind"
                : "5 active alerts across campus"}
            </div>
          </div>
          {optimized && (
            <div
              style={{
                fontSize: 12,
                color: COLORS.green,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.green,
                  animation: "pulse 2s infinite",
                }}
              />
              GridMind Active
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alertsData.map((alert) => (
            <AlertRow key={alert.id} alert={alert} optimized={optimized} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 36,
          paddingTop: 20,
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 11,
          color: COLORS.muted,
        }}
      >
        GridMind Energy Analytics &middot; Midwest State University &middot; Real-time
        campus monitoring &middot; Data refreshes every 15 seconds
      </div>
    </div>
  );
}
