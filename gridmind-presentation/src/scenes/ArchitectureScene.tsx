import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { RoundedBox } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const LAYERS = [
  { y: -2.2, color: COLORS_THREE.orange, colorHex: COLORS.orange, label: "ENGINEERING", sub: "Sensors, VAV Controllers, Steam Traps, Ice Storage", delay: 0 },
  { y: 0, color: COLORS_THREE.blue, colorHex: COLORS.blue, label: "SOFTWARE", sub: "Proxy Metering, Dashboard, AI Optimizer, Predictive Maint.", delay: 30 },
  { y: 2.2, color: COLORS_THREE.green, colorHex: COLORS.green, label: "FINANCE", sub: "ROI Optimizer, Carbon Accounting, Peak Arbitrage", delay: 60 },
];

const Platform: React.FC<{ layer: typeof LAYERS[0]; frame: number; fps: number }> = ({ layer, frame, fps }) => {
  const s = spring({ frame: Math.max(0, frame - layer.delay), fps, config: { damping: 12, stiffness: 60 } });
  return (
    <group position={[0, layer.y, 0]} scale={[s, 1, 1]}>
      <RoundedBox args={[8, 1.4, 0.15]} radius={0.08}>
        <meshStandardMaterial color={COLORS_THREE.surface} transparent opacity={0.9 * s} />
      </RoundedBox>
      <RoundedBox args={[8.1, 1.45, 0.1]} radius={0.08} position={[0, 0, -0.05]}>
        <meshBasicMaterial color={layer.color} wireframe transparent opacity={0.25 * s} />
      </RoundedBox>
      <mesh position={[-3.9, 0, 0.09]}>
        <boxGeometry args={[0.06, 1.1, 0.02]} />
        <meshBasicMaterial color={layer.color} />
      </mesh>
    </group>
  );
};

const DataParticle: React.FC<{ frame: number; x: number; speed: number; up: boolean; color: number }> = ({ frame, x, speed, up, color }) => {
  const t = ((frame * speed) % 100) / 100;
  const fromY = up ? -3 : 3.2;
  const toY = up ? 3.2 : -3;
  const y = fromY + (toY - fromY) * t;
  const op = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 0.8;
  return (
    <mesh position={[x, y, 0.5]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={op} />
    </mesh>
  );
};

export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camX = interpolate(frame, [0, 299], [0.8, -0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const streamsVisible = frame > 60;

  const streams = useMemo(() => [
    ...Array.from({ length: 6 }, (_, i) => ({ x: -2 + i * 0.8, speed: 0.5 + (i * 0.1), up: true, color: COLORS_THREE.green })),
    ...Array.from({ length: 4 }, (_, i) => ({ x: -1.5 + i * 1, speed: 0.4 + (i * 0.08), up: false, color: COLORS_THREE.gold })),
  ], []);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 0.5, 8], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color={COLORS_THREE.blue} />
        <pointLight position={[-5, -3, 5]} intensity={1.5} color={COLORS_THREE.orange} />
        {LAYERS.map((l) => <Platform key={l.label} layer={l} frame={frame} fps={fps} />)}
        {streamsVisible && streams.map((s, i) => (
          <DataParticle key={i} frame={frame - 60} x={s.x} speed={s.speed} up={s.up} color={s.color} />
        ))}
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: 30, left: 60, opacity: titleOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: COLORS.gold }}>GridMind Architecture</div>
      </div>

      {/* Layer labels */}
      {LAYERS.map((l, i) => {
        const s = spring({ frame: Math.max(0, frame - l.delay - 15), fps, config: { damping: 12, stiffness: 60 } });
        const yPct = [64, 46, 28][i];
        return (
          <div key={l.label} style={{ position: "absolute", top: `${yPct}%`, left: 0, right: 0, textAlign: "center", opacity: s, fontFamily: "Inter, system-ui, sans-serif", pointerEvents: "none" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: l.colorHex, letterSpacing: 4 }}>{l.label}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{l.sub}</div>
          </div>
        );
      })}

      {/* Flow labels */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontFamily: "Inter, system-ui, sans-serif", display: "flex", justifyContent: "center", gap: 60, opacity: interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ color: COLORS.green, fontSize: 16 }}>Data flows up</div>
        <div style={{ color: COLORS.gold, fontSize: 16 }}>Commands flow down</div>
      </div>
    </AbsoluteFill>
  );
};
