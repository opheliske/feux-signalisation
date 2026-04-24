import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Line,
  Circle,
  G,
} from "react-native-svg";

const H = 260;
const CX_RATIO = 0.5;
const CY = 130;

const RAYONS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 10;
  return { angle };
});

const POINTS = [
  { x: 0.15, y: 0.18 },
  { x: 0.82, y: 0.22 },
  { x: 0.1, y: 0.65 },
  { x: 0.88, y: 0.6 },
  { x: 0.45, y: 0.88 },
  { x: 0.7, y: 0.12 },
];

const ETINCELLES = [
  { x: 45, y: 45 },
  { x: 295, y: 45 },
  { x: 60, y: 210 },
];

export default function FondRayons() {
  const { width } = useWindowDimensions();
  const cx = width * CX_RATIO;
  const rayLen = Math.max(width, H) * 0.8;

  return (
    <Svg
      width={width}
      height={H}
      style={{ position: "absolute", top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="halo" cx="50%" cy={`${(CY / H) * 100}%`} r="55%" fx="50%" fy={`${(CY / H) * 100}%`}>
          <Stop offset="0%" stopColor="#FFF09A" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FFD60A" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={H} fill="url(#halo)" />

      {RAYONS.map(({ angle }, i) => (
        <Line
          key={i}
          x1={cx}
          y1={CY}
          x2={cx + Math.cos(angle) * rayLen}
          y2={CY + Math.sin(angle) * rayLen}
          stroke="#F2B600"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
        />
      ))}

      {POINTS.map((p, i) => (
        <Circle
          key={i}
          cx={p.x * width}
          cy={p.y * H}
          r={3}
          fill="#F2B600"
          opacity={0.7}
        />
      ))}

      {ETINCELLES.map((e, i) => {
        const s = 6;
        return (
          <G key={i}>
            <Line x1={e.x} y1={e.y - s} x2={e.x} y2={e.y + s} stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={e.x - s} y1={e.y} x2={e.x + s} y2={e.y} stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={e.x - s * 0.55} y1={e.y - s * 0.55} x2={e.x + s * 0.55} y2={e.y + s * 0.55} stroke="#FFFFFF" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
            <Line x1={e.x + s * 0.55} y1={e.y - s * 0.55} x2={e.x - s * 0.55} y2={e.y + s * 0.55} stroke="#FFFFFF" strokeWidth={0.8} strokeLinecap="round" opacity={0.6} />
          </G>
        );
      })}
    </Svg>
  );
}
