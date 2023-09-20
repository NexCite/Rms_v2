"use server";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const result = await fetch(
    `${process.env.NODE_ENV === "development" ? "http://" : "http://"}${
      url.host
    }/api/config`,
    { method: "Get" }
  ).then((res) => res.json());

  url.pathname = "/";
  if (result.status !== 200) {
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({
    headers: {
      url: request.url,
    },
  });
  try {
    const auth = request.cookies.get("rms-auth");

    if (!auth) return NextResponse.redirect(url);

    const checkAuth = await fetch(
      `${process.env.NODE_ENV === "development" ? "http://" : "http://"}${
        url.host
      }/api/user`,
      {
        method: "Get",
        headers: { Cookie: `rms-auth=${auth.value}`, url: request.url },
      }
    ).then((res) => res.json());
    if (!checkAuth.status) {
      return NextResponse.redirect(url);
    }
    console.log(checkAuth);
    return response;
  } catch (error) {
    return response;
  }
}
export const config = {
  matcher: ["/admin/:path*"],
};
export const runtime = "nodejs";
