"use server";
import { NextRequest, NextResponse } from "next/server";
const skipUrls = ["/api/auth", "/api/logout", "/api/media"];
export async function middleware(request: NextRequest) {
  request.headers.set("next-url", request.nextUrl.toString());
  request.headers.set("x-middleware-cache", "no-cache");
  const requestUrl = request.nextUrl.clone();
  const url = new URL(requestUrl);
  if (skipUrls.some((path) => new RegExp(path).test(url.pathname))) {
    return NextResponse.next({ request: request });
  }
  url.pathname = "/api/auth";
  const headers = new Headers();
  headers.set("next-url", requestUrl.toString());
  headers.set("x-middleware-cache", "no-cache");
  headers.set("cookie", request.headers.get("cookie") || "");
  const isLogged = await fetch(url, {
    headers: headers,
    method: "GET",
    cache: "no-cache",
  })
    .then((res) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
  if (!isLogged) {
    url.pathname = url.pathname.split("/")[0] + "/login";

    return NextResponse.redirect(url);
  }
  return NextResponse.next({
    request: request,
  });
  // const result = await fetch(
  //   `${process.env.NODE_ENV === "development" ? "http://" : "http://"}${
  //     url.host
  //   }/api/config`,
  //   { method: "Get" }
  // ).then((res) => res.json());

  // url.pathname = "/";
  // if (result.status !== 200) {
  //   return NextResponse.redirect(url);
  // }

  // const response = NextResponse.next({
  //   headers: {
  //     url: request.url,
  //   },
  // });
  // try {
  //   const auth = request.cookies.get("rms-auth");

  //   if (!auth) return NextResponse.redirect(url);

  //   const checkAuth = await fetch(
  //     `${process.env.NODE_ENV === "development" ? "http://" : "http://"}${
  //       url.host
  //     }/api/user`,
  //     {
  //       method: "Get",
  //       headers: { Cookie: `rms-auth=${auth.value}`, url: request.url },
  //       next: { revalidate: 1 },
  //       cache: "no-store",
  //     }
  //   ).then((res) => res.json());

  //   if (!checkAuth.permissions && !response.cookies.get("rms-permissions")) {
  //     return NextResponse.redirect(url);
  //   }
  //   response.cookies.delete("rms-permissions");
  //   response.cookies.set(
  //     "rms-permissions",
  //     JSON.stringify(checkAuth.permissions)
  //   );

  //   return response;
  // } catch (error) {
  //   return NextResponse.redirect(url);
  // }
}
export const config = {
  matcher: ["/admin/:path*"],
};
export const runtime = "nodejs";
