import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { COLORS, COLORS_THREE } from "../constants";

const BUILDINGS = [
  { name: "Research Lab", x: -3, z: -1, w: 1.2, h: 2.5, d: 1.2, color: COLORS_THREE.red, sensors: 5, delay: 20 },
  { name: "Academic", x: 0, z: 0, w: 1.8, h: 1.5, d: 1.4, color: COLORS_THREE.blue, sensors: 3, delay: 40 },
  { name: "Residence", x: 3, z: -0.5, w: 1.0, h: 2.0, d: 1.0, color: COLORS_THREE.teal, sensors: 3, delay: 60 },
  { name: "Athletic", x: -1.5, z: 2, w: 2.0, h: 0.8, d: 1.6, color: COLORS_THREE.purple, sensors: 2, delay: 80 },
  { name: "Old Science", x: 2, z: 2, w: 1.3, h: 1.8, d: 1.0, color: COLORS_THREE.orange, sensors: 4, delay: 100 },
];

const Sensor: React.FC<{ pos: [number, number, number]; color: number; frame: number; fps: number; delay: number }> = ({ pos, color, frame, fps, delay }) => {
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10, stiffness: 100 } });
  const pulse = 0.05 + Math.sin(frame * 0.1 + delay) * 0.02;
  return (
    <group position={pos} scale={[s, s, s]}>
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <mesh scale={[1 + pulse * 3, 1 + pulse * 3, 1 + pulse * 3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

const BuildingMesh: React.FC<{ bld: typeof BUILDINGS[0]; frame: number; fps: number }> = ({ bld, frame, fps }) => {
  const enter = spring({ frame: Math.max(0, frame - bld.delay), fps, config: { damping: 12, stiffness: 60 } });
  const h = bld.h * enter;
  const sensorPositions = useMemo(() => Array.from({ length: bld.sensors }, (_, i) => {
    const angle = (i / bld.sensors) * Math.PI * 2;
    const r = Math.max(bld.w, bld.d) * 0.7;
    return [bld.x + Math.cos(angle) * r, bld.h * 0.3 + i * 0.3, bld.z + Math.sin(angle) * r] as [number, number, number];
  }), [bld]);

  return (
    <group>
      <mesh position={[bld.x, h / 2 - 0.5, bld.z]}>
        <boxGeometry args={[bld.w, h, bld.d]} />
        <meshStandardMaterial color={0x2a2d38} transparent opacity={0.85} />
      </mesh>
      <mesh position={[bld.x, h / 2 - 0.5, bld.z]}>
        <boxGeometry args={[bld.w + 0.02, h + 0.02, bld.d + 0.02]} />
        <meshBasicMaterial color={bld.color} wireframe transparent opacity={0.3} />
      </mesh>
      {sensorPositions.map((pos, i) => (
        <Sensor key={i} pos={pos} color={bld.color} frame={frame} fps={fps} delay={bld.delay + 30 + i * 10} />
      ))}
    </group>
  );
};

const Gateway: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const s = spring({ frame: Math.max(0, frame - 130), fps, config: { damping: 12, stiffness: 70 } });
  const pulse = Math.sin(frame * 0.08) * 0.2 + 0.8;
  return (
    <group position={[0, 0, -3]} scale={[s, s, s]}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 2, 8]} />
        <meshStandardMaterial color={COLORS_THREE.gold} emissive={COLORS_THREE.gold} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={COLORS_THREE.gold} emissive={COLORS_THREE.gold} emissiveIntensity={pulse * 2} />
      </mesh>
    </group>
  );
};

export const IoTScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const camX = interpolate(frame, [0, 299], [5, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const infoOp = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bottomOp = interpolate(frame, [220, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 4, 7], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 8, 5]} intensity={2.5} />
        <pointLight position={[-3, 2, 4]} intensity={1.5} color={COLORS_THREE.blue} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[16, 12, 16, 12]} />
          <meshStandardMaterial color={COLORS_THREE.surface} wireframe transparent opacity={0.2} />
        </mesh>
        {BUILDINGS.map((b) => <BuildingMesh key={b.name} bld={b} frame={frame} fps={fps} />)}
        <Gateway frame={frame} fps={fps} />
      </ThreeCanvas>

      {/* Title */}
      <div style={{ position: "absolute", top: 30, left: 60, opacity: titleOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.gold }}>Strategic Sensor Deployment</div>
      </div>

      {/* Cost panel */}
      <div style={{ position: "absolute", top: 100, right: 50, width: 300, background: `${COLORS.surface}ee`, border: `1px solid ${COLORS.gold}44`, borderRadius: 12, padding: "20px 24px", opacity: infoOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.gold, marginBottom: 8 }}>$350K</div>
        <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 4 }}>Total IoT Hardware Cost</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>2.9% of $12M budget</div>
        <div style={{ fontSize: 13, color: COLORS.teal, borderTop: `1px solid ${COLORS.muted}33`, paddingTop: 12 }}>Software solution with targeted hardware</div>
      </div>

      {/* Bottom */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", opacity: bottomOp, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 16, color: COLORS.gold }}>One failed steam trap = $5-15K/year wasted. We monitor all of them.</div>
      </div>
    </AbsoluteFill>
  );
};
