"use server";

import { UserAuth } from "./user-service";
import { cookies, headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import prisma from "@nexcite/prisma/prisma";
import RouteModel from "@nexcite/models/RouteModel";
import route from "@nexcite/routes";
import { $Enums } from "@prisma/client";
import IAuth, { AuthInclude } from "@nexcite/Interfaces/IAuth";

/**
 * Check if the user has the required permission and redirect if not.
 *
 * @param user - The authenticated user.
 * @param permission - The required permission.
 */
async function checkPermissions(
  auth: IAuth,
  permission: $Enums.UserPermission
): Promise<void> {
  if (!auth?.user?.role?.permissions.includes(permission)) {
    await redirect("/login", RedirectType.replace);
  }
}

/**
 * Find a route based on the provided URL path.
 *
 * @param urlPath - The URL path to find the route for.
 * @returns The found route or undefined.
 */
async function findRouteByPath(
  urlPath: string
): Promise<RouteModel | undefined> {
  return route.find((res) => urlPath === res.path);
}

/**
 * Find a sub-route based on the provided URL path.
 *
 * @param urlPath - The URL path to find the sub-route for.
 * @returns The found sub-route or undefined.
 */
async function findSubRouteByUrlPath(
  urlPath: string
): Promise<RouteModel | undefined> {
  const findSubRouter = route.reduce((a, b) => a.concat(b.children as any), []);
  return findSubRouter.find((res) => {
    if (urlPath.endsWith("form")) {
      return urlPath.replace("/form", "").startsWith(res.path);
    } else {
      return urlPath.startsWith(res.path) || res.path === urlPath;
    }
  });
}

/**
 * Authenticate the user and perform necessary checks for route access.
 *
 * @returns The authenticated user.
 */
export async function userAuth(): Promise<IAuth> {
  const token = cookies().get("rms-auth");

  if (!token?.value) {
    redirect("/login", RedirectType.replace);
  }

  const auth = await prisma.auth.findFirst({
    where: { token: token.value },
    include: AuthInclude,
  });

  if (!auth) {
    redirect("/login", RedirectType.replace);
  }

  const url = new URL(headers().get("url"));

  if (url.pathname === "/admin") {
    return auth;
  }

  const findRoute = await findRouteByPath(url.pathname);
  const findSubRoute = await findSubRouteByUrlPath(url.pathname);

  if (findRoute) {
    await checkPermissions(auth, findRoute.permission);
  } else if (findSubRoute) {
    if (url.pathname.endsWith("form")) {
      await checkPermissions(auth, findSubRoute.addKey);
    } else {
      await checkPermissions(auth, findSubRoute.permission);
    }
  } else {
    redirect("/login", RedirectType.replace);
  }

  return auth;
}
