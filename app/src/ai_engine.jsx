import { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// DATA: time-keyed scenarios for each building
// Hours are 0-23; the simulation loops 19 (7 PM) -> 11 (11 AM next day)
// ---------------------------------------------------------------------------

const HOUR_SEQUENCE = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function hourLabel(h) {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
}

// Helper: given current hour index, return the scenario object for a building
function resolve(scenarios, hourIdx) {
  const hour = HOUR_SEQUENCE[hourIdx % HOUR_SEQUENCE.length];
  // find the latest scenario whose startHour <= hour (in sequence order)
  let best = scenarios[0];
  for (const s of scenarios) {
    if (s.hours.includes(hour)) {
      best = s;
      break;
    }
  }
  return best;
}

// Building 1 -- Chemistry Lab
const chemLab = {
  name: "Chemistry Lab",
  type: "Research Lab",
  icon: "\u2697\uFE0F",
  color: "#9b59b6",
  maxOccupancy: 30,
  scenarios: [
    { hours: [19], occupancy: 23, hvac: "FULL COOLING", hvacColor: "#e74c3c", ventilation: "10 ACH", energy: 612, savings: 0, action: "Maintaining \u2014 occupied with active research" },
    { hours: [20], occupancy: 12, hvac: "MODERATE", hvacColor: "#f39c12", ventilation: "8 ACH", energy: 520, savings: 6, action: "Reducing ventilation \u2014 occupancy dropped 48%" },
    { hours: [21], occupancy: 3, hvac: "LOW", hvacColor: "#f39c12", ventilation: "6 ACH", energy: 410, savings: 12, action: "Low-occupancy mode \u2014 3 researchers remaining" },
    { hours: [22], occupancy: 1, hvac: "MINIMAL", hvacColor: "#27ae60", ventilation: "4 ACH", energy: 350, savings: 18, action: "Near-vacant \u2014 single researcher in fume hood bay" },
    { hours: [23, 0, 1, 2, 3, 4, 5], occupancy: 0, hvac: "SETBACK", hvacColor: "#27ae60", ventilation: "2 ACH", energy: 280, savings: 34, action: "Setback mode \u2014 minimum ventilation for chemical safety" },
    { hours: [6], occupancy: 0, hvac: "PRE-CONDITION", hvacColor: "#3498db", ventilation: "6 ACH", energy: 450, savings: 0, action: "Pre-cooling for 8AM researchers \u2014 ramp-up initiated" },
    { hours: [7], occupancy: 0, hvac: "PRE-CONDITION", hvacColor: "#3498db", ventilation: "8 ACH", energy: 500, savings: 0, action: "Pre-conditioning continues \u2014 target 72\u00B0F by 8AM" },
    { hours: [8, 9, 10, 11], occupancy: 23, hvac: "FULL COOLING", hvacColor: "#e74c3c", ventilation: "10 ACH", energy: 612, savings: 0, action: "Full operation \u2014 researchers arrived, ventilation at max" },
  ],
};

// Building 2 -- Lecture Hall A
const lectureHall = {
  name: "Lecture Hall A",
  type: "Academic",
  icon: "\uD83C\uDFDB\uFE0F",
  color: "#3498db",
  maxOccupancy: 300,
  scenarios: [
    { hours: [19], occupancy: 0, hvac: "SETBACK", hvacColor: "#27ae60", ventilation: null, energy: 85, savings: 8, action: "Setback mode \u2014 next occupancy: 8:00 AM (Intro Chemistry, 280 students)" },
    { hours: [20, 21, 22, 23, 0, 1, 2, 3, 4, 5], occupancy: 0, hvac: "DEEP SETBACK", hvacColor: "#27ae60", ventilation: null, energy: 60, savings: 12, action: "Deep setback \u2014 temp band widened to 62-80\u00B0F" },
    { hours: [6], occupancy: 0, hvac: "PRE-CONDITION", hvacColor: "#3498db", ventilation: null, energy: 140, savings: 0, action: "Pre-conditioning for 8AM class (280 students)" },
    { hours: [7], occupancy: 0, hvac: "PRE-CONDITION", hvacColor: "#3498db", ventilation: null, energy: 160, savings: 0, action: "Pre-conditioning \u2014 cooling 12,000 sq ft to 72\u00B0F" },
    { hours: [8, 9, 10, 11], occupancy: 280, hvac: "STANDARD", hvacColor: "#f39c12", ventilation: null, energy: 180, savings: 0, action: "Class in session \u2014 occupancy-adjusted HVAC" },
  ],
};

// Building 3 -- Athletic Center
const athletic = {
  name: "Athletic Center",
  type: "Athletic",
  icon: "\uD83C\uDFCB\uFE0F",
  color: "#1abc9c",
  maxOccupancy: 250,
  scenarios: [
    { hours: [19], occupancy: 180, hvac: "FULL COOLING", hvacColor: "#e74c3c", ventilation: null, energy: 310, savings: 0, action: "Evening activities \u2014 high occupancy across courts" },
    { hours: [20], occupancy: 180, hvac: "FULL COOLING", hvacColor: "#e74c3c", ventilation: null, energy: 310, savings: 0, action: "Peak evening usage \u2014 all courts active" },
    { hours: [21], occupancy: 50, hvac: "MODERATE", hvacColor: "#f39c12", ventilation: null, energy: 250, savings: 5, action: "Closing procedures \u2014 reduced to essential zones" },
    { hours: [22, 23, 0, 1, 2, 3, 4, 5], occupancy: 0, hvac: "ICE CHARGING", hvacColor: "#3498db", ventilation: null, energy: 380, savings: 15, action: "Ice Storage: CHARGING \u2014 building ice for tomorrow\u2019s cooling" },
    { hours: [6, 7, 8, 9], occupancy: 60, hvac: "STANDARD", hvacColor: "#f39c12", ventilation: null, energy: 260, savings: 0, action: "Morning operations \u2014 early fitness classes" },
    { hours: [10, 11], occupancy: 120, hvac: "ICE DISCHARGE", hvacColor: "#1abc9c", ventilation: null, energy: 200, savings: 28, action: "Ice Storage: DISCHARGING \u2014 offsetting 450 kWh/hr of chiller load" },
  ],
};

// Building 4 -- West Residence
const residence = {
  name: "West Residence",
  type: "Residence Hall",
  icon: "\uD83C\uDFE0",
  color: "#daa520",
  maxOccupancy: 400,
  scenarios: [
    { hours: [19, 20, 21, 22, 23], occupancy: 240, hvac: "PARTIAL SETBACK", hvacColor: "#f39c12", ventilation: null, energy: 165, savings: 7, action: "Floors 3-5: occupied. Floors 6-8: setback mode (62\u00B0F)" },
    { hours: [0, 1, 2, 3, 4, 5, 6, 7], occupancy: 160, hvac: "DEEP SETBACK", hvacColor: "#27ae60", ventilation: null, energy: 130, savings: 12, action: "Late night \u2014 deeper setback on vacant floors" },
    { hours: [8, 9, 10, 11], occupancy: 200, hvac: "PARTIAL SETBACK", hvacColor: "#f39c12", ventilation: null, energy: 150, savings: 9, action: "Morning \u2014 partial occupancy, selective conditioning" },
  ],
};

// Building 5 -- Old Science Hall (maintenance alert)
const oldScience = {
  name: "Old Science Hall",
  type: "Academic \u2014 Maintenance Alert",
  icon: "\u26A0\uFE0F",
  color: "#e74c3c",
  maxOccupancy: 150,
  scenarios: [
    {
      hours: [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      occupancy: 45,
      hvac: "DEGRADED",
      hvacColor: "#e74c3c",
      ventilation: null,
      energy: 195,
      savings: 0,
      action: "Maintenance alert dispatched \u2014 work order #4521",
      alert: true,
      alertLines: [
        "AHU-3 filter differential pressure: +22% vs baseline",
        "Predicted: filter replacement needed within 14 days",
        "Current waste: $8/hr in excess fan energy",
      ],
    },
  ],
};

const ALL_BUILDINGS = [chemLab, lectureHall, athletic, residence, oldScience];

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function AIOptimizationEngine() {
  const [hourIdx, setHourIdx] = useState(0);
  const [cumulativeSavings, setCumulativeSavings] = useState(0);
  const [pulse, setPulse] = useState(false);
  const prevHourIdx = useRef(0);

  // Advance clock every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHourIdx((prev) => {
        const next = (prev + 1) % HOUR_SEQUENCE.length;
        // If wrapping, reset cumulative
        if (next === 0) setCumulativeSavings(0);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Accumulate savings each tick
  useEffect(() => {
    if (hourIdx !== 0 || prevHourIdx.current !== HOUR_SEQUENCE.length - 1) {
      // don't accumulate on wrap-around reset
      if (hourIdx === 0 && prevHourIdx.current === 0) {
        // initial mount, skip
      } else if (hourIdx === 0) {
        // just wrapped, cumulative was reset
      } else {
        const totalSavings = ALL_BUILDINGS.reduce((sum, b) => {
          const scenario = resolve(b.scenarios, hourIdx);
          return sum + scenario.savings;
        }, 0);
        setCumulativeSavings((prev) => prev + totalSavings);
      }
    }
    prevHourIdx.current = hourIdx;
  }, [hourIdx]);

  // Pulse effect on hour change
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(t);
  }, [hourIdx]);

  const currentHour = HOUR_SEQUENCE[hourIdx % HOUR_SEQUENCE.length];

  // Projected annual savings
  const currentHourlySavings = ALL_BUILDINGS.reduce((sum, b) => {
    const scenario = resolve(b.scenarios, hourIdx);
    return sum + scenario.savings;
  }, 0);
  const projectedAnnual = (currentHourlySavings * 8760) / 1000; // thousands -> adjust to millions-ish

  // Styles
  const styles = {
    container: {
      background: "#0f1117",
      minHeight: "100vh",
      color: "#c8c8d0",
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
      padding: "24px",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: "8px",
    },
    title: {
      fontSize: "28px",
      fontWeight: 700,
      background: "linear-gradient(135deg, #daa520, #f5d77a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
      letterSpacing: "1px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b6f80",
      marginTop: "4px",
    },
    clock: {
      textAlign: "center",
      margin: "16px 0 24px",
    },
    clockTime: {
      fontSize: "48px",
      fontWeight: 700,
      color: "#daa520",
      textShadow: "0 0 20px rgba(218,165,32,0.4)",
      transition: "all 0.3s ease",
    },
    clockLabel: {
      fontSize: "12px",
      color: "#6b6f80",
      marginTop: "4px",
      letterSpacing: "2px",
      textTransform: "uppercase",
    },
    grid: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: "32px",
    },
    card: (color, isOptimized, isPulsing) => ({
      background: "#1a1d28",
      border: `1px solid ${isOptimized ? color : "#2a2d38"}`,
      borderRadius: "12px",
      padding: "20px",
      width: "240px",
      minWidth: "220px",
      flex: "1 1 220px",
      maxWidth: "280px",
      boxShadow: isOptimized
        ? `0 0 ${isPulsing ? "25px" : "15px"} ${color}44, inset 0 1px 0 ${color}22`
        : "0 2px 8px rgba(0,0,0,0.3)",
      transition: "all 0.6s ease",
      position: "relative",
      overflow: "hidden",
    }),
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    },
    cardName: {
      fontSize: "16px",
      fontWeight: 700,
      color: "#e8e8f0",
      margin: 0,
    },
    cardType: {
      fontSize: "11px",
      color: "#6b6f80",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    divider: {
      height: "1px",
      background: "linear-gradient(90deg, transparent, #2a2d38, transparent)",
      margin: "10px 0",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "6px 0",
      fontSize: "12px",
    },
    label: {
      color: "#6b6f80",
      fontSize: "11px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    value: {
      color: "#c8c8d0",
      fontWeight: 600,
      fontSize: "13px",
      transition: "all 0.5s ease",
    },
    badge: (bgColor) => ({
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 700,
      color: "#fff",
      background: bgColor,
      letterSpacing: "0.5px",
    }),
    occupancyBarOuter: {
      width: "100%",
      height: "8px",
      background: "#2a2d38",
      borderRadius: "4px",
      overflow: "hidden",
      marginTop: "4px",
    },
    occupancyBarInner: (pct, color) => ({
      height: "100%",
      width: `${pct}%`,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
      borderRadius: "4px",
      transition: "width 0.8s ease",
    }),
    actionBox: {
      background: "#12141d",
      border: "1px solid #2a2d38",
      borderRadius: "6px",
      padding: "8px 10px",
      marginTop: "10px",
      fontSize: "11px",
      lineHeight: "1.5",
      color: "#a0a4b8",
      fontStyle: "italic",
    },
    savingsTag: (hasSavings) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: 700,
      color: hasSavings ? "#27ae60" : "#6b6f80",
      background: hasSavings ? "#27ae6018" : "transparent",
    }),
    alertBox: {
      background: "#e74c3c12",
      border: "1px solid #e74c3c44",
      borderRadius: "6px",
      padding: "8px 10px",
      marginTop: "8px",
      fontSize: "10px",
      lineHeight: "1.6",
      color: "#e74c3c",
    },
    bottomSection: {
      textAlign: "center",
      padding: "20px 0",
      borderTop: "1px solid #2a2d38",
      marginTop: "16px",
    },
    cumulativeValue: {
      fontSize: "36px",
      fontWeight: 700,
      color: "#27ae60",
      textShadow: "0 0 20px rgba(39,174,96,0.3)",
    },
    projectedValue: {
      fontSize: "18px",
      color: "#1abc9c",
      marginTop: "4px",
    },
    flowchartContainer: {
      background: "#1a1d28",
      border: "1px solid #2a2d38",
      borderRadius: "12px",
      padding: "24px",
      marginTop: "24px",
      maxWidth: "900px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    flowchartTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#daa520",
      marginBottom: "16px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER --- */}
      <div style={styles.header}>
        <h1 style={styles.title}>GridMind AI Decision Engine</h1>
        <div style={styles.subtitle}>
          Live Campus Optimization &mdash; Midwest State University
        </div>
      </div>

      {/* --- CLOCK --- */}
      <div style={styles.clock}>
        <div style={styles.clockTime}>{hourLabel(currentHour)}</div>
        <div style={styles.clockLabel}>Simulated Campus Time</div>
      </div>

      {/* --- BUILDING CARDS --- */}
      <div style={styles.grid}>
        {ALL_BUILDINGS.map((building, i) => {
          const scenario = resolve(building.scenarios, hourIdx);
          const isOptimized = scenario.savings > 0;
          const occPct = (scenario.occupancy / building.maxOccupancy) * 100;

          return (
            <div
              key={i}
              style={styles.card(building.color, isOptimized, pulse)}
            >
              {/* Subtle animated shimmer on pulse */}
              {pulse && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${building.color}, transparent)`,
                    animation: "none",
                    opacity: 0.7,
                  }}
                />
              )}

              <div style={styles.cardHeader}>
                <span style={{ fontSize: "20px" }}>{building.icon}</span>
                <h3 style={styles.cardName}>{building.name}</h3>
              </div>
              <div style={styles.cardType}>Type: {building.type}</div>

              <div style={styles.divider} />

              {/* Occupancy */}
              <div style={styles.row}>
                <span style={styles.label}>Occupancy</span>
                <span style={styles.value}>
                  {scenario.occupancy} people
                </span>
              </div>
              <div style={styles.occupancyBarOuter}>
                <div
                  style={styles.occupancyBarInner(
                    Math.min(occPct, 100),
                    building.color
                  )}
                />
              </div>

              {/* HVAC Mode */}
              <div style={{ ...styles.row, marginTop: "10px" }}>
                <span style={styles.label}>HVAC Mode</span>
                <span style={styles.badge(scenario.hvacColor)}>
                  {scenario.hvac}
                </span>
              </div>

              {/* Ventilation (labs only) */}
              {scenario.ventilation && (
                <div style={styles.row}>
                  <span style={styles.label}>Ventilation</span>
                  <span style={styles.value}>{scenario.ventilation}</span>
                </div>
              )}

              {/* Energy */}
              <div style={styles.row}>
                <span style={styles.label}>Energy</span>
                <span style={{ ...styles.value, color: "#3498db" }}>
                  {scenario.energy} kWh/hr
                </span>
              </div>

              <div style={styles.divider} />

              {/* AI Action */}
              <div style={styles.actionBox}>
                <span style={{ color: "#daa520", fontWeight: 700, fontStyle: "normal" }}>
                  AI Action:{" "}
                </span>
                {scenario.action}
              </div>

              {/* Maintenance Alert */}
              {scenario.alert && (
                <div style={styles.alertBox}>
                  {scenario.alertLines.map((line, li) => (
                    <div key={li}>
                      {"\u26A0"} {line}
                    </div>
                  ))}
                </div>
              )}

              {/* Savings */}
              <div style={{ marginTop: "10px", textAlign: "right" }}>
                <span style={styles.savingsTag(scenario.savings > 0)}>
                  {scenario.savings > 0 ? (
                    <>
                      {"\u25B2"} ${scenario.savings}/hr saved
                    </>
                  ) : (
                    "$0/hr"
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- RUNNING SAVINGS --- */}
      <div style={styles.bottomSection}>
        <div style={styles.label}>Cumulative Savings This Simulation</div>
        <div style={styles.cumulativeValue}>
          ${cumulativeSavings.toLocaleString()}
        </div>
        <div style={styles.projectedValue}>
          Projected annual savings at this rate:{" "}
          <strong>${projectedAnnual.toFixed(1)}K</strong>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#6b6f80",
            marginTop: "6px",
          }}
        >
          Current combined savings: ${currentHourlySavings}/hr across{" "}
          {ALL_BUILDINGS.filter(
            (b) => resolve(b.scenarios, hourIdx).savings > 0
          ).length}{" "}
          buildings
        </div>
      </div>

      {/* --- DECISION FLOWCHART --- */}
      <div style={styles.flowchartContainer}>
        <div style={styles.flowchartTitle}>
          AI Decision Flowchart
        </div>
        <FlowChart />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FLOWCHART sub-component (pure styled divs)
// ---------------------------------------------------------------------------

function FlowChart() {
  const nodeBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 700,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const question = {
    ...nodeBase,
    background: "#3498db22",
    border: "1px solid #3498db",
    color: "#3498db",
  };

  const actionGreen = {
    ...nodeBase,
    background: "#27ae6022",
    border: "1px solid #27ae60",
    color: "#27ae60",
  };

  const actionRed = {
    ...nodeBase,
    background: "#e74c3c22",
    border: "1px solid #e74c3c",
    color: "#e74c3c",
  };

  const actionYellow = {
    ...nodeBase,
    background: "#f39c1222",
    border: "1px solid #f39c12",
    color: "#f39c12",
  };

  const actionTeal = {
    ...nodeBase,
    background: "#1abc9c22",
    border: "1px solid #1abc9c",
    color: "#1abc9c",
  };

  const arrow = {
    display: "inline-flex",
    alignItems: "center",
    color: "#6b6f80",
    fontSize: "12px",
    fontWeight: 700,
    padding: "0 6px",
    fontFamily: "monospace",
  };

  const yesArrow = { ...arrow, color: "#27ae60" };
  const noArrow = { ...arrow, color: "#e74c3c" };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "12px",
  };

  const subRow = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "8px",
    paddingLeft: "40px",
  };

  const branchLine = {
    borderLeft: "2px solid #6b6f80",
    marginLeft: "24px",
    paddingLeft: "16px",
    paddingTop: "6px",
    paddingBottom: "6px",
  };

  const leafItem = {
    fontSize: "11px",
    color: "#a0a4b8",
    padding: "3px 0",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  };

  return (
    <div style={{ overflow: "auto" }}>
      {/* Row 1: IS OCCUPIED? -> YES -> IS LAB? -> YES -> VOC DETECTED? */}
      <div style={rowStyle}>
        <span style={question}>IS OCCUPIED?</span>
        <span style={yesArrow}>&mdash; YES &rarr;</span>
        <span style={question}>IS LAB?</span>
        <span style={yesArrow}>&mdash; YES &rarr;</span>
        <span style={question}>VOC DETECTED?</span>
        <span style={yesArrow}>&mdash; YES &rarr;</span>
        <span style={actionRed}>MAX VENT (12 ACH)</span>
      </div>

      {/* VOC = NO branch */}
      <div style={subRow}>
        <span style={{ color: "#6b6f80", fontSize: "11px", width: "40px", textAlign: "right" }}></span>
        <span style={{ color: "#6b6f80", fontSize: "11px", marginRight: "4px" }}></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", paddingLeft: "230px" }}>
          <span style={noArrow}>&darr; NO &rarr;</span>
          <span style={actionYellow}>MODERATE (6 ACH) &mdash; 40% savings</span>
        </span>
      </div>

      {/* IS LAB = NO branch */}
      <div style={subRow}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", paddingLeft: "100px" }}>
          <span style={noArrow}>&darr; NO &rarr;</span>
          <span style={actionTeal}>STANDARD HVAC (occupancy-adjusted)</span>
        </span>
      </div>

      {/* IS OCCUPIED = NO branch */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={noArrow}>&darr; NO</span>
          <div>
            <div style={{ marginBottom: "8px" }}>
              <span style={actionGreen}>SETBACK MODE</span>
            </div>
            <div style={branchLine}>
              <div style={leafItem}>{"\u251C"} Widen temp band (62-80{"\u00B0"}F)</div>
              <div style={leafItem}>{"\u251C"} Min ventilation (2 ACH for labs)</div>
              <div style={leafItem}>{"\u2514"} Pre-condition 30 min before next scheduled use</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
