"use server";

import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { revalidatePath } from "next/cache";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";

import path from "path";
import { handlerServiceAction } from "@rms/lib/handler";
import { getConfigId } from "@rms/lib/config";
import { undefined } from "zod";
export async function uploadMedia(
  fromData: FormData,
  props?: {
    invoice_id?: number;
    payment_id?: number;
    entry_id?: number;
  }
): Promise<ServiceActionModel<string>> {
  var file = fromData.get("file") as any;

  const date = new Date();
  return handlerServiceAction(
    async (auth, config_id) => {
      var buffer = await streamToBytes(file["stream"]() as ReadableStream);
      var type = file["name"].split(".");
      const fileName = date.getTime() + "." + type[type.length - 1];
      const pathName = `${config_id}/${type}/${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/`;

      const dir = path.join(process.cwd(), "..", pathName);
      var fullPath = dir + fileName;

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      const media = await prisma.media.create({
        data: {
          path: pathName + "/" + fileName,
          title: file,
          file_name: fileName,
          type: type === "pdf" ? "Pdf" : "Image",
          ...props,
          config_id,
        },
      });

      writeFileSync(fullPath, buffer);

      return media.path;
    },
    "None",
    true
  );
}
export async function uploadLogo(fromData: FormData) {
  try {
    var file = fromData.get("file") as any;
    const dir = path.join(process.cwd(), "..", `/logo/`);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    var buffer = await streamToBytes(file["stream"]() as ReadableStream);
    var type = file["name"].split(".");
    const fileName = Date.now() + "." + type[type.length - 1];
    var fullPath = dir + fileName;
    writeFileSync(fullPath, buffer);

    return {
      status: HttpStatusCode.OK,
      result: `logo/${fileName}`,
    };
  } catch (e) {
    console.log(e);

    return { status: HttpStatusCode.INTERNAL_SERVER_ERROR };
  }
}

export async function deleteMedia(id: number) {
  return handlerServiceAction(async (auth, config_id) => {
    await prisma.media.updateMany({
      where: { id, config_id },
      data: { invoice_id: null, status: "Deleted", payment_id: null },
    });
  }, "Delete_Media");
}
export async function removeMedia(path: string) {
  return handlerServiceAction(async (auth, config_id) => {
    const mediaR = await prisma.media.findFirst({ where: { path } });
    const media = await prisma.media.delete({
      where: { id: mediaR?.id ?? 0, config_id },
    });

    if (!media) {
      return { status: 404 };
    }
    revalidatePath("/admin/media");

    try {
      if (existsSync(media.path)) {
        unlinkSync(media.path);
        return { status: HttpStatusCode.OK };
      }
    } catch (error) {
      return { status: HttpStatusCode.NOT_FOUND };
    }
  }, "None");
}

export async function readMedia(id: number) {
  const config_id = await getConfigId();
  const media = await prisma.media.findUnique({ where: { id, config_id } });

  if (!media) return undefined;

  var file = readFileSync(media.path);

  var fileName = media.path.split("/");

  return {
    file: file,
    name: fileName[fileName.length - 1],
  };
}
export async function readLogo(pathMedia: string) {
  const config = await prisma.config.findFirst({
    where: { logo: { endsWith: pathMedia } },
  });
  var fullPath = path.join(process.cwd(), "..");
  if (config) {
    var file = readFileSync(fullPath + "/" + pathMedia);

    var fileName = pathMedia.split("/");

    return {
      file: file,
      name: fileName[fileName.length - 1],
    };
  }
  return undefined;
}

async function streamToBytes(readableStream: any) {
  const chunks = [];

  for await (const chunk of readableStream) {
    chunks.push(chunk);
  }

  const size = chunks.reduce((totalSize, chunk) => totalSize + chunk.length, 0);
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  return bytes;
}

export async function getAllMedia() {
  return handlerServiceAction((auth, config_id) => {
    return prisma.media.findMany({
      where: { NOT: { status: "Deleted" }, config_id },
      orderBy: { modified_date: "desc" },
    });
  }, "View_Medias");
}
