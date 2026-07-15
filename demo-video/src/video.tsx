import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/** Talocode dark theme (talocode-video skill) */
const C = {
  bg: "#1C1C1C",
  panel: "#0f1419",
  border: "rgba(255,255,255,0.10)",
  text: "#FFFFFF",
  muted: "#888888",
  primary: "#58C4DD",
  secondary: "#83C167",
  accent: "#FFFF00",
  error: "#FF6B6B",
  soft: "#98a7bb",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame: number, start: number, len = 12) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const SceneShell = ({
  children,
  frame,
  local = 0,
}: {
  children: React.ReactNode;
  frame: number;
  local?: number;
}) => {
  const opacity = fade(frame, local, 10);
  const y = interpolate(frame, [local, local + 14], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 20% 0%, rgba(88,196,221,0.14), transparent 35%),
          radial-gradient(circle at 85% 15%, rgba(131,193,103,0.10), transparent 30%),
          linear-gradient(180deg, #141414 0%, ${C.bg} 55%, #111 100%)`,
        color: C.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 72,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 72,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
          color: C.primary,
        }}
      >
        ScreenLane
      </div>
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 72,
          fontSize: 18,
          color: C.muted,
        }}
      >
        talocode/screenlane
      </div>
      {children}
    </AbsoluteFill>
  );
};

const Terminal = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      borderRadius: 20,
      background: "linear-gradient(180deg, #151b22 0%, #0a0e13 100%)",
      border: `1px solid ${C.border}`,
      boxShadow: "0 28px 90px rgba(0,0,0,0.5)",
      overflow: "hidden",
      marginTop: 28,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 18px",
        background: "rgba(255,255,255,0.04)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {["#ff5f56", "#ffbd2e", "#27c93f"].map((color) => (
        <div
          key={color}
          style={{ width: 12, height: 12, borderRadius: 999, background: color }}
        />
      ))}
      <div style={{ marginLeft: 12, color: C.muted, fontSize: 16 }}>{title}</div>
    </div>
    <div
      style={{
        padding: 28,
        fontFamily:
          'SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: 26,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  </div>
);

const TypeLine = ({
  text,
  frame,
  start,
  fps,
  color = C.text,
  cps = 28,
}: {
  text: string;
  frame: number;
  start: number;
  fps: number;
  color?: string;
  cps?: number;
}) => {
  const n = Math.max(
    0,
    Math.min(text.length, Math.floor(((frame - start) / fps) * cps))
  );
  return <span style={{ color }}>{text.slice(0, n)}</span>;
};

const CaptionBar = ({ text }: { text: string }) => (
  <div
    style={{
      position: "absolute",
      left: 72,
      right: 72,
      bottom: 48,
      padding: "16px 22px",
      borderRadius: 14,
      background: "rgba(0,0,0,0.55)",
      border: `1px solid ${C.border}`,
      fontSize: 28,
      fontWeight: 600,
      textAlign: "center",
      color: C.text,
    }}
  >
    {text}
  </div>
);

/** Scene 1: Hook 0–3s */
const Hook = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell frame={frame}>
      <div style={{ marginTop: 180, textAlign: "center" }}>
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          Talk to your screen.
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: C.soft }}>
          Screen-aware voice commands for AI agents
        </div>
        <div
          style={{
            marginTop: 48,
            display: "inline-block",
            padding: "12px 22px",
            borderRadius: 999,
            border: `1px solid ${C.primary}`,
            color: C.primary,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          ScreenLane · open source
        </div>
      </div>
      <CaptionBar text="Voice + screen context is the product" />
    </SceneShell>
  );
};

/** Scene 2: Pain 3–10s */
const Pain = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneShell frame={frame}>
      <div style={{ marginTop: 90 }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>The terminal is screaming.</div>
        <div style={{ marginTop: 12, fontSize: 26, color: C.soft }}>
          You know what to say. Your agent needs the context too.
        </div>
        <Terminal title="npm run dev">
          <TypeLine
            text={"TypeError: Cannot read properties of undefined (reading 'map')\n"}
            frame={frame}
            start={0}
            fps={fps}
            color={C.error}
            cps={40}
          />
          <TypeLine
            text={"  at renderList (Dashboard.tsx:42)\n  at fetchItems (api.ts:15)\n"}
            frame={frame}
            start={Math.floor(fps * 1.2)}
            fps={fps}
            color={C.soft}
            cps={36}
          />
          <div style={{ marginTop: 18, color: C.accent }}>
            <TypeLine
              text={'> "Fix this error"'}
              frame={frame}
              start={Math.floor(fps * 2.4)}
              fps={fps}
              color={C.accent}
              cps={22}
            />
          </div>
        </Terminal>
      </div>
      <CaptionBar text="text-mode voice simulation for deterministic demo" />
    </SceneShell>
  );
};

/** Scene 3: Product workflow 10–28s */
const Workflow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneShell frame={frame}>
      <div style={{ marginTop: 70 }}>
        <div style={{ fontSize: 44, fontWeight: 800 }}>One command. Agent-ready.</div>
        <div style={{ marginTop: 10, fontSize: 24, color: C.soft }}>
          Capture context → build intent → route to Codra / Tera / clipboard
        </div>
        <Terminal title="screenlane">
          <span style={{ color: C.secondary }}>$ </span>
          <TypeLine
            text={"screenlane demo\n"}
            frame={frame}
            start={0}
            fps={fps}
            color={C.text}
            cps={24}
          />
          <TypeLine
            text={"\nintent:  debug_error\ntarget:  codra\n"}
            frame={frame}
            start={Math.floor(fps * 1.5)}
            fps={fps}
            color={C.primary}
            cps={30}
          />
          <TypeLine
            text={
              "\nprompt: You are Codra… Diagnose root cause,\npropose a minimal patch, apply carefully."
            }
            frame={frame}
            start={Math.floor(fps * 3.2)}
            fps={fps}
            color={C.soft}
            cps={32}
          />
        </Terminal>
      </div>
      <CaptionBar text="Deterministic templates · works offline" />
    </SceneShell>
  );
};

/** Scene 4: Simple cloud model 28–40s */
const Cloud = () => {
  const frame = useCurrentFrame();
  const cardOpacity = fade(frame, 8, 14);
  return (
    <SceneShell frame={frame}>
      <div style={{ marginTop: 120 }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>Simple by design</div>
        <div style={{ marginTop: 14, fontSize: 28, color: C.soft }}>
          One key. One cloud base.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            opacity: cardOpacity,
          }}
        >
          <div
            style={{
              padding: 36,
              borderRadius: 20,
              background: C.panel,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ color: C.muted, fontSize: 18, marginBottom: 12 }}>KEY</div>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 32,
                color: C.primary,
                fontWeight: 700,
              }}
            >
              TALOCODE_API_KEY
            </div>
          </div>
          <div
            style={{
              padding: 36,
              borderRadius: 20,
              background: C.panel,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ color: C.muted, fontSize: 18, marginBottom: 12 }}>CLOUD API</div>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 28,
                color: C.secondary,
                fontWeight: 700,
              }}
            >
              api.talocode.site
            </div>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 24, color: C.soft }}>
          Local capture / command / demo work without a key.
        </div>
      </div>
      <CaptionBar text="Gate access with TALOCODE_API_KEY only" />
    </SceneShell>
  );
};

/** Scene 5: CTA 40–48s */
const Cta = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell frame={frame}>
      <div style={{ marginTop: 160, textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 800 }}>Ship the layer.</div>
        <div style={{ marginTop: 20, fontSize: 30, color: C.soft }}>
          ScreenLane — screen-aware voice command layer for AI agents
        </div>
        <div
          style={{
            marginTop: 48,
            display: "inline-block",
            padding: "22px 36px",
            borderRadius: 16,
            background: "#0a0e13",
            border: `1px solid ${C.primary}`,
            fontFamily: "ui-monospace, monospace",
            fontSize: 30,
            color: C.primary,
          }}
        >
          npm i -g @talocode/screenlane
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: C.secondary }}>
          npx @talocode/screenlane@latest demo
        </div>
        <div style={{ marginTop: 40, fontSize: 22, color: C.muted }}>
          github.com/talocode/screenlane · api.talocode.site
        </div>
      </div>
      <CaptionBar text="Talk to your screen." />
    </SceneShell>
  );
};

export const ScreenLaneDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={s(0)} durationInFrames={s(3)}>
        <Hook />
      </Sequence>
      <Sequence from={s(3)} durationInFrames={s(7)}>
        <Pain />
      </Sequence>
      <Sequence from={s(10)} durationInFrames={s(18)}>
        <Workflow />
      </Sequence>
      <Sequence from={s(28)} durationInFrames={s(12)}>
        <Cloud />
      </Sequence>
      <Sequence from={s(40)} durationInFrames={s(8)}>
        <Cta />
      </Sequence>
    </AbsoluteFill>
  );
};
