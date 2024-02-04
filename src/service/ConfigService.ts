"use server";
import IConfig from "@nexcite/Interfaces/IConfig";
import IResponse from "@nexcite/Interfaces/IResponse";
import HandleResponse from "@nexcite/decorators/HandleResponse";
import prisma from "@nexcite/prisma/prisma";
import { ConfigInputUpdateSchema } from "@nexcite/schema/ConfigSchema";
import { $Enums } from "@prisma/client";
import { saveFile, uploadMediaTemp } from "./media-service";

class ConfigService {
  @HandleResponse({})
  static async findCurrencies(config_id: number): Promise<IResponse<IConfig>> {
    return {
      body: await prisma.config.findUnique({
        where: {
          id: config_id,
        },
      }),
      status: 200,
    };
  }
  @HandleResponse({
    permission: "Update_Config",
    paths: ["/admin/config", "/admin"],
  })
  static async updateConfig(
    config_id: number,
    input: { data: ConfigInputUpdateSchema; file?: FormData }
  ): Promise<IResponse> {
    var media: {
      path: string;
      fileName: string;
      type: $Enums.MediaType;
    };

    if (input.file) {
      const path = await uploadMediaTemp(input.file);
      media = await saveFile(path);
    }

    await prisma.config.update({
      where: { id: config_id },
      data: {
        name: input.data.config.name,

        email: input.data.config.email,
        logo: media?.path ?? input.data.config.logo,

        phone_number: input.data.config.phone_number,
      },
    });

    return {
      status: 200,
      message: "Config updated successfully",
    };
  }
}

export const { findCurrencies, updateConfig } = ConfigService;
