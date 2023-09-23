"use server";
import { $Enums, Prisma } from "@prisma/client";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createConfig(
  params: Prisma.ConfigCreateInput
): Promise<ServiceActionModel<HttpStatusCode>> {
  params.password = hashPassword(params.password);

  const config = await prisma.config.findFirst();
  if (config) {
    return {
      status: HttpStatusCode.ALREADY_REPORTED,
      message: "Config already configed",
    };
  }

  const result = await prisma.config.create({ data: params });
  await prisma.user.create({
    data: {
      first_name: "admin",
      last_name: "admin",
      gender: "Male",
      phone_number: params.phone_number,
      username: params.username,
      password: params.password,
      country: "Lebanon",
      type: "Admin",
      email: params.email,

      path: CommonRouteKeys,
      status: "Enable",
      permissions: Object.keys(
        $Enums.UserPermission
      ) as $Enums.UserPermission[],
    },
  });

  if (result) {
    return { status: HttpStatusCode.OK };
  } else {
    return { status: HttpStatusCode.BAD_REQUEST };
  }
}
export async function getConfig() {
  return prisma.config.findFirst({
    select: { name: true, email: true, logo: true, phone_number: true },
  });
}
