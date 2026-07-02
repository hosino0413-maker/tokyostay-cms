import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    event: {
      id: `evt_${Date.now()}`,
      type: payload.type || "view",
      propertyId: payload.propertyId || null,
      refCode: payload.refCode || null,
      createdAt: new Date().toISOString()
    }
  });
}
