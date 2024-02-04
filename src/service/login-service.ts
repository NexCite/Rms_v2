"use server";

import { generateToken } from "@nexcite/lib/auth";
import { checkPassword } from "@nexcite/lib/hash";
import HttpStatusCode from "@nexcite/models/HttpStatusCode";
import ServiceActionModel from "@nexcite/models/ServiceActionModel";
import prisma from "@nexcite/prisma/prisma";
import { cookies } from "next/headers";

export async function createLogin(params: {
  username?: string;
  password?: string;
}): Promise<ServiceActionModel<string>> {
  const user = await prisma.user.findFirst({
    where: { username: params.username },
    include: { role: {} },
  });

  if (user !== null) {
    var isPasswordOk = checkPassword(params.password, user.password);
    if (isPasswordOk) {
      var token = generateToken(user);
      cookies().set("rms-auth", token);
      await prisma.auth.updateMany({
        where: {
          user_id: user.id,
        },
        data: { status: "Disable" },
      });
      await prisma.auth.create({
        data: {
          token: token,
          user_id: user.id,
          status: "Enable",
          config_id: user.config_id,
        },
      });
      return {
        status: HttpStatusCode.OK,
        message: "Logged In",
      };
    }
  }

  return {
    status: HttpStatusCode.BAD_REQUEST,
    message: "wrong username or password",
  };
}

export async function deleteLogin(): Promise<ServiceActionModel<string>> {
  var auth = cookies().get("rms-auth");
  if (auth?.value) {
    var result = await prisma.auth.findFirst({ where: { token: auth.value } });
    if (result) {
      await prisma.auth.update({
        where: { id: result.id },
        data: { status: "Disable" },
      });
    }
  }
  return {
    status: HttpStatusCode.OK,
    message: "Logged Out",
  };
}
