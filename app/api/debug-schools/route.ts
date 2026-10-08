import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Temporary debug: inspect the county schools layer from Vercel's network. */
export async function GET(req: NextRequest) {
  const which = req.nextUrl.searchParams.get("which") ?? "meta";
  const base =
    "https://gis.buncombecounty.org/arcgis/rest/services/opendata_2/FeatureServer";
  const target =
    which === "query"
      ? `${base}/6/query?geometry=-82.55175,35.59518&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&where=1%3D1&outFields=*&returnGeometry=false&f=json`
      : `${base}/6?f=json`;
  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    return NextResponse.json({
      which,
      http: res.status,
      bytes: text.length,
      body: text.slice(0, 4000),
    });
  } catch (err) {
    return NextResponse.json({
      which,
      error: String(err).slice(0, 500),
    });
  }
}
