import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars } from "@react-three/drei";
import { COLORS, COLORS_THREE, BASELINE_HOURLY } from "../constants";

const MAX_VAL = Math.max(...BASELINE_HOURLY);
const RADIUS = 3;

const EnergyBar: React.FC<{ index: number; value: number; frame: number; fps: number }> = ({ index, value, frame, fps }) => {
  const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * RADIUS;
  const z = Math.sin(angle) * RADIUS;
  const ratio = value / MAX_VAL;
  const baseH = ratio * 3.5;

  const growS = spring({ frame: Math.max(0, frame - index * 2), fps, config: { damping: 14, stiffness: 60, mass: 0.8 } });
  const shrinkP = interpolate(frame, [150, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const targetH = baseH * 0.78;
  const h = frame < 150 ? baseH * growS : baseH * growS + (targetH - baseH * growS) * shrinkP;

  const colorT = interpolate(frame, [150, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r = interpolate(colorT, [0, 1], [0xe7, 0x27]);
  const g = interpolate(colorT, [0, 1], [0x4c, 0xae]);
  const b = interpolate(colorT, [0, 1], [0x3c, 0x60]);
  const color = (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);

  return (
    <group position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.3, Math.max(0.01, h), 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={frame >= 150 ? 0.6 : 0.3} />
      </mesh>
    </group>
  );
};

export const EnergyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camAngle = interpolate(frame, [0, 299], [0, Math.PI * 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camX = Math.sin(camAngle) * 6;
  const camZ = Math.cos(camAngle) * 6;

  const shrinkT = interpolate(frame, [150, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kwhVal = Math.round(interpolate(shrinkT, [0, 1], [210, 131]));
  const costVal = interpolate(shrinkT, [0, 1], [28.0, 20.7]).toFixed(1);

  const centerOp = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsOp = interpolate(frame, [250, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 4.5, camZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[0, 8, 0]} intensity={2.5} color={COLORS_THREE.gold} />
        <pointLight position={[5, 2, 5]} intensity={1.5} color={COLORS_THREE.teal} />
        <Stars radius={50} depth={40} count={1500} factor={3} fade speed={0.3} />
        {BASELINE_HOURLY.map((val, i) => (
          <EnergyBar key={i} index={i} value={val} frame={frame} fps={fps} />
        ))}
        {/* Green glow when optimized */}
        {frame >= 220 && (
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[1.2, 24, 24]} />
            <meshStandardMaterial color={COLORS_THREE.green} emissive={COLORS_THREE.green} emissiveIntensity={interpolate(frame, [220, 260], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} transparent opacity={0.12} />
          </mesh>
        )}
      </ThreeCanvas>

      {/* Center counter */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", opacity: centerOp, fontFamily: "Inter, system-ui, sans-serif", pointerEvents: "none" }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: shrinkT > 0.5 ? COLORS.green : COLORS.bright }}>{kwhVal}M kWh/yr</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: shrinkT > 0.5 ? COLORS.green : COLORS.gold, marginTop: 8 }}>${costVal}M</div>
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", opacity: statsOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "inline-flex", gap: 40, background: "rgba(15,17,23,0.85)", padding: "14px 36px", borderRadius: 12, border: `1px solid ${COLORS.green}44` }}>
          {["37.6% Reduction", "$7.3M Saved/yr", "Peak Shaved 40%"].map((s, i) => (
            <span key={i} style={{ color: COLORS.green, fontSize: 18, fontWeight: 700, textShadow: `0 0 12px ${COLORS.green}66` }}>{s}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
