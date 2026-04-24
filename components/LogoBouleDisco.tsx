import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Animated, Easing } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  RadialGradient,
  Stop,
  ClipPath,
  G,
  Path,
} from "react-native-svg";
import { Lampe, animation } from "../theme";

export type LogoBouleDisco = {
  exploser: () => void;
};

type Props = {
  size?: number;
  anime?: boolean;
  lampeActive?: Lampe;
};

const OVERLAY_LAMPE: Record<Lampe, string> = {
  vert: "rgba(122,203,43,0.25)",
  orange: "rgba(255,149,0,0.25)",
  rouge: "rgba(226,75,74,0.25)",
  eteint: "transparent",
};

const VB_W = 130;
const VB_H = 150;
const CX = 65;
const CY = 80;
const R = 46;

const FACETTES = [
  { cx: 45, cy: 62, r: 3.8 },
  { cx: 78, cy: 58, r: 2.6 },
  { cx: 50, cy: 92, r: 3.0 },
  { cx: 84, cy: 96, r: 2.4 },
  { cx: 68, cy: 70, r: 1.8 },
  { cx: 58, cy: 102, r: 1.7 },
  { cx: 90, cy: 78, r: 1.6 },
];

const ETINCELLES_COINS = [
  { x: CX + R + 8, y: CY - R - 8 },
  { x: CX - R - 8, y: CY - R - 8 },
  { x: CX + R + 8, y: CY + R + 8 },
  { x: CX - R - 8, y: CY + R + 8 },
];

const LogoBouleDisco = forwardRef<LogoBouleDisco, Props>(
  ({ size = 130, anime = true, lampeActive }, ref) => {
    const rotation = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const animLoop = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
      animLoop.current?.stop();
      if (!anime) {
        rotation.setValue(0);
        return;
      }
      const duree =
        lampeActive != null
          ? animation.rotationBouleProgramme
          : animation.rotationBouleDisco;
      rotation.setValue(0);
      animLoop.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: duree,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animLoop.current.start();
      return () => animLoop.current?.stop();
    }, [anime, lampeActive, rotation]);

    useImperativeHandle(ref, () => ({
      exploser: () => {
        animLoop.current?.stop();
        rotation.setValue(0);
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 400,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: 2,
              duration: animation.rotationBoulExplosion,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale, {
            toValue: 1,
            duration: 500,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (anime) {
            animLoop.current = Animated.loop(
              Animated.timing(rotation, {
                toValue: 1,
                duration: animation.rotationBouleDisco,
                easing: Easing.linear,
                useNativeDriver: true,
              })
            );
            animLoop.current.start();
          }
        });
      },
    }));

    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const w = size;
    const h = size * (VB_H / VB_W);

    return (
      <Animated.View
        style={{ transform: [{ rotate }, { scale }] }}
        accessibilityLabel="Boule disco"
      >
        <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          <Defs>
            <RadialGradient id="sG" cx="35%" cy="28%" r="65%" fx="35%" fy="28%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="30%" stopColor="#FFF7D6" stopOpacity="1" />
              <Stop offset="65%" stopColor="#E8A814" stopOpacity="1" />
              <Stop offset="100%" stopColor="#6B3D00" stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="rG" cx="30%" cy="25%" r="60%" fx="30%" fy="25%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
            <ClipPath id="sC">
              <Circle cx={CX} cy={CY} r={R} />
            </ClipPath>
          </Defs>

          {/* Suspension */}
          <Path d={`M${CX} 14 L${CX} 6`} stroke="#1F1400" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={CX} cy={18} r={4} fill="#1F1400" />

          {/* Sphère */}
          <Circle cx={CX} cy={CY} r={R} fill="url(#sG)" stroke="#1F1400" strokeWidth={2} />

          {/* Facettes */}
          <G clipPath="url(#sC)" opacity={0.55}>
            <Ellipse cx={CX} cy={CY} rx={32} ry={R} fill="none" stroke="#8B5A10" strokeWidth={0.7} />
            <Ellipse cx={CX} cy={CY} rx={16} ry={R} fill="none" stroke="#8B5A10" strokeWidth={0.7} />
            <Ellipse cx={CX} cy={CY} rx={R} ry={14} fill="none" stroke="#8B5A10" strokeWidth={0.7} />
            <Ellipse cx={CX} cy={CY} rx={R} ry={28} fill="none" stroke="#8B5A10" strokeWidth={0.7} />
            <Line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="#8B5A10" strokeWidth={0.7} />
            <Line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#8B5A10" strokeWidth={0.7} />
          </G>

          {/* Reflet */}
          <Circle cx={CX} cy={CY} r={R} fill="url(#rG)" />

          {/* Overlay lampe active */}
          {lampeActive != null && lampeActive !== "eteint" && (
            <Circle cx={CX} cy={CY} r={R} fill={OVERLAY_LAMPE[lampeActive]} />
          )}

          {/* Facettes brillantes */}
          {FACETTES.map((f, i) => (
            <Circle key={i} cx={f.cx} cy={f.cy} r={f.r} fill="#FFFFFF" opacity={0.9} />
          ))}

          {/* Étincelles coins */}
          {ETINCELLES_COINS.map((e, i) => {
            const s = 5;
            return (
              <G key={i}>
                <Line x1={e.x} y1={e.y - s} x2={e.x} y2={e.y + s} stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
                <Line x1={e.x - s} y1={e.y} x2={e.x + s} y2={e.y} stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
              </G>
            );
          })}

          {/* Rayons diagonaux */}
          {ETINCELLES_COINS.map((e, i) => {
            const dx = (CX - e.x) * 0.35;
            const dy = (CY - e.y) * 0.35;
            return (
              <Line
                key={i}
                x1={e.x + dx}
                y1={e.y + dy}
                x2={e.x}
                y2={e.y}
                stroke="#FFFFFF"
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
        </Svg>
      </Animated.View>
    );
  }
);

LogoBouleDisco.displayName = "LogoBouleDisco";
export default LogoBouleDisco;
