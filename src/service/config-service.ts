"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function createConfig(
  params: Prisma.ConfigUncheckedCreateInput & {
    first_name: string;
    last_name: string;
  }
) {
  return handlerServiceAction(async () => {
    params.password = hashPassword(params.password);
    console.log("hello");
    const mediaPath = params.logo.split("/");
    const result = await prisma.config.create({
      data: {
        name: params.name,
        password: params.password,
        username: params.username,
        email: params.email,
        logo: params.logo,
        phone_number: params.phone_number,
        media: {
          create: {
            file_name: mediaPath[mediaPath.length - 1],
            path: params.logo,
            title: `${params.name} Logo`,
            type: "Image",
          },
        },
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
        config_id: result.id,
        path: CommonRouteKeys,
        status: "Enable",
        permissions: Object.keys(
          $Enums.UserPermission
        ) as $Enums.UserPermission[],
      },
    });

    return "";
  }, "None");
}
export async function getConfig() {
  return handlerServiceAction(
    async (auth, config_id) => {
      return prisma.config.findFirst({
        where: { id: config_id },
        select: { name: true, email: true, logo: true, phone_number: true },
      });
    },
    "None",
    false,
    {}
  );
}
