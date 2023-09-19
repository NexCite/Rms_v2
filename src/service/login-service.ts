"use server";

import { generateToken } from "@rms/lib/auth";
import { checkPassword } from "@rms/lib/hash";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";

export async function createLogin(params: {
  username: string;
  password: string;
}): Promise<ServiceActionModel<string>> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });

  if (user !== null) {
    var isPasswordOk = checkPassword(params.password, user.password);
    if (isPasswordOk) {
      var token = generateToken(user.username);
      cookies().set("rms-auth", token);
      var auth = await prisma.auth.findMany({
        where: { user_id: user.id, status: "Enable" },
      });
      if (auth.length > 0) {
        await prisma.auth.updateMany({
          where: { status: "Enable", user_id: user.id },
          data: { status: "Disable" },
        });
      }
      await prisma.auth.create({
        data: { token: token, user_id: user.id, status: "Enable" },
      });
      return {
        status: HttpStatusCode.OK,
        message: "LogedIn",
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
        where: { id: result.id, status: "Accepted" },
        data: { status: "Disable" },
      });
    }
  }
  return {
    status: HttpStatusCode.OK,
    message: "LogedOut",
  };
}
