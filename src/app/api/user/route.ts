import { GetUserRoute } from "@rms/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = await GetUserRoute(true);
  return NextResponse.json({
    data,
  });
}
