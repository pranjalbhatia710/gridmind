import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars, MeshDistortMaterial } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const NODES = [
  { name: "Chem Lab", angle: 0, event: 60, color: COLORS_THREE.red, afterColor: COLORS_THREE.green, msg: "Ventilation: 10 -> 2 ACH" },
  { name: "Lecture Hall", angle: (2 * Math.PI) / 5, event: 180, color: COLORS_THREE.blue, afterColor: COLORS_THREE.blue, msg: "Pre-conditioning 8AM" },
  { name: "Athletic", angle: (4 * Math.PI) / 5, event: 120, color: COLORS_THREE.blue, afterColor: COLORS_THREE.teal, msg: "Ice Storage: CHARGING" },
  { name: "Residence", angle: (6 * Math.PI) / 5, event: -1, color: COLORS_THREE.teal, afterColor: COLORS_THREE.teal, msg: "" },
  { name: "Old Science", angle: (8 * Math.PI) / 5, event: -1, color: COLORS_THREE.purple, afterColor: COLORS_THREE.purple, msg: "" },
];

const ORBIT_R = 2.8;

const OrbitNode: React.FC<{ node: typeof NODES[0]; frame: number; orbitAngle: number }> = ({ node, frame, orbitAngle }) => {
  const a = node.angle + orbitAngle;
  const x = Math.cos(a) * ORBIT_R;
  const z = Math.sin(a) * ORBIT_R;
  const isActive = node.event > 0 && frame >= node.event && frame < node.event + 40;
  const isDone = node.event > 0 && frame >= node.event + 40;
  const pulse = isActive ? Math.sin((frame - node.event) * 0.4) * 0.3 + 1.0 : 1;
  const col = isDone ? node.afterColor : node.color;
  return (
    <mesh position={[x, 0, z]} scale={[pulse * 0.35, pulse * 0.35, pulse * 0.35]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={isActive ? 2 : 0.6} transparent opacity={0.9} />
    </mesh>
  );
};

const PulseSphere: React.FC<{ from: [number, number, number]; to: [number, number, number]; progress: number; color: number }> = ({ from, to, progress, color }) => {
  const p = Math.max(0, Math.min(1, progress));
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const z = from[2] + (to[2] - from[2]) * p;
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent opacity={0.9} />
    </mesh>
  );
};

export const AIEngineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const orbitAngle = frame * 0.006;
  const camAngle = frame * 0.008;
  const camX = Math.sin(camAngle) * 5.5;
  const camZ = Math.cos(camAngle) * 5.5;

  const distort = useMemo(() => {
    for (const n of NODES) { if (n.event > 0 && frame >= n.event && frame < n.event + 30) return 0.6; }
    return 0.3;
  }, [frame]);

  const brainScale = spring({ frame, fps, config: { damping: 14, stiffness: 60, mass: 1 } });

  let eventMsg = "";
  for (const n of NODES) { if (n.event > 0 && frame >= n.event && frame < n.event + 60) eventMsg = n.msg; }

  const bottomOp = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nodeLabels = [COLORS.red, COLORS.blue, COLORS.blue, COLORS.teal, COLORS.purple];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 2.5, camZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[4, 6, 4]} intensity={2.5} color={COLORS_THREE.gold} />
        <pointLight position={[-3, -2, 5]} intensity={1.5} color={COLORS_THREE.blue} />
        <Stars radius={60} depth={50} count={2500} factor={4} fade speed={0.4} />

        {/* Brain */}
        <group scale={[brainScale * 0.7, brainScale * 0.7, brainScale * 0.7]}>
          <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.8} distort={distort} speed={3} roughness={0.2} />
          </mesh>
        </group>

        {/* Connection lines (simple mesh approach) */}
        {NODES.map((node, i) => {
          const a = node.angle + orbitAngle;
          const nx = Math.cos(a) * ORBIT_R;
          const nz = Math.sin(a) * ORBIT_R;
          const showPulse = node.event > 0 && frame >= node.event && frame < node.event + 40;
          const pulseProgress = showPulse ? (frame - node.event) / 40 : 0;
          return (
            <React.Fragment key={i}>
              <OrbitNode node={node} frame={frame} orbitAngle={orbitAngle} />
              {showPulse && <PulseSphere from={[0, 0, 0]} to={[nx, 0, nz]} progress={pulseProgress} color={node.afterColor} />}
            </React.Fragment>
          );
        })}
      </ThreeCanvas>

      {/* Event message */}
      {eventMsg && (
        <div style={{ position: "absolute", top: "16%", left: 0, right: 0, textAlign: "center" }}>
          <span style={{ color: COLORS.green, fontSize: 24, fontWeight: 700, fontFamily: "Inter, system-ui, sans-serif", background: "rgba(15,17,23,0.8)", padding: "10px 28px", borderRadius: 12, border: `1px solid ${COLORS.green}44` }}>
            {eventMsg}
          </span>
        </div>
      )}

      {/* Node labels */}
      <div style={{ position: "absolute", top: 100, right: 60, fontFamily: "Inter, system-ui, sans-serif" }}>
        {NODES.map((n, i) => {
          const s = spring({ frame: Math.max(0, frame - 20 - i * 8), fps, config: { damping: 12, stiffness: 60 } });
          return (
            <div key={i} style={{ opacity: s, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: nodeLabels[i] }} />
              <span style={{ fontSize: 14, color: COLORS.text }}>{n.name}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", opacity: bottomOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "inline-flex", gap: 30, background: "rgba(15,17,23,0.85)", padding: "12px 32px", borderRadius: 12, border: `1px solid ${COLORS.muted}33` }}>
          {["Lab ventilation: 40-60% savings", "Cross-building balancing", "Predictive maintenance"].map((t, i) => (
            <span key={i} style={{ color: COLORS.text, fontSize: 15, fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
