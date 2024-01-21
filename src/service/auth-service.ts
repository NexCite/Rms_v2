"use server";

import { UserAuth } from "./user-service";
import { cookies, headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import prisma from "@rms/prisma/prisma";
import RouteModel from "@rms/models/RouteModel";
import route from "@rms/config/route";
import { $Enums } from "@prisma/client";

/**
 * Check if the user has the required permission and redirect if not.
 *
 * @param user - The authenticated user.
 * @param permission - The required permission.
 */
async function checkPermissions(
  user: UserAuth,
  permission: $Enums.UserPermission
): Promise<void> {
  if (!user.role.permissions.includes(permission)) {
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
  const findSubRouter = route.reduce((a, b) => a.concat(b.children), []);
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
export async function userAuth(): Promise<UserAuth> {
  const token = cookies().get("rms-auth");

  if (!token?.value) {
    await redirect("/login", RedirectType.replace);
  }

  const auth = await prisma.auth.findFirst({
    where: { token: token.value },
    include: {
      user: {
        include: {
          role: true,
          config: true,
        },
      },
    },
  });

  if (!auth) {
    await redirect("/login", RedirectType.replace);
  }

  const user = auth.user;

  if (!user) {
    await redirect("/login", RedirectType.replace);
  }

  const url = new URL(headers().get("url"));

  if (url.pathname === "/admin") {
    return user;
  }

  const findRoute = await findRouteByPath(url.pathname);
  const findSubRoute = await findSubRouteByUrlPath(url.pathname);

  if (findRoute) {
    await checkPermissions(user, findRoute.permission);
  } else if (findSubRoute) {
    if (url.pathname.endsWith("form")) {
      await checkPermissions(user, findSubRoute.addKey);
    } else {
      await checkPermissions(user, findSubRoute.permission);
    }
  } else {
    await redirect("/login", RedirectType.replace);
  }

  return user;
}
