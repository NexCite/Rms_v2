"use server";
import { cookies } from "next/headers";
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
    if (!checkAuth.data) {
      return NextResponse.redirect(url);
    }

    response.cookies.set("rms-permissions", JSON.stringify(checkAuth.data));

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(url);
  }
}
export const config = {
  matcher: ["/admin/:path*"],
};
export const runtime = "nodejs";
