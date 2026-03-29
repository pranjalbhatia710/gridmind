import { Composition } from "remotion";
import { GridMindPresentation } from "./Presentation";
import { TestScene } from "./scenes/TestScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Test"
        component={TestScene}
        fps={30}
        durationInFrames={150}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="GridMindPresentation"
        component={GridMindPresentation}
        fps={30}
        durationInFrames={3000}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
