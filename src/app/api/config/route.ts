import prisma from "@rms/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.config.findFirst();

  return config
    ? NextResponse.json({ ...config, status: 200 })
    : NextResponse.json({ status: 404 });
}
