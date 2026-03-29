import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars, Float } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const burstParticles = Array.from({ length: 30 }, (_, i) => ({
  angle: (i / 30) * Math.PI * 2,
  speed: 0.06 + (i % 3) * 0.02,
  yOff: (Math.sin(i * 1.3) - 0.5) * 2,
}));

const POINTS = [
  { text: "1. Solve the data problem first", start: 30 },
  { text: "2. Target the right buildings — 20 labs, 47% of energy", start: 90 },
  { text: "3. Self-funding: $15M net, 22mo payback, 45% IRR", start: 150 },
];

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const gmOp = interpolate(frame, [210, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gmScale = interpolate(frame, [210, 240], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tyOp = interpolate(frame, [260, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [0, 299], [6, 8.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, camZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color={COLORS_THREE.gold} />
        <pointLight position={[-4, -3, 4]} intensity={1.5} color={COLORS_THREE.blue} />
        <Stars radius={80} depth={60} count={3000} factor={5} fade speed={0.6} />

        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh rotation={[frame * 0.004, frame * 0.006, frame * 0.002]} position={[0, 0, -3]}>
            <torusKnotGeometry args={[2.5, 0.12, 128, 16]} />
            <meshStandardMaterial color={COLORS_THREE.gold} wireframe transparent opacity={0.3} emissive={COLORS_THREE.gold} emissiveIntensity={0.5} />
          </mesh>
        </Float>

        {/* Gold burst */}
        {frame >= 240 && burstParticles.map((p, i) => {
          const t = (frame - 240) * p.speed;
          const r = t * 1.5;
          const op = interpolate(t, [0, 0.5, 2, 3], [0, 1, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <mesh key={i} position={[Math.cos(p.angle) * r, p.yOff * t * 0.3, Math.sin(p.angle) * r - 3]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color={COLORS_THREE.gold} emissive={COLORS_THREE.gold} emissiveIntensity={4} transparent opacity={op} />
            </mesh>
          );
        })}
      </ThreeCanvas>

      {/* Key points */}
      <div style={{ position: "absolute", top: 120, left: 120, fontFamily: "Inter, system-ui, sans-serif" }}>
        {POINTS.map((pt, i) => {
          const s = spring({ frame: Math.max(0, frame - pt.start), fps, config: { damping: 14, stiffness: 60 } });
          const tx = interpolate(s, [0, 1], [-60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: s, transform: `translateX(${tx}px)`, fontSize: 24, color: COLORS.text, marginBottom: 36, paddingLeft: 20, borderLeft: `3px solid ${COLORS.gold}` }}>
              {pt.text}
            </div>
          );
        })}
      </div>

      {/* GRIDMIND */}
      <div style={{ position: "absolute", top: "55%", left: 0, right: 0, textAlign: "center", opacity: gmOp, transform: `scale(${gmScale})`, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: COLORS.gold, letterSpacing: 14, textShadow: `0 0 60px rgba(218,165,32,0.6)` }}>GRIDMIND</div>
      </div>

      {/* Thank You */}
      <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center", opacity: tyOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 28, color: COLORS.text, fontWeight: 300, letterSpacing: 4 }}>Thank You.</div>
      </div>
    </AbsoluteFill>
  );
};
