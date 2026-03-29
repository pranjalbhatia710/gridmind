import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { RoundedBox, Stars, Float } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const BEFORE = { kwh: "575,342 kWh", cost: "$76,521", reduction: "22%", alerts: "4 Alerts" };
const AFTER = { kwh: "448,567 kWh", cost: "$59,686", reduction: "38%", alerts: "0 Alerts" };
const buildings = [
  { name: "Chemistry Lab", before: "red", after: "green" },
  { name: "Lecture Hall A", before: "green", after: "green" },
  { name: "Athletic Center", before: "yellow", after: "green" },
  { name: "West Residence", before: "green", after: "green" },
  { name: "Old Science", before: "red", after: "green" },
  { name: "Admin Building", before: "yellow", after: "green" },
];
const dotColor = (c: string) => c === "green" ? COLORS.green : c === "yellow" ? COLORS.orange : COLORS.red;

const MiniChart: React.FC<{ after: boolean }> = ({ after }) => {
  const base = [30, 35, 60, 80, 85, 75, 70, 78, 82, 65, 50, 40];
  const opt = [30, 32, 45, 55, 60, 52, 48, 54, 57, 45, 38, 32];
  const data = after ? opt : base;
  const pts = data.map((v, i) => `${(i / 11) * 280},${70 - (v / 90) * 70}`).join(" ");
  return (
    <svg width={280} height={70}>
      <polygon points={`${pts} 280,70 0,70`} fill={after ? `${COLORS.green}33` : `${COLORS.blue}33`} />
      <polyline points={pts} fill="none" stroke={after ? COLORS.green : COLORS.blue} strokeWidth={2} />
    </svg>
  );
};

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const after = frame >= 120;
  const cameraZ = interpolate(frame, [0, 299], [6, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dashOp = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const togglePulse = frame >= 110 && frame < 140 ? Math.sin((frame - 110) * 0.3) * 0.5 + 0.5 : 0;
  const glow = frame >= 120 ? interpolate(frame, [120, 150], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const stats = after ? AFTER : BEFORE;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, cameraZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[3, 4, 5]} intensity={2} color={COLORS_THREE.gold} />
        <pointLight position={[-4, -2, 3]} intensity={1.5} color={COLORS_THREE.blue} />
        <Stars radius={40} depth={30} count={800} factor={3} fade speed={0.3} />
        <Float speed={1} rotationIntensity={0.03} floatIntensity={0.15}>
          <group>
            <RoundedBox args={[5.4, 3.2, 0.12]} radius={0.08}>
              <meshStandardMaterial color={COLORS_THREE.surface} emissive={after ? COLORS_THREE.green : 0x000000} emissiveIntensity={glow} metalness={0.8} roughness={0.3} />
            </RoundedBox>
            <RoundedBox args={[5.2, 3.0, 0.01]} radius={0.06} position={[0, 0, 0.07]}>
              <meshStandardMaterial color={0x0a0c14} />
            </RoundedBox>
            <mesh position={[0, -1.9, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.6, 12]} />
              <meshStandardMaterial color={0x2a2d38} metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </Float>
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: 30, left: 0, right: 0, textAlign: "center", opacity: titleOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <span style={{ color: COLORS.gold, fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>Real-Time Campus Dashboard</span>
      </div>

      {/* Dashboard overlay */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -52%)", width: 520, opacity: dashOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
          {[{ label: "Daily Usage", val: stats.kwh }, { label: "Daily Cost", val: stats.cost }, { label: "Savings", val: stats.reduction }, { label: "Active", val: stats.alerts }].map((s, i) => (
            <div key={i} style={{ flex: 1, background: after ? "rgba(39,174,96,0.15)" : "rgba(26,29,40,0.9)", border: `1px solid ${after ? COLORS.green : COLORS.muted}44`, borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ color: after ? COLORS.green : COLORS.gold, fontSize: 18, fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
          {buildings.map((b) => (
            <div key={b.name} style={{ background: "rgba(15,17,23,0.8)", borderRadius: 6, padding: "5px 10px", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${COLORS.muted}22` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor(after ? b.after : b.before), boxShadow: `0 0 6px ${dotColor(after ? b.after : b.before)}` }} />
              <span style={{ color: COLORS.text, fontSize: 11 }}>{b.name}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(15,17,23,0.8)", borderRadius: 8, padding: "10px 16px", border: `1px solid ${COLORS.muted}22` }}>
          <div style={{ color: COLORS.muted, fontSize: 10, marginBottom: 4 }}>ENERGY CONSUMPTION (24H)</div>
          <MiniChart after={after} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <div style={{ background: after ? COLORS.green : COLORS.gold, color: COLORS.bg, fontSize: 12, fontWeight: 700, padding: "6px 24px", borderRadius: 20, letterSpacing: 1, boxShadow: `0 0 ${12 + togglePulse * 20}px ${after ? COLORS.green : COLORS.gold}`, transform: `scale(${1 + togglePulse * 0.1})` }}>
            {after ? "OPTIMIZED" : "OPTIMIZE"}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
