import { $Enums, Prisma } from "@prisma/client";
import { UserSelectCommon } from "@nexcite/models/CommonModel";
import HttpStatusCode from "@nexcite/models/HttpStatusCode";
import prisma from "@nexcite/prisma/prisma";
import getAuth, { type UserFullInfoType } from "@nexcite/service/user-service";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";

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
    return verify(token, process.env["HASHKEY"]!);
  } catch (e) {
    return undefined;
  }
}

export async function checkUserPermissions(
  permission: $Enums.UserPermission
): Promise<
  | { status: HttpStatusCode.UNAUTHORIZED }
  | { status: HttpStatusCode.OK; data: UserFullInfoType }
> {
  const userInfo = await getAuth();
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

type UserRotue = {
  id: number;
  username: string;
  type: $Enums.UserType;
  permissions: $Enums.UserPermission[];
};
