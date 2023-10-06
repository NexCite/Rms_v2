import { GetUserRoute, getUserInfo } from "@rms/lib/auth";
import { createLog } from "@rms/service/log-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = await GetUserRoute(true);
  return NextResponse.json({
    data,
  });
}

export async function POST(req: NextRequest) {
  const data = await getUserInfo();
  const urlHeader = req.url;
  const url = new URL(urlHeader);

  createLog({ ...(await req.json()), user_id: data.id });

  return NextResponse.json({
    data,
  });
}
