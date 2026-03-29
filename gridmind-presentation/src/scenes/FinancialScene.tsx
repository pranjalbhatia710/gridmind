import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars, RoundedBox } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const YEARS = [
  { year: 1, spend: 2.8, save: 1.8, net: "-$1.0M", delay: 0 },
  { year: 2, spend: 0.4, save: 2.5, net: "+$2.1M", delay: 45 },
  { year: 3, spend: 0.2, save: 3.2, net: "+$5.1M", delay: 90 },
  { year: 4, spend: 0.1, save: 3.5, net: "+$8.5M", delay: 135 },
  { year: 5, spend: 0.1, save: 3.8, net: "+$15.0M", delay: 180 },
];
const MAX_COST = 3.0;
const SPACING = 2.2;

const Step: React.FC<{ data: typeof YEARS[0]; index: number; frame: number; fps: number }> = ({ data, index, frame, fps }) => {
  const s = spring({ frame: Math.max(0, frame - data.delay), fps, config: { damping: 12, stiffness: 50, mass: 1 } });
  const x = (index - 2) * SPACING;
  const redH = (data.spend / MAX_COST) * s;
  const greenH = (data.save / MAX_COST) * s;
  const isBreakeven = index === 1 && frame >= 150;
  const flash = index === 1 && frame >= 150 && frame < 180 ? Math.sin((frame - 150) * 0.3) * 0.5 + 0.5 : 0;
  const gCol = isBreakeven ? COLORS_THREE.gold : COLORS_THREE.green;

  return (
    <group position={[x, index * 0.4 * s, 0]}>
      <RoundedBox args={[1.4, Math.max(0.01, redH), 1]} radius={0.05} position={[0, redH / 2, 0]}>
        <meshStandardMaterial color={COLORS_THREE.red} emissive={COLORS_THREE.red} emissiveIntensity={0.4} transparent opacity={0.85 * s} />
      </RoundedBox>
      <RoundedBox args={[1.4, Math.max(0.01, greenH), 1]} radius={0.05} position={[0, redH + greenH / 2, 0]}>
        <meshStandardMaterial color={gCol} emissive={gCol} emissiveIntensity={isBreakeven ? 0.8 + flash : 0.4} transparent opacity={0.9 * s} />
      </RoundedBox>
    </group>
  );
};

const GoldParticle: React.FC<{ pos: [number, number, number]; frame: number; offset: number }> = ({ pos, frame, offset }) => {
  const t = ((frame + offset) * 0.03) % 3;
  const op = interpolate(t, [0, 0.5, 2.5, 3], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <mesh position={[pos[0], pos[1] + t, pos[2]]}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshStandardMaterial color={COLORS_THREE.gold} emissive={COLORS_THREE.gold} emissiveIntensity={3} transparent opacity={op} />
    </mesh>
  );
};

const goldParticles = Array.from({ length: 20 }, (_, i) => ({
  pos: [Math.sin(i * 2.1) * 5, ((i * 0.4) % 4) - 2, Math.cos(i * 1.7) * 3 - 2] as [number, number, number],
  offset: i * 17,
}));

export const FinancialScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camY = interpolate(frame, [0, 299], [0.5, 3.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [0, 299], [7, 5.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsOp = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bottomOp = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, camY, camZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 8, 5]} intensity={2.5} color={COLORS_THREE.gold} />
        <pointLight position={[-4, 3, 4]} intensity={1.5} color={COLORS_THREE.green} />
        <Stars radius={50} depth={40} count={1000} factor={2} fade speed={0.2} />
        {YEARS.map((y, i) => <Step key={i} data={y} index={i} frame={frame} fps={fps} />)}
        {goldParticles.map((p, i) => <GoldParticle key={i} pos={p.pos} frame={frame} offset={p.offset} />)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[14, 10, 14, 10]} />
          <meshStandardMaterial color={COLORS_THREE.surface} wireframe transparent opacity={0.15} />
        </mesh>
      </ThreeCanvas>

      {/* Year labels */}
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 80, fontFamily: "Inter, system-ui, sans-serif" }}>
        {YEARS.map((y, i) => {
          const s = spring({ frame: Math.max(0, frame - y.delay - 10), fps, config: { damping: 12, stiffness: 50 } });
          const isPositive = y.net.startsWith("+");
          return (
            <div key={i} style={{ textAlign: "center", opacity: s }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: i === 1 && frame >= 150 ? COLORS.gold : COLORS.text }}>Y{y.year}</div>
              <div style={{ fontSize: 15, color: isPositive ? COLORS.green : COLORS.red, marginTop: 4, fontWeight: 700 }}>{y.net}</div>
              {i === 1 && frame >= 150 && <div style={{ fontSize: 11, color: COLORS.gold, marginTop: 2 }}>BREAKEVEN</div>}
            </div>
          );
        })}
      </div>

      {/* Stat cards */}
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24, opacity: statsOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        {[{ label: "Payback", value: "22mo", color: COLORS.gold }, { label: "IRR", value: "45-55%", color: COLORS.green }, { label: "Net Savings", value: "$15M", color: COLORS.green }, { label: "NPV", value: "$38M", color: COLORS.teal }].map((s, i) => (
          <div key={i} style={{ background: "rgba(26,29,40,0.9)", border: `1px solid ${s.color}44`, borderRadius: 10, padding: "10px 24px", textAlign: "center" }}>
            <div style={{ color: s.color, fontSize: 26, fontWeight: 800, textShadow: `0 0 16px ${s.color}66` }}>{s.value}</div>
            <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", opacity: bottomOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <span style={{ color: COLORS.text, fontSize: 18, background: "rgba(15,17,23,0.85)", padding: "10px 28px", borderRadius: 10, border: `1px solid ${COLORS.gold}33` }}>
          Phase 1 alone: $2.8M investment &rarr; $2.5M/yr savings
        </span>
      </div>
    </AbsoluteFill>
  );
};
