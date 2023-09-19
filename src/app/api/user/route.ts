import { GetUserRoute } from "@rms/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: await GetUserRoute(true),
  });
}
