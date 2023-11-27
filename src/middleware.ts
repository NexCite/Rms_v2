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
        next: { revalidate: 1 },
        cache: "no-store",
      }
    ).then((res) => res.json());

    if (!checkAuth.permissions) {
      return NextResponse.redirect(url);
    }

    response.cookies.set(
      "rms-permissions",
      JSON.stringify(checkAuth.permissions)
    );

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
