"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import { hashPassword } from "@rms/lib/hash";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { saveFile, uploadMediaTemp } from "./media-service";
import { createScheuleConfig } from "./schedule-config-service";

export async function saveConfig(props: {
  config: Prisma.ConfigUncheckedUpdateInput;
  id?: number;
  file?: FormData;
}) {
  return handlerServiceAction(async () => {
    if (props.config.password) {
      props.config.password = hashPassword(props.config.password.toString());
    }
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
        password: props.config.password,
        username: props.config.username,
        email: props.config.email,
        logo: media?.path ?? props.config.logo,

        phone_number: props.config.phone_number,
      },
    });

    return "Updated";
  }, "Edit_Config");
}

export async function initConfig(props: {
  config: Prisma.ConfigUncheckedCreateInput & {
    first_name: string;
    last_name: string;
  };

  file?: FormData;
}) {
  return handlerServiceAction(async () => {
    props.config.password = hashPassword(props.config.password);

    const result = await prisma.config.create({
      data: {
        name: props.config.name,
        password: props.config.password,
        username: props.config.username,
        email: props.config.email,
        logo: "",
        phone_number: props.config.phone_number,
      },
    });

    const tempFilePath = await uploadMediaTemp(props.file);

    const newPath = await saveFile(tempFilePath);

    await prisma.config.update({
      where: { id: result.id },
      data: { logo: newPath.path },
    });
    var role = await prisma.role.create({
      data: {
        config_id: result.id,
        name: "Admin",
        permissions: Object.keys(
          $Enums.UserPermission
        ) as $Enums.UserPermission[],
      },
    });
    await prisma.user.create({
      data: {
        first_name: props.config.first_name,
        last_name: props.config.last_name,
        gender: "Male",
        phone_number: props.config.phone_number,
        username: props.config.username,
        password: props.config.password,
        country: "Lebanon",
        type: "Admin",
        email: props.config.email,
        config_id: result.id,
        path: CommonRouteKeys,
        status: "Enable",
        role_id: role.id,
      },
    });
    await createScheuleConfig(result.id);

    return "";
  }, "None");
}

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
