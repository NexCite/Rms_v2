import getAuth from "@nexcite/service/user-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = await getAuth();
  return NextResponse.json({
    permissions: data.user.role.permissions,
  });
}
