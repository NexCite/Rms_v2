import getAuth from "@nexcite/service/user-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const data = await getAuth();

  if (data) {
    return NextResponse.json({
      permissions: data.user.role.permissions,
    });
  } else {
    return NextResponse.json({}, { status: 401 });
  }
}
