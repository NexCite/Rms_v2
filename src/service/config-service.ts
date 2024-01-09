"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { saveFile, uploadMediaTemp } from "./media-service";
import { createScheuleConfig } from "./schedule-config-service";

/**
 *
 * Done
 *
 */
export async function editConfig(props: {
  config: Prisma.ConfigUncheckedUpdateInput;
  id?: number;
  file?: FormData;
}) {
  return handlerServiceAction(async () => {
    var media: {
      path: string;
      fileName: string;
      type: $Enums.MediaType;
    };

    if (props.file) {
      const path = await uploadMediaTemp(props.file);
      media = await saveFile(path);
    }

    await prisma.config.update({
      where: { id: props.id },
      data: {
        name: props.config.name,

        email: props.config.email,
        logo: media?.path ?? props.config.logo,

        phone_number: props.config.phone_number,
      },
    });

    return "Config Updated";
  }, "Edit_Config");
}

/**
 *
 * Done
 *
 */
export async function initConfig(props: {
  config: Prisma.ConfigUncheckedCreateInput & {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  };
  file?: FormData;
}) {
  return handlerServiceAction(async () => {
    props.config.password = hashPassword(props.config.password);
    const tempFilePath = await uploadMediaTemp(props.file);
    const newPath = await saveFile(tempFilePath);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: props.config.username,
          },
          {},
        ],
      },
    });

    if (user) {
      if (user.username === props.config.username) {
        throw new Error("Username already used!");
      }

      // if (user.email === props.config.email) {
      //   throw new Error("Email already used!");
      // }
    }
    const result = await prisma.config.create({
      data: {
        name: props.config.name,
        email: props.config.email,
        logo: newPath.path,

        phone_number: props.config.phone_number,
        schedule_configes: {
          create: {},
        },

        roles: {
          create: {
            name: "Admin",
            permissions: Object.keys(
              $Enums.UserPermission
            ) as $Enums.UserPermission[],
            users: {
              create: {
                first_name: props.config.first_name,
                last_name: props.config.last_name,
                // gender: "Male",
                // phone_number: props.config.phone_number,
                username: props.config.username,
                password: props.config.password,
                // country: "Lebanon",
                type: "Admin",
                // email: props.config.email,
                path: CommonRouteKeys,
                status: "Enable",
              },
            },
          },
        },
      },
    });

    await prisma.user.updateMany({
      where: { username: props.config.username },
      data: { config_id: result.id },
    });

    return "Project created successfully!";
  }, "None");
}

/**
 *
 * Done
 *
 */
export async function getConfig() {
  return handlerServiceAction(
    async (info, config_id) => {
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
