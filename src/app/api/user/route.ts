import { GetUserRoute, getUserInfo } from "@rms/lib/auth";
import { createLog } from "@rms/service/log-service";
import getUserFullInfo from "@rms/service/user-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = await getUserFullInfo();
  return NextResponse.json({
    permissions: data.user.role.permissions,
  });
}
