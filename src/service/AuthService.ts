"use server";

import IAuth, { AuthInclude } from "@nexcite/Interfaces/IAuth";
import prisma from "@nexcite/prisma/prisma";
import { cookies } from "next/headers";

class AuthService {
  static async findAuth(): Promise<IAuth | null> {
    "use server";
    const token = cookies().get("rms-auth")?.value;
    const auth = await prisma.auth.findFirst({
      where: {
        token,
      },
      include: AuthInclude,
    });
    return auth;
  }
}
export const { findAuth } = AuthService;
