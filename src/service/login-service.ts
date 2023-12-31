"use server";

import { generateToken } from "@rms/lib/auth";
import { checkPassword } from "@rms/lib/hash";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
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
        data: { token: token, user_id: user.id, status: "Enable" },
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
