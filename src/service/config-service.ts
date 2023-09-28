"use server";
import { $Enums, Prisma } from "@prisma/client";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function createConfig(
  params: Prisma.ConfigCreateInput & { first_name: string; last_name: string }
): Promise<ServiceActionModel<HttpStatusCode>> {
  params.password = hashPassword(params.password);

  const config = await prisma.config.findFirst();
  if (config) {
    return {
      status: HttpStatusCode.ALREADY_REPORTED,
      message: "Config already configed",
    };
  }

  const result = await prisma.config.create({
    data: {
      name: params.name,
      password: params.password,
      username: params.username,
      email: params.email,
      logo: params.logo,
      phone_number: params.phone_number,
    },
  });
  await prisma.user.create({
    data: {
      first_name: params.first_name,
      last_name: params.last_name,
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
    revalidatePath("/");
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
