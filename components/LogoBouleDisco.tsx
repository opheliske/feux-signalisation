import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Animated, Easing, View } from "react-native";
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
  Polygon,
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
  vert: "rgba(122,203,43,0.32)",
  orange: "rgba(255,149,0,0.32)",
  rouge: "rgba(226,75,74,0.32)",
  eteint: "transparent",
};

// ─── Géométrie ───────────────────────────────────────────────────────────
const VB_W = 160;
const VB_H = 180;
const CX = 80;
const CY = 100;
const R = 52;

// ─── Grille de facettes (dans la sphère) ─────────────────────────────────
const COULEURS_FACETTES = [
  "#FF4FB7", // magenta
  "#4FE3FF", // cyan
  "#7FFF8B", // vert disco
  "#FFE94F", // jaune
  "#B981FF", // violet
  "#FF8E4F", // orange
];

type Facette = { x: number; y: number; r: number; couleur?: string };

const FACETTES: Facette[] = (() => {
  const arr: Facette[] = [];
  const STEP = 8;
  const ROW_H = STEP * 0.866;
  let i = 0;
  for (let row = 0; row * ROW_H <= 2 * R; row++) {
    const y = CY - R + row * ROW_H;
    const offset = row % 2 === 0 ? 0 : STEP / 2;
    for (let col = 0; col * STEP <= 2 * R; col++) {
      const x = CX - R + col * STEP + offset;
      const dx = x - CX;
      const dy = y - CY;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < R - 1.5) {
        // Plus la facette est près du bord, plus elle est petite (effet bombé)
        const r = 1.1 + (1 - d / R) * 1.4;
        const colored = (i * 13) % 14 === 0;
        arr.push({
          x,
          y,
          r,
          couleur: colored
            ? COULEURS_FACETTES[i % COULEURS_FACETTES.length]
            : undefined,
        });
        i++;
      }
    }
  }
  return arr;
})();

// Facettes qui scintillent (deux canaux pour avoir des phases différentes)
const ETINCELLES_SPHERE = [
  { x: 58, y: 88, r: 2.4, canal: 0 },
  { x: 100, y: 95, r: 2.0, canal: 1 },
  { x: 78, y: 122, r: 1.8, canal: 0 },
  { x: 92, y: 76, r: 2.0, canal: 1 },
  { x: 64, y: 118, r: 1.5, canal: 1 },
  { x: 108, y: 112, r: 1.6, canal: 0 },
];

// Étincelles autour de la boule (ne tournent pas, scintillent)
const ETINCELLES_AUTOUR = [
  { x: CX + R + 10, y: CY - R - 6, taille: 6, canal: 0 },
  { x: CX - R - 10, y: CY - R - 6, taille: 5, canal: 1 },
  { x: CX + R + 14, y: CY + R + 8, taille: 5, canal: 1 },
  { x: CX - R - 14, y: CY + R + 8, taille: 6, canal: 0 },
  { x: CX, y: CY + R + 18, taille: 4, canal: 1 },
];

// ─── Rayons lumineux ─────────────────────────────────────────────────────
const NB_RAYONS = 12;
function pointsRayon(angleDeg: number, longueur: number, demi: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const inX = CX + Math.cos(a) * (R - 4);
  const inY = CY + Math.sin(a) * (R - 4);
  const outX = CX + Math.cos(a) * (R + longueur);
  const outY = CY + Math.sin(a) * (R + longueur);
  const px = -Math.sin(a) * demi;
  const py = Math.cos(a) * demi;
  return `${inX},${inY} ${outX + px},${outY + py} ${outX - px},${outY - py}`;
}
const RAYONS_LUMIERE = Array.from({ length: NB_RAYONS }, (_, i) => ({
  points: pointsRayon(
    (i * 360) / NB_RAYONS + 11,
    i % 2 === 0 ? 26 : 18,
    4.5
  ),
}));

const AnimatedG = Animated.createAnimatedComponent(G);

const LogoBouleDisco = forwardRef<LogoBouleDisco, Props>(
  ({ size = 130, anime = true, lampeActive }, ref) => {
    const rotation = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const twinkleA = useRef(new Animated.Value(0.6)).current;
    const twinkleB = useRef(new Animated.Value(0.4)).current;
    const beamPulse = useRef(new Animated.Value(0.5)).current;

    const animLoop = useRef<Animated.CompositeAnimation | null>(null);
    const twinkleLoopA = useRef<Animated.CompositeAnimation | null>(null);
    const twinkleLoopB = useRef<Animated.CompositeAnimation | null>(null);
    const beamLoop = useRef<Animated.CompositeAnimation | null>(null);

    // Rotation de la sphère
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

    // Scintillement et pulsations des rayons
    useEffect(() => {
      twinkleLoopA.current?.stop();
      twinkleLoopB.current?.stop();
      beamLoop.current?.stop();
      if (!anime) {
        twinkleA.setValue(0.7);
        twinkleB.setValue(0.7);
        beamPulse.setValue(0.5);
        return;
      }
      twinkleLoopA.current = Animated.loop(
        Animated.sequence([
          Animated.timing(twinkleA, {
            toValue: 1,
            duration: 520,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(twinkleA, {
            toValue: 0.25,
            duration: 520,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      twinkleLoopB.current = Animated.loop(
        Animated.sequence([
          Animated.timing(twinkleB, {
            toValue: 0.25,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(twinkleB, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      beamLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(beamPulse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(beamPulse, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      twinkleLoopA.current.start();
      twinkleLoopB.current.start();
      beamLoop.current.start();
      return () => {
        twinkleLoopA.current?.stop();
        twinkleLoopB.current?.stop();
        beamLoop.current?.stop();
      };
    }, [anime, twinkleA, twinkleB, beamPulse]);

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
    const beamOpacity = beamPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0.9],
    });

    const w = size;
    const h = size * (VB_H / VB_W);

    return (
      <Animated.View
        style={{ width: w, height: h, transform: [{ scale }] }}
        accessibilityLabel="Boule disco"
      >
        {/* 1 — Rayons lumineux derrière (pulsent, ne tournent pas) */}
        <Animated.View
          style={{
            position: "absolute",
            width: w,
            height: h,
            opacity: beamOpacity,
          }}
        >
          <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="55%" r="55%">
                <Stop offset="0%" stopColor="#FFF7D6" stopOpacity="0.85" />
                <Stop offset="55%" stopColor="#FFD60A" stopOpacity="0.35" />
                <Stop offset="100%" stopColor="#FFD60A" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={CX} cy={CY} r={R + 32} fill="url(#halo)" />
            {RAYONS_LUMIERE.map((r, i) => (
              <Polygon
                key={i}
                points={r.points}
                fill="#FFF7D6"
                opacity={0.6}
              />
            ))}
          </Svg>
        </Animated.View>

        {/* 2 — Cordon (ne tourne pas, reste accroché en haut) */}
        <View style={{ position: "absolute", width: w, height: h }}>
          <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            <Path
              d={`M${CX} 40 L${CX} 10`}
              stroke="#1F1400"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <Circle cx={CX} cy={44} r={4} fill="#1F1400" />
          </Svg>
        </View>

        {/* 3 — Sphère (tourne) avec facettes et reflets colorés */}
        <Animated.View
          style={{
            position: "absolute",
            width: w,
            height: h,
            transform: [{ rotate }],
          }}
        >
          <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            <Defs>
              <RadialGradient
                id="sphG"
                cx="32%"
                cy="26%"
                r="70%"
                fx="32%"
                fy="26%"
              >
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="22%" stopColor="#FFF7D6" stopOpacity="1" />
                <Stop offset="55%" stopColor="#FFD060" stopOpacity="1" />
                <Stop offset="85%" stopColor="#C99200" stopOpacity="1" />
                <Stop offset="100%" stopColor="#5A3300" stopOpacity="1" />
              </RadialGradient>
              <ClipPath id="sphC">
                <Circle cx={CX} cy={CY} r={R} />
              </ClipPath>
            </Defs>

            {/* Sphère */}
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              fill="url(#sphG)"
              stroke="#1F1400"
              strokeWidth={2}
            />

            {/* Quadrillage subtil + facettes */}
            <G clipPath="url(#sphC)">
              <G opacity={0.32}>
                <Ellipse
                  cx={CX}
                  cy={CY}
                  rx={R * 0.7}
                  ry={R}
                  fill="none"
                  stroke="#8B5A10"
                  strokeWidth={0.6}
                />
                <Ellipse
                  cx={CX}
                  cy={CY}
                  rx={R * 0.4}
                  ry={R}
                  fill="none"
                  stroke="#8B5A10"
                  strokeWidth={0.6}
                />
                <Ellipse
                  cx={CX}
                  cy={CY}
                  rx={R}
                  ry={R * 0.7}
                  fill="none"
                  stroke="#8B5A10"
                  strokeWidth={0.6}
                />
                <Ellipse
                  cx={CX}
                  cy={CY}
                  rx={R}
                  ry={R * 0.4}
                  fill="none"
                  stroke="#8B5A10"
                  strokeWidth={0.6}
                />
              </G>

              {FACETTES.map((f, i) =>
                f.couleur ? (
                  <Circle
                    key={`fc-${i}`}
                    cx={f.x}
                    cy={f.y}
                    r={f.r + 0.4}
                    fill={f.couleur}
                    opacity={0.92}
                  />
                ) : (
                  <Circle
                    key={`fw-${i}`}
                    cx={f.x}
                    cy={f.y}
                    r={f.r}
                    fill="#FFF7D6"
                    opacity={0.85}
                  />
                )
              )}

              {/* Teinte lampe active */}
              {lampeActive != null && lampeActive !== "eteint" && (
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill={OVERLAY_LAMPE[lampeActive]}
                />
              )}
            </G>

            {/* Facettes brillantes qui scintillent */}
            {ETINCELLES_SPHERE.map((s, i) => (
              <AnimatedG
                key={`es-${i}`}
                opacity={s.canal === 0 ? twinkleA : twinkleB}
              >
                <Circle
                  cx={s.x}
                  cy={s.y}
                  r={s.r + 1.6}
                  fill="#FFFFFF"
                  opacity={0.35}
                />
                <Circle cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" />
              </AnimatedG>
            ))}
          </Svg>
        </Animated.View>

        {/* 4 — Reflet brillant (ne tourne pas, donne l'effet sphère 3D) */}
        <View style={{ position: "absolute", width: w, height: h }}>
          <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            <Defs>
              <RadialGradient
                id="refG"
                cx="32%"
                cy="26%"
                r="50%"
                fx="32%"
                fy="26%"
              >
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <ClipPath id="refC">
                <Circle cx={CX} cy={CY} r={R} />
              </ClipPath>
            </Defs>
            <G clipPath="url(#refC)">
              <Ellipse
                cx={CX - R * 0.32}
                cy={CY - R * 0.42}
                rx={R * 0.55}
                ry={R * 0.4}
                fill="url(#refG)"
              />
            </G>
          </Svg>
        </View>

        {/* 5 — Étincelles autour (ne tournent pas, scintillent) */}
        <View style={{ position: "absolute", width: w, height: h }}>
          <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            {ETINCELLES_AUTOUR.map((s, i) => (
              <AnimatedG
                key={`ea-${i}`}
                opacity={s.canal === 0 ? twinkleA : twinkleB}
              >
                <Line
                  x1={s.x}
                  y1={s.y - s.taille}
                  x2={s.x}
                  y2={s.y + s.taille}
                  stroke="#FFFFFF"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
                <Line
                  x1={s.x - s.taille}
                  y1={s.y}
                  x2={s.x + s.taille}
                  y2={s.y}
                  stroke="#FFFFFF"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
                <Line
                  x1={s.x - s.taille * 0.55}
                  y1={s.y - s.taille * 0.55}
                  x2={s.x + s.taille * 0.55}
                  y2={s.y + s.taille * 0.55}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                <Line
                  x1={s.x - s.taille * 0.55}
                  y1={s.y + s.taille * 0.55}
                  x2={s.x + s.taille * 0.55}
                  y2={s.y - s.taille * 0.55}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                <Circle cx={s.x} cy={s.y} r={1.3} fill="#FFFFFF" />
              </AnimatedG>
            ))}
          </Svg>
        </View>
      </Animated.View>
    );
  }
);

LogoBouleDisco.displayName = "LogoBouleDisco";
export default LogoBouleDisco;
