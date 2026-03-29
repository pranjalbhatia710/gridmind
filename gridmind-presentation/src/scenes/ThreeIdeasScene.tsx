import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars, RoundedBox, Float } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const cards = [
  { x: -3.5, color: COLORS_THREE.blue, colorHex: COLORS.blue, label: "Proxy Metering", desc: "Use 25% metered buildings to model the other 75%", stat: "Save $800K+ in sensors" },
  { x: 0, color: COLORS_THREE.teal, colorHex: COLORS.teal, label: "Thermal Ice Storage", desc: "Make ice at night ($0.106/kWh), cool by day ($0.17/kWh)", stat: "37% less cost per kWh" },
  { x: 3.5, color: COLORS_THREE.green, colorHex: COLORS.green, label: "Self-Funding Cascade", desc: "Phase 1 savings fund Phase 2. $12M in, $27M out", stat: "IRR: 45-55%" },
];

const Card3D: React.FC<{ c: typeof cards[0]; frame: number; fps: number; delay: number }> = ({ c, frame, fps, delay }) => {
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 70 } });
  const y = interpolate(s, [0, 1], [-6, 0]);
  const rotY = interpolate(s, [0, 1], [Math.PI * 0.3, 0]);
  return (
    <group position={[c.x, y, 0]} rotation={[0, rotY, 0]}>
      <Float speed={1.5} floatIntensity={0.12}>
        <RoundedBox args={[2.8, 3.2, 0.08]} radius={0.1}>
          <meshStandardMaterial color={COLORS_THREE.surface} transparent opacity={0.9 * s} />
        </RoundedBox>
        <mesh position={[0, 1.5, 0.05]}>
          <boxGeometry args={[2.6, 0.06, 0.01]} />
          <meshBasicMaterial color={c.color} />
        </mesh>
        <RoundedBox args={[2.85, 3.25, 0.05]} radius={0.1} position={[0, 0, -0.02]}>
          <meshBasicMaterial color={c.color} wireframe transparent opacity={0.3 * s} />
        </RoundedBox>
      </Float>
    </group>
  );
};

export const ThreeIdeasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camX = interpolate(frame, [0, 299], [0.5, -0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 0.3, 7], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[-4, 4, 6]} intensity={2} color={COLORS_THREE.blue} />
        <pointLight position={[4, 4, 6]} intensity={2} color={COLORS_THREE.green} />
        <pointLight position={[0, -2, 6]} intensity={1.5} color={COLORS_THREE.gold} />
        <Stars radius={40} depth={50} count={1500} factor={3} fade speed={0.3} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
          <planeGeometry args={[20, 14, 20, 14]} />
          <meshStandardMaterial color={COLORS_THREE.surface} wireframe transparent opacity={0.15} />
        </mesh>
        {cards.map((c, i) => (
          <Card3D key={i} c={c} frame={frame} fps={fps} delay={i * 50} />
        ))}
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: 36, left: 0, right: 0, textAlign: "center", opacity: titleOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: COLORS.gold }}>Three Ideas Other Teams Won't Have</div>
      </div>

      {/* Card text overlays */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 60, pointerEvents: "none" }}>
        {cards.map((c, i) => {
          const s = spring({ frame: Math.max(0, frame - i * 50 - 15), fps, config: { damping: 14, stiffness: 70 } });
          return (
            <div key={i} style={{ width: 220, textAlign: "center", opacity: s, fontFamily: "Inter, system-ui, sans-serif" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.colorHex, marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5, marginBottom: 12 }}>{c.desc}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.gold }}>{c.stat}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
