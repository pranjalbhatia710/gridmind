import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const baselineHourly = [
  8200, 7800, 7400, 7100, 6900, 7200,
  12000, 19000, 22000, 24000, 24500, 23800,
  23500, 24200, 24000, 23000, 21000, 17000,
  14000, 12500, 11500, 10500, 9800, 8800,
];

const hourLabels = [
  "12am", "1am", "2am", "3am", "4am", "5am",
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm",
];

function getOccupancyFactor(hour) {
  if (hour >= 0 && hour <= 5) return 1.5;
  if (hour >= 6 && hour <= 8) return 0.5;
  if (hour >= 9 && hour <= 16) return 0.3;
  return 1.0;
}

function getPeakShiftFactor(hour) {
  if (hour >= 0 && hour <= 5) return 0.5;
  if (hour >= 10 && hour <= 16) return -1.0;
  return 0;
}

export default function EnergySimulation() {
  const [labSlider, setLabSlider] = useState(0);
  const [occupancySlider, setOccupancySlider] = useState(0);
  const [peakShiftSlider, setPeakShiftSlider] = useState(0);

  const { chartData, stats } = useMemo(() => {
    const labFraction = labSlider / 100;
    const occFraction = occupancySlider / 100;
    const peakFraction = peakShiftSlider / 100;

    const labReductionRate = labFraction * 0.467 * 0.60;

    let totalBaselineDaily = 0;
    let totalOptimizedDaily = 0;
    let peakShiftedKwh = 0;

    const data = baselineHourly.map((baseline, hour) => {
      totalBaselineDaily += baseline;

      const labReduction = baseline * labReductionRate;

      const occReduction = baseline * (occFraction * getOccupancyFactor(hour) / 100);

      const shiftFactor = getPeakShiftFactor(hour);
      const peakShiftDelta = baseline * (peakFraction * Math.abs(shiftFactor) / 100) * (shiftFactor >= 0 ? 1 : -1);

      if (shiftFactor < 0) {
        peakShiftedKwh += baseline * (peakFraction * Math.abs(shiftFactor) / 100);
      }

      let optimized = baseline - labReduction - occReduction + peakShiftDelta;
      optimized = Math.max(optimized, baseline * 0.3);

      totalOptimizedDaily += optimized;

      return {
        hour: hourLabels[hour],
        baseline: Math.round(baseline),
        optimized: Math.round(optimized),
      };
    });

    const dailyEnergySaved = totalBaselineDaily - totalOptimizedDaily;
    const annualEnergySaved = dailyEnergySaved * 365;
    const energyCostSavings = annualEnergySaved * 0.133;
    const peakShiftCostSavings = peakShiftedKwh * 365 * (0.17 - 0.106);
    const annualCostSaved = energyCostSavings + peakShiftCostSavings;
    const paybackYears = annualCostSaved > 0 ? 12000000 / annualCostSaved : Infinity;
    const energyReductionPct =
      totalBaselineDaily > 0
        ? ((totalBaselineDaily - totalOptimizedDaily) / totalBaselineDaily) * 100
        : 0;
    const emissionsTons = annualEnergySaved * 0.0004;

    return {
      chartData: data,
      stats: {
        annualSavings: annualCostSaved,
        paybackYears,
        energyReduction: energyReductionPct,
        emissionsAvoided: emissionsTons,
      },
    };
  }, [labSlider, occupancySlider, peakShiftSlider]);

  const formatMoney = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        style={{
          background: "#1a1d28",
          border: "1px solid #333648",
          borderRadius: 8,
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ color: "#daa520", fontWeight: 600, margin: "0 0 8px 0", fontSize: 13 }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, margin: "4px 0", fontSize: 12 }}>
            {entry.name}: {Number(entry.value).toLocaleString()} kWh
          </p>
        ))}
        {payload.length === 2 && (
          <p style={{ color: "#6b6f80", margin: "8px 0 0 0", fontSize: 11, borderTop: "1px solid #333648", paddingTop: 6 }}>
            Savings: {(payload[0].value - payload[1].value).toLocaleString()} kWh (
            {((1 - payload[1].value / payload[0].value) * 100).toFixed(1)}%)
          </p>
        )}
      </div>
    );
  };

  const sliderTrackStyle = (color) => ({
    WebkitAppearance: "none",
    appearance: "none",
    width: "100%",
    height: 6,
    borderRadius: 3,
    background: `linear-gradient(90deg, ${color}44 0%, ${color} 100%)`,
    outline: "none",
    cursor: "pointer",
  });

  const sliderCSS = `
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #daa520;
      cursor: pointer;
      border: 2px solid #0f1117;
      box-shadow: 0 0 8px rgba(218, 165, 32, 0.5);
      transition: transform 0.15s ease;
    }
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 14px rgba(218, 165, 32, 0.7);
    }
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #daa520;
      cursor: pointer;
      border: 2px solid #0f1117;
      box-shadow: 0 0 8px rgba(218, 165, 32, 0.5);
    }
    input[type="range"]::-moz-range-track {
      height: 6px;
      border-radius: 3px;
    }
  `;

  return (
    <div
      style={{
        background: "#0f1117",
        minHeight: "100vh",
        color: "#c8c8d0",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "32px 40px",
        boxSizing: "border-box",
      }}
    >
      <style>{sliderCSS}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            background: "linear-gradient(135deg, #daa520 0%, #f0d878 50%, #daa520 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.5px",
          }}
        >
          GridMind Energy Simulation — MSU Campus
        </h1>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: 15,
            color: "#6b6f80",
            letterSpacing: "0.5px",
          }}
        >
          210M kWh Baseline &middot; $28M Annual Cost
        </p>
      </div>

      {/* ── Chart ── */}
      <div
        style={{
          background: "#1a1d28",
          borderRadius: 16,
          padding: "28px 24px 16px 8px",
          marginBottom: 32,
          border: "1px solid #252836",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#c8c8d0",
            }}
          >
            24-Hour Campus Energy Profile
          </h2>
          <span style={{ fontSize: 12, color: "#6b6f80" }}>kWh consumed per hour</span>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e74c3c" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#e74c3c" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27ae60" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#27ae60" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252836" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#6b6f80", fontSize: 11 }}
              tickLine={{ stroke: "#333648" }}
              axisLine={{ stroke: "#333648" }}
              interval={1}
            />
            <YAxis
              tick={{ fill: "#6b6f80", fontSize: 11 }}
              tickLine={{ stroke: "#333648" }}
              axisLine={{ stroke: "#333648" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              name="Baseline (No Optimization)"
              stroke="#e74c3c"
              strokeWidth={2}
              fill="url(#gradBaseline)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: "#e74c3c", stroke: "#fff", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="optimized"
              name="With GridMind"
              stroke="#27ae60"
              strokeWidth={2.5}
              fill="url(#gradOptimized)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: "#27ae60", stroke: "#fff", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Sliders ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Lab Ventilation */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "20px 24px",
            border: "1px solid #252836",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#9b59b6",
                  marginRight: 8,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#c8c8d0" }}>
                Lab Ventilation Optimization
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#9b59b6",
                minWidth: 52,
                textAlign: "right",
              }}
            >
              {labSlider}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={labSlider}
            onChange={(e) => setLabSlider(Number(e.target.value))}
            style={sliderTrackStyle("#9b59b6")}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#6b6f80",
              marginTop: 6,
            }}
          >
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Occupancy-Based HVAC */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "20px 24px",
            border: "1px solid #252836",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3498db",
                  marginRight: 8,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#c8c8d0" }}>
                Occupancy-Based HVAC Scheduling
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#3498db",
                minWidth: 52,
                textAlign: "right",
              }}
            >
              {occupancySlider}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={occupancySlider}
            onChange={(e) => setOccupancySlider(Number(e.target.value))}
            style={sliderTrackStyle("#3498db")}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#6b6f80",
              marginTop: 6,
            }}
          >
            <span>0%</span>
            <span>25%</span>
          </div>
        </div>

        {/* Peak-to-Off-Peak Shifting */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "20px 24px",
            border: "1px solid #252836",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#1abc9c",
                  marginRight: 8,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#c8c8d0" }}>
                Peak-to-Off-Peak Shifting (Ice Storage)
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1abc9c",
                minWidth: 52,
                textAlign: "right",
              }}
            >
              {peakShiftSlider}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={peakShiftSlider}
            onChange={(e) => setPeakShiftSlider(Number(e.target.value))}
            style={sliderTrackStyle("#1abc9c")}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#6b6f80",
              marginTop: 6,
            }}
          >
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* ── Stats Panel ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        {/* Annual Savings */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "24px 20px",
            border: "1px solid #252836",
            borderTop: "3px solid #27ae60",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(39,174,96,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#6b6f80", textTransform: "uppercase", letterSpacing: "1px" }}>
            Annual Savings
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: "#27ae60",
              lineHeight: 1.1,
            }}
          >
            {stats.annualSavings > 0 ? formatMoney(stats.annualSavings) : "$0"}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#6b6f80" }}>
            vs. $28M baseline cost
          </p>
        </div>

        {/* Payback Period */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "24px 20px",
            border: "1px solid #252836",
            borderTop: "3px solid #daa520",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(218,165,32,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#6b6f80", textTransform: "uppercase", letterSpacing: "1px" }}>
            Payback Period
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: "#daa520",
              lineHeight: 1.1,
            }}
          >
            {stats.paybackYears === Infinity
              ? "--"
              : `${stats.paybackYears.toFixed(1)} years`}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#6b6f80" }}>
            Based on $12M total capital investment across all 3 phases
          </p>
        </div>

        {/* Energy Reduction */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "24px 20px",
            border: "1px solid #252836",
            borderTop: "3px solid #1abc9c",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,188,156,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#6b6f80", textTransform: "uppercase", letterSpacing: "1px" }}>
            Energy Reduction
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: "#1abc9c",
              lineHeight: 1.1,
            }}
          >
            {stats.energyReduction > 0
              ? `${stats.energyReduction.toFixed(1)}%`
              : "0%"}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#6b6f80" }}>
            of total campus consumption
          </p>
        </div>

        {/* Emissions Avoided */}
        <div
          style={{
            background: "#1a1d28",
            borderRadius: 12,
            padding: "24px 20px",
            border: "1px solid #252836",
            borderTop: "3px solid #3498db",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(52,152,219,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#6b6f80", textTransform: "uppercase", letterSpacing: "1px" }}>
            Emissions Avoided
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: "#3498db",
              lineHeight: 1.1,
            }}
          >
            {stats.emissionsAvoided > 0
              ? `${(stats.emissionsAvoided / 1000).toFixed(1)}k tons CO\u2082`
              : "0 tons CO\u2082"}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#6b6f80" }}>
            EPA avg emission factor: 0.4 kg CO&#8322;/kWh
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center",
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid #252836",
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: "#6b6f80" }}>
          GridMind Energy Simulation &middot; Midwest State University &middot; Model
          parameters based on DOE Campus Energy Benchmarks
        </p>
      </div>
    </div>
  );
}
