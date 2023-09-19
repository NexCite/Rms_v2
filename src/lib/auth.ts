import { $Enums, Prisma, Status, UserType } from "@prisma/client";
import GetRoutes from "@rms/config/route-config";
import {
  CommonKeys,
  CommonRouteKeys,
  UserSelectCommon,
} from "@rms/models/CommonModel";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import prisma from "@rms/prisma/prisma";
import { sign, verify } from "jsonwebtoken";
import { RedirectType } from "next/dist/client/components/redirect";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthLogged =
  | { status: HttpStatusCode.UNAUTHORIZED }
  | {
      status: HttpStatusCode.OK | HttpStatusCode.FORBIDDEN;
      result: UserSelectCommon;
    };

export async function getUserInfo(): Promise<UserSelectCommon | undefined> {
  "use server";
  const token = cookies().get("rms-auth");

  if (!token?.value) {
    return undefined;
  }
  const auth = await prisma.auth.findFirst({
    where: { token: token.value },
    include: {
      user: {
        select: {
          username: true,
          first_name: true,
          last_name: true,
          id: true,
          permissions: true,
          type: true,
        },
      },
    },
  });

  return auth?.user;
}

export function generateToken(username: string) {
  return sign(
    {
      username,
    },
    process.env["HASHKEY"]!
  );
}

export function verifyToken(token: string) {
  try {
    verify(token, process.env["HASHKEY"]!);
    return true;
  } catch (e) {
    return false;
  }
}
const RouteSkip = ["/admin"];

export async function checkUserPermissions(
  permission: $Enums.UserPermission
): Promise<{ status: HttpStatusCode; user?: UserSelectCommon }> {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    return { status: HttpStatusCode.UNAUTHORIZED };
  }
  return userInfo.permissions.includes(permission)
    ? {
        status: HttpStatusCode.OK,
        user: userInfo,
      }
    : { status: HttpStatusCode.UNAUTHORIZED };
}

export async function GetUserRoute(middleware?: boolean): Promise<
  | boolean
  | {
      id: number;
      username: string;
      type: $Enums.UserType;
      permissions: $Enums.UserPermission[];
    }
> {
  var token = cookies().get("rms-auth");

  if (middleware) {
    if (!token) {
      return false;
    }

    if (!token.value) {
      return false;
    }
    if (!verifyToken(token.value)) {
      return false;
    }

    const auth = await prisma.auth.findMany({
      where: { token: token.value },
      include: {
        user: {
          select: { permissions: true, username: true, id: true, type: true },
        },
      },
    });
    if (auth.length === 0) return false;

    const routes = GetRoutes(auth[0].user.permissions);
    const url = new URL(headers().get("url") ?? "");
    if (RouteSkip.includes(url.pathname)) return true;

    if (routes.length === 0) return false;
    const pathRotues: string[] = [];
    routes.map((res) => {
      pathRotues.push(res.path);
      res.children.map((res) => pathRotues.push(res.path));
    });

    if (pathRotues.filter((res) => url.pathname.startsWith(res)).length === 0)
      return false;
    return true;
  }

  if (!token) {
    redirect("/login", RedirectType.replace);
  }

  if (!token.value) {
    redirect("/login", RedirectType.replace);
  }
  if (!verifyToken(token.value)) {
    redirect("/login", RedirectType.replace);
  }
  const auth = await prisma.auth.findMany({
    where: { token: token.value },
    include: {
      user: {
        select: { permissions: true, username: true, id: true, type: true },
      },
    },
  });

  if (auth.length === 0) redirect("/login", RedirectType.replace);

  return auth[0].user;
}

type UserRotue = {
  id: number;
  username: string;
  type: $Enums.UserType;
  permissions: $Enums.UserPermission[];
};
