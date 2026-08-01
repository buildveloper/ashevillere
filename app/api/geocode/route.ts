import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.trim() ?? "";
  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter." },
      { status: 400 }
    );
  }
  if (address.length > 200) {
    return NextResponse.json(
      { error: "Address is too long." },
      { status: 400 }
    );
  }

  const result = await geocodeAddress(address);
  return NextResponse.json(result);
}
