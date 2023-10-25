"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { copyMediaTemp } from "./media-service";

export async function createConfig(
  params: Prisma.ConfigUncheckedCreateInput & {
    first_name: string;
    last_name: string;
  }
) {
  return handlerServiceAction(async () => {
    params.password = hashPassword(params.password);

    const result = await prisma.config.create({
      data: {
        name: params.name,
        password: params.password,
        username: params.username,
        email: params.email,
        logo: "",
        phone_number: params.phone_number,
      },
    });

    const newPath = await copyMediaTemp(params.logo, result.id);

    await prisma.config.update({
      where: { id: result.id },
      data: { logo: newPath },
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

export async function updateConfig(
  params: Prisma.ConfigUncheckedUpdateInput & {
    first_name: string;
    last_name: string;
  }
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      const updateParams = {
        name: params.name,
        username: params.username,
        email: params.email,
        // logo: "",
        phone_number: params.phone_number,
      };

      if (params.password) {
        params.password = hashPassword(params.password as string);

        updateParams["password"] = params.password;
      }

      await prisma.config.update({
        where: { id: config_id },
        data: updateParams,
      });

      // const newPath = await copyMediaTemp(params.logo, result.id);

      // await prisma.config.update({
      //   where: { id: result.id },
      //   data: { logo: newPath },
      // });

      delete updateParams.name;

      await prisma.user.update({
        where: { id: auth.id, config_id },
        data: {
          ...updateParams,
          first_name: params.first_name,
          last_name: params.last_name,
        },
      });

      return "";
    },
    "Edit_Config",
    true,
    params
  );
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
