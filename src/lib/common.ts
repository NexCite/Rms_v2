import { $Enums } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import { saveFile, uploadMediaTemp } from "@nexcite/service/media-service";
import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export { phoneRegex };

const fileZod = z.instanceof(File);
const mediaZod = z.object({
  id: z.number().optional().nullable(),
  title: z.string(),
  description: z.string(),
  type: z.enum(Object.keys($Enums.MediaType) as any),
  path: z.string(),
  file_name: z.string(),
  invoice_id: z.number().optional().nullable(),
  payment_id: z.number().optional().nullable(),
  entry_id: z.number().optional().nullable(),
});

export async function FileMapper(props: {
  file: FormData;
  title: string;
  config_id: number;
}) {
  if (props.file) {
    const path = await uploadMediaTemp(props.file);
    const media = await saveFile(path);

    return await prisma.media.create({
      data: {
        file_name: media.fileName,
        path: media.path,
        title: props.title,
        type: media.type,
        config_id: props.config_id,
      },
    });
  }
}

export { fileZod, mediaZod };
