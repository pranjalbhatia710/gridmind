import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

export const TestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height}>
        <ambientLight intensity={2} />
        <pointLight position={[5, 5, 5]} intensity={3} />
        <mesh position={[0, 0, 0]} rotation={[frame * 0.02, frame * 0.03, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </ThreeCanvas>
      <div style={{ position: "absolute", top: 20, left: 20, color: "white", fontSize: 24 }}>
        Frame: {frame} - If you see an orange box, ThreeCanvas works
      </div>
    </AbsoluteFill>
  );
};
