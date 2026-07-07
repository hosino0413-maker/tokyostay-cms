import { NextResponse } from "next/server";

import { getSupabaseBuildings, saveSupabaseBuildings } from "@/lib/supabase/buildings";
import type { Building } from "@/types/property";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildings = await getSupabaseBuildings({ adminMode: searchParams.get("mode") !== "full" });
    return NextResponse.json({ buildings, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load buildings", ok: false },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const buildings = Array.isArray(payload.buildings) ? (payload.buildings as Building[]) : [];
    await saveSupabaseBuildings(buildings);
    return NextResponse.json({ count: buildings.length, ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save buildings", ok: false },
      { status: 500 },
    );
  }
}
