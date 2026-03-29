import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stars } from "@react-three/drei";
import { COLORS, COLORS_THREE } from "../constants";

const particles = Array.from({ length: 40 }, (_, i) => ({
  position: [
    Math.sin(i * 1.7) * 4,
    ((i * 0.37) % 6) - 3,
    Math.cos(i * 2.3) * 3 - 2,
  ] as [number, number, number],
  speed: 0.5 + (i % 5) * 0.3,
}));

const Particle: React.FC<{ pos: [number, number, number]; frame: number; speed: number }> = ({ pos, frame, speed }) => {
  const y = ((pos[1] + frame * speed * 0.02) % 6) - 3;
  const op = interpolate(y, [-3, -1, 2, 3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <mesh position={[pos[0], y, pos[2]]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial color={COLORS_THREE.gold} emissive={COLORS_THREE.gold} emissiveIntensity={2} transparent opacity={op} />
    </mesh>
  );
};

const TorusKnot: React.FC<{ frame: number }> = ({ frame }) => {
  const rot: [number, number, number] = [frame * 0.005, frame * 0.008, frame * 0.003];
  const op = interpolate(frame, [0, 40], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <mesh rotation={rot} position={[0, 0, -2]}>
      <torusKnotGeometry args={[1.8, 0.15, 128, 16]} />
      <meshStandardMaterial color={COLORS_THREE.gold} wireframe transparent opacity={op} emissive={COLORS_THREE.gold} emissiveIntensity={0.5} />
    </mesh>
  );
};

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 14, stiffness: 80, mass: 0.8 } });
  const titleOp = interpolate(titleS, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(titleS, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [80, 120], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsOp = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraZ = interpolate(frame, [0, 299], [8, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, cameraZ], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color={COLORS_THREE.gold} />
        <pointLight position={[-5, -3, 3]} intensity={1.5} color={COLORS_THREE.blue} />
        <Stars radius={50} depth={50} count={2000} factor={4} fade speed={0.5} />
        <TorusKnot frame={frame} />
        {particles.map((p, i) => (
          <Particle key={i} pos={p.position} frame={frame} speed={p.speed} />
        ))}
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: `translateY(calc(-50% + ${titleY}px))`, textAlign: "center", opacity: titleOp, pointerEvents: "none" }}>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 72, fontWeight: 900, color: COLORS.gold, letterSpacing: 16, textShadow: `0 0 40px rgba(218,165,32,0.6)` }}>
          GRIDMIND
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, marginTop: 50, textAlign: "center", opacity: subOp, pointerEvents: "none" }}>
        <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 22, color: COLORS.text, letterSpacing: 3 }}>
          Intelligent Campus Energy Orchestration
        </div>
      </div>

      {/* Gold line */}
      <div style={{ position: "absolute", top: "50%", left: "50%", marginTop: 90, transform: "translateX(-50%)", width: lineW, height: 2, background: COLORS.gold, opacity: subOp }} />

      {/* Bottom stats */}
      <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60, opacity: statsOp }}>
        {["$28M Annual Cost", "120 Buildings", "40% Reduction Target"].map((s, i) => (
          <div key={i} style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 20, fontWeight: 600, color: COLORS.gold, letterSpacing: 1, textShadow: "0 0 20px rgba(218,165,32,0.5)" }}>
            {s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
