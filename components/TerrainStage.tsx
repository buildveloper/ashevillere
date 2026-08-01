"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TERRAIN } from "@/lib/terrain";
import { useTheme } from "./ThemeProvider";

/**
 * Real Buncombe County terrain — an elevation-heightmap plane rendered with
 * Three.js. Ambience only: slow camera drift + mouse parallax. On a successful
 * geocode the parent passes a target; the camera arcs to the property with a
 * pin drop.
 *
 * Lazy-loaded via next/dynamic + ssr:false so it never blocks first paint.
 * Reduced motion: parent renders it statically (frameloop demand, no fly).
 */

const HEIGHT_SCALE = 0.035;

interface TerrainStageProps {
  target?: { lat: number; lon: number } | null;
  className?: string;
}

/** Latitude/longitude → plane UV (0..1). */
export function lonLatToUV(lon: number, lat: number) {
  const u = (lon - TERRAIN.bounds.west) / (TERRAIN.bounds.east - TERRAIN.bounds.west);
  const v = (lat - TERRAIN.bounds.south) / (TERRAIN.bounds.north - TERRAIN.bounds.south);
  return { u, v };
}

function TerrainScene({
  target,
}: {
  target?: { lat: number; lon: number } | null;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const heightmap = useTexture("/terrain/buncombe-heightmap.png");

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2, TERRAIN.size - 1, TERRAIN.size - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const img = heightmap.image as HTMLImageElement | undefined;
    if (img && img.width) {
      const dem = decodeHeightmap(img);
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) / 2 + 0.5;
        const v = pos.getZ(i) / 2 + 0.5;
        const col = Math.min(TERRAIN.size - 1, Math.floor(u * TERRAIN.size));
        const row = Math.min(TERRAIN.size - 1, Math.floor((1 - v) * TERRAIN.size));
        pos.setY(i, dem[row * TERRAIN.size + col] * HEIGHT_SCALE);
      }
      geo.computeVertexNormals();
    }
    return geo;
  }, [heightmap]);

  const pinRef = useRef<THREE.Group>(null);
  const flyStart = useRef<number | null>(null);

  const targetUV = useMemo(
    () => (target ? lonLatToUV(target.lon, target.lat) : null),
    [target]
  );

  useFrame((state) => {
    const cam = state.camera;
    const t = state.clock.elapsedTime;

    if (targetUV) {
      if (flyStart.current === null) flyStart.current = t;
      const progress = Math.min(1, (t - flyStart.current) / 1.2);
      const eased = 1 - Math.pow(2, -10 * progress);
      const tx = (targetUV.u - 0.5) * 2;
      const tz = (targetUV.v - 0.5) * 2;
      cam.position.x = 0.4 + (tx * 0.55 - 0.4) * eased;
      cam.position.y = 1.4 + (0.55 - 1.4) * eased;
      cam.position.z = 0.5 + (tz * 0.55 - 0.5) * eased;
      cam.lookAt(tx * 0.55, 0, tz * 0.55);
      if (pinRef.current) {
        pinRef.current.position.set(tx * 0.8, 0.05, tz * 0.8);
        pinRef.current.visible = progress > 0.6;
        pinRef.current.scale.setScalar(Math.min(1, (progress - 0.6) / 0.4));
      }
    } else {
      flyStart.current = null;
      cam.position.x = Math.sin(t * 0.12) * 0.5;
      cam.position.y = 1.15 + Math.sin(t * 0.09) * 0.12;
      cam.position.z = 0.85 + Math.cos(t * 0.1) * 0.3;
      cam.lookAt(0, 0, 0);
    }
  });

  const contourColor = dark ? "#C89A63" : "#B8763A";
  const surfaceColor = dark ? "#1d2a22" : "#EDEFE7";
  const tintColor = dark ? "#3E6B53" : "#2C5240";

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color={surfaceColor} roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh geometry={geometry} renderOrder={1}>
        <meshBasicMaterial
          color={contourColor}
          wireframe
          transparent
          opacity={dark ? 0.12 : 0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={geometry} renderOrder={2}>
        <meshBasicMaterial
          color={tintColor}
          wireframe
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
      <group ref={pinRef} visible={false}>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color={contourColor} />
        </mesh>
        <mesh position={[0, 0.105, 0]}>
          <cylinderGeometry args={[0.0015, 0.0015, 0.1, 6]} />
          <meshBasicMaterial color={contourColor} />
        </mesh>
      </group>
      <ambientLight intensity={dark ? 0.9 : 1.1} />
      <directionalLight position={[2, 4, 2]} intensity={dark ? 0.7 : 0.9} />
    </group>
  );
}

/** Decode R(high)+G(low) 16-bit heightmap into a Float32 elevation grid. */
function decodeHeightmap(img: HTMLImageElement): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const out = new Float32Array(TERRAIN.size * TERRAIN.size);
  const { minElevationM, maxElevationM } = TERRAIN;
  const range = maxElevationM - minElevationM || 1;
  for (let i = 0; i < TERRAIN.size * TERRAIN.size; i++) {
    const hi = data[i * 4];
    const lo = data[i * 4 + 1];
    const n = (hi << 8) | lo;
    out[i] = minElevationM + (n / 65535) * range;
  }
  return out;
}

export default function TerrainStage({
  target,
  className = "",
}: TerrainStageProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 1], fov: 45, near: 0.01, far: 10 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <TerrainScene target={target} />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(15,22,18,0.55) 100%)"
            : "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(237,239,231,0.5) 100%)",
        }}
      />
    </div>
  );
}
