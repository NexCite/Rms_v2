import { $Enums, Prisma } from "@prisma/client";
import GetRoutes from "@rms/config/route-config";
import { UserSelectCommon } from "@rms/models/CommonModel";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import prisma from "@rms/prisma/prisma";
import getUserFullInfo, {
  type UserFullInfoType,
} from "@rms/service/user-service";
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
    where: { token: token.value, status: "Enable" },
    include: {
      user: {
        select: {
          username: true,
          first_name: true,
          last_name: true,
          id: true,
          permissions: true,
          type: true,
          config_id: true,
        },
      },
    },
  });

  return auth?.user;
}

export function generateToken(
  user: Prisma.UserGetPayload<{ include: { role: true } }>
) {
  return sign(
    {
      username: user.username,
      permissions: user.role.permissions,
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
): Promise<
  | { status: HttpStatusCode.UNAUTHORIZED }
  | { status: HttpStatusCode.OK; data: UserFullInfoType }
> {
  const userInfo = await getUserFullInfo();
  if (!userInfo) {
    return { status: HttpStatusCode.UNAUTHORIZED };
  }
  return userInfo.user.role.permissions?.includes(permission)
    ? {
        status: HttpStatusCode.OK,
        data: userInfo,
      }
    : { status: HttpStatusCode.UNAUTHORIZED };
}

export async function GetUserRoute(middleware?: boolean): Promise<
  | $Enums.UserPermission[]
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
      return undefined;
    }

    if (!token.value) {
      return undefined;
    }
    if (!verifyToken(token.value)) {
      return undefined;
    }

    const auth = await prisma.auth.findMany({
      where: { token: token.value },
      include: {
        user: {
          select: { permissions: true, username: true, id: true, type: true },
        },
      },
    });
    if (auth.length === 0) return undefined;

    const routes = await GetRoutes();
    const url = new URL(headers().get("url") ?? "");
    if (RouteSkip?.includes(url.pathname)) return auth[0].user.permissions;

    if (routes.length === 0) return undefined;
    const pathRotues: string[] = [];
    routes.map((res) => {
      pathRotues.push(res.path);
      res.children.map((res) => pathRotues.push(res.path));
    });

    if (pathRotues.filter((res) => url.pathname.startsWith(res)).length === 0)
      return undefined;
    return auth[0].user.permissions;
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
