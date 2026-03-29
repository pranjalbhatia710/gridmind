import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { COLORS, COLORS_THREE, BUILDING_DATA } from "../constants";

const barPositions = [-2.4, -0.8, 0.8, 2.4];
const maxPct = 46.7;

const Bar: React.FC<{ index: number; pct: number; color: number; frame: number; fps: number }> = ({ index, pct, color, frame, fps }) => {
  const s = spring({ frame: Math.max(0, frame - 30 - index * 15), fps, config: { damping: 14, stiffness: 60, mass: 1 } });
  const h = (pct / maxPct) * 4 * s;
  const pulse = Math.sin(frame * 0.08 + index) * 0.15 + 0.85;
  return (
    <group position={[barPositions[index], 0, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.8, h || 0.01, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6 * pulse} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.82, (h || 0.01) + 0.02, 0.82]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const GridFloor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
    <planeGeometry args={[14, 10, 14, 10]} />
    <meshStandardMaterial color={COLORS_THREE.surface} wireframe transparent opacity={0.3} />
  </mesh>
);

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camY = interpolate(frame, [0, 60], [7, 3.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [0, 60], [3, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barColors = [COLORS_THREE.red, COLORS_THREE.blue, COLORS_THREE.teal, COLORS_THREE.purple];

  const facts = [
    { text: "75% buildings UNMETERED", frame: 90, color: COLORS.red },
    { text: "60% peak price premium", frame: 130, color: COLORS.orange },
    { text: "18% consumption growth", frame: 170, color: COLORS.purple },
  ];
  const bottomOp = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, camY, camZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 8, 5]} intensity={2.5} />
        <pointLight position={[-3, 5, -2]} intensity={1.5} color={COLORS_THREE.red} />
        <GridFloor />
        {BUILDING_DATA.map((b, i) => (
          <Bar key={i} index={i} pct={b.pct} color={barColors[i]} frame={frame} fps={fps} />
        ))}
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: 50, left: 80, opacity: interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.gold, letterSpacing: -1 }}>Where $28M Goes</div>
        <div style={{ fontSize: 18, color: COLORS.muted, marginTop: 8 }}>Annual energy spend by building type</div>
      </div>

      {/* Bar labels */}
      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60, fontFamily: "Inter, system-ui, sans-serif" }}>
        {BUILDING_DATA.map((b, i) => {
          const s = spring({ frame: Math.max(0, frame - 50 - i * 15), fps, config: { damping: 12, stiffness: 60 } });
          return (
            <div key={i} style={{ textAlign: "center", opacity: s }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: b.color }}>{b.pct}%</div>
              <div style={{ fontSize: 14, color: COLORS.text, marginTop: 4 }}>{b.type}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{b.count} buildings</div>
            </div>
          );
        })}
      </div>

      {/* Right callout facts */}
      <div style={{ position: "absolute", top: 180, right: 80, display: "flex", flexDirection: "column", gap: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
        {facts.map((f, i) => {
          const op = interpolate(frame, [f.frame, f.frame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: op, fontSize: 24, fontWeight: 700, color: COLORS.bright, padding: "12px 24px", background: `${COLORS.surface}ee`, borderLeft: `3px solid ${f.color}`, borderRadius: 8, transform: `translateX(${(1 - op) * 40}px)` }}>
              {f.text}
            </div>
          );
        })}
      </div>

      {/* Bottom gold callout */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", opacity: bottomOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "inline-block", fontSize: 24, fontWeight: 700, color: COLORS.gold, padding: "14px 36px", background: `${COLORS.surface}dd`, border: `1px solid ${COLORS.gold}44`, borderRadius: 12, textShadow: "0 0 15px rgba(218,165,32,0.4)" }}>
          20 labs = 17% of buildings, 47% of energy
        </div>
      </div>
    </AbsoluteFill>
  );
};
