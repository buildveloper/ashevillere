"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, AttributionControl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "./ThemeProvider";

/**
 * MapStage — real 3D map for the address lookup (MapLibre GL JS, token-free).
 *
 * Mounted ONLY after a successful in-scope geocode (Hero renders it behind
 * `flyTarget`), and lazy-loaded via next/dynamic + ssr:false so it never
 * blocks the homepage's LCP. The map:
 *   - real 3D terrain: raster-dem source (Mapterhorn Terrarium DEM) + setTerrain
 *   - 3D building extrusion: fill-extrusion over OpenFreeMap building tiles
 *     (OSM render_height/render_min_height)
 *   - camera fly-to the parcel, tilted per DESIGN.md motion system
 *     (~1200ms expo.out, restrained pitch — atmosphere, not spectacle)
 *   - prefers-reduced-motion: NO fly animation, map appears instantly in its
 *     resting 3D state via jumpTo
 * Styled from the design tokens (light/dark aware).
 *
 * Tile source: OpenFreeMap public instance (tiles.openfreemap.org) — free,
 * no API key, no usage limits, commercial use allowed. Mapbox is not used:
 * its free tier (50k map loads/mo) requires a paid Commercial Application
 * License for production real-estate use, so this product stays token-free.
 */

// OpenFreeMap vector source (no key) + Mapterhorn global DEM (no key).
const VECTOR_URL = "https://tiles.openfreemap.org/planet";
// Free, no-key Terrarium DEM — the same source the official MapLibre
// 3D-terrain example uses. 512px tiles, global coverage.
const DEM_URL = "https://tiles.mapterhorn.com/tilejson.json";

function buildStyle(dark: boolean): StyleSpecification {
  // Base palette is OpenFreeMap's "liberty" (light) colors; we re-skin the
  // major surfaces with the AshevilleRE tokens. Text stays legible in both.
  return {
    version: 8,
    sources: {
      openmaptiles: {
        type: "vector",
        url: VECTOR_URL,
        attribution:
          '<a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
      // DEM for 3D terrain (Mapterhorn, Terrarium-encoded).
      "terrain-dem": {
        type: "raster-dem",
        url: DEM_URL,
        tileSize: 512,
        attribution:
          '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": dark ? "#0F1612" : "#EDEFE7",
        },
      },
      // Subtle hillshade over the terrain — topographic texture under the vectors.
      {
        id: "hills",
        type: "hillshade",
        source: "terrain-dem",
        paint: {
          "hillshade-exaggeration": dark ? 0.35 : 0.25,
          "hillshade-highlight-color": dark ? "#3E6B53" : "#f3f1e8",
          "hillshade-shadow-color": dark ? "#0d1410" : "#c9c4b4",
        },
      },
      // Land/water fills, token-tinted.
      {
        id: "landcover",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["==", ["get", "class"], "wood"],
        paint: {
          "fill-color": dark ? "#1d2a22" : "#dde5d0",
          "fill-opacity": 0.35,
        },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["!=", ["get", "brunnel"], "tunnel"],
        paint: {
          "fill-color": dark ? "#1c3a44" : "#bcd6dd",
        },
      },
      {
        id: "building-3d",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": dark ? "#3E6B53" : "#2C5240",
          "fill-extrusion-height": ["get", "render_height"],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 0.85,
        },
      },
      // Roads — keep them light so the terrain reads; use the token line.
      {
        id: "roads",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "all",
          ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
          ["match", ["get", "class"], ["motorway", "trunk", "primary", "secondary", "tertiary"], true, false],
        ],
        paint: {
          "line-color": dark ? "#4A8065" : "#9aa396",
          "line-width": ["interpolate", ["exponential", 1.3], ["zoom"], 8, 0.6, 18, 6],
        },
      },
    ],
  };
}

export default function MapStage({
  target,
  className = "",
}: {
  target: { lat: number; lon: number } | null;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const { theme } = useTheme();
  const dark = theme === "dark";

  // Initialize once on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = buildStyle(dark);
    const map = new MapLibreMap({
      container,
      style,
      center: [target?.lon ?? -82.55, target?.lat ?? 35.59],
      zoom: 13,
      pitch: 55,
      bearing: 0,
      attributionControl: false,
      // MapLibre needs a Worker; with a strict CSP it must come from blob:
      // (handled in vercel.json — worker-src blob:).
      // canvasContextAttributes: { antialias: true },
    });
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;

    // Apply terrain once the style is loaded.
    map.on("load", () => {
      map.setTerrain({ source: "terrain-dem", exaggeration: 1.2 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly (or jump, under reduced motion) to a new target.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !target) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Resting 3D state, no animation.
      map.jumpTo({ center: [target.lon, target.lat], zoom: 15, pitch: 55 });
      return;
    }
    map.flyTo({
      center: [target.lon, target.lat],
      zoom: 15,
      pitch: 55,
      bearing: 0,
      duration: 1200,
      essential: true,
      easing: (t) => 1 - Math.pow(2, -10 * t),
    });
  }, [target]);

  // Re-apply theme colors when the theme changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setPaintProperty("background", "background-color", dark ? "#0F1612" : "#EDEFE7");
    map.setPaintProperty("hills", "hillshade-exaggeration", dark ? 0.35 : 0.25);
    map.setPaintProperty("landcover", "fill-color", dark ? "#1d2a22" : "#dde5d0");
    map.setPaintProperty("water", "fill-color", dark ? "#1c3a44" : "#bcd6dd");
    map.setPaintProperty("building-3d", "fill-extrusion-color", dark ? "#3E6B53" : "#2C5240");
    map.setPaintProperty("roads", "line-color", dark ? "#4A8065" : "#9aa396");
  }, [dark]);

  return (
    <div
      className={`relative h-[420px] w-full overflow-hidden rounded-xl border border-line shadow-soft ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {/* Discreet mono caption in the brand's data voice */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-surface/85 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-muted backdrop-blur-sm">
        3D · TERRAIN + BUILDINGS · MAPLIBRE
      </div>
    </div>
  );
}
