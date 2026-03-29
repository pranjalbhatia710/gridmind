import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { ThreeIdeasScene } from "./scenes/ThreeIdeasScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { IoTScene } from "./scenes/IoTScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { AIEngineScene } from "./scenes/AIEngineScene";
import { EnergyScene } from "./scenes/EnergyScene";
import { FinancialScene } from "./scenes/FinancialScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { COLORS } from "./constants";

const SCENE_DURATION = 300; // 10s at 30fps

const scenes = [
  { id: "title", Component: TitleScene },
  { id: "problem", Component: ProblemScene },
  { id: "ideas", Component: ThreeIdeasScene },
  { id: "architecture", Component: ArchitectureScene },
  { id: "iot", Component: IoTScene },
  { id: "dashboard", Component: DashboardScene },
  { id: "ai-engine", Component: AIEngineScene },
  { id: "energy", Component: EnergyScene },
  { id: "financial", Component: FinancialScene },
  { id: "closing", Component: ClosingScene },
];

const SceneWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // useCurrentFrame() inside a <Sequence> already returns the local frame (0-299)
  const frame = useCurrentFrame();

  // Fade in first 15 frames, fade out last 15 frames
  const opacity = interpolate(
    frame,
    [0, 15, SCENE_DURATION - 15, SCENE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

// Progress bar at bottom
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  const currentScene = Math.min(
    Math.floor(frame / SCENE_DURATION),
    scenes.length - 1
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: COLORS.surface,
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.teal})`,
          transition: "width 0.1s",
        }}
      />
      {/* Scene dots */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 16,
          display: "flex",
          gap: 6,
        }}
      >
        {scenes.map((s, i) => (
          <div
            key={s.id}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i <= currentScene ? COLORS.gold : COLORS.border,
              opacity: i === currentScene ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const GridMindPresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={index * SCENE_DURATION}
          durationInFrames={SCENE_DURATION}
        >
          <SceneWrapper>
            <scene.Component />
          </SceneWrapper>
        </Sequence>
      ))}
      <ProgressBar />
    </AbsoluteFill>
  );
};
