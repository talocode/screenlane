import React from "react";
import { Composition, registerRoot } from "remotion";
import { ScreenLaneDemo } from "./video";

// ~48s at 6fps (memory-safe render in constrained CI hosts)
const FPS = 6;
const DURATION_SEC = 48;

export const RemotionRoot = () => {
  return (
    <Composition
      id="ScreenLaneDemo"
      component={ScreenLaneDemo}
      durationInFrames={DURATION_SEC * FPS}
      fps={FPS}
      width={1280}
      height={720}
    />
  );
};

registerRoot(RemotionRoot);
