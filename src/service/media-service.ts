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
export async function uploadMedia(
  fromData: FormData
): Promise<ServiceActionModel<string>> {
  try {
    var file = fromData.get("file") as any;
    const dir = path.join(process.cwd(), "..", "assets/files/images/");

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
      result: fileName,
    };
  } catch (e) {
    return { status: HttpStatusCode.INTERNAL_SERVER_ERROR };
  }
}

export async function deleteMedia(filePath: string) {
  return handlerServiceAction(async (a) => {
    await prisma.media.updateMany({
      where: { path: filePath },
      data: { invoice_id: null, status: "Deleted", payment_id: null },
    });
  }, "Delete_Media");
}
export async function removeMedia(filePath: string) {
  return handlerServiceAction(async (auth) => {
    await prisma.media.deleteMany({
      where: { path: filePath },
    });

    revalidatePath("/admin/media");

    const dir = path.join(process.cwd(), "..", "assets/files/images/");
    try {
      if (existsSync(dir + "/" + filePath)) {
        unlinkSync(dir + "/" + filePath);
        return { status: HttpStatusCode.OK };
      }
    } catch (error) {
      return { status: HttpStatusCode.NOT_FOUND };
    }
  }, "None");
}

export async function readMedia(filePath: string) {
  const dir = path.join(process.cwd(), "..", "assets/files/images/");

  var file = readFileSync(dir + "/" + filePath);

  var fileName = filePath.split("/");

  return {
    file: file,
    name: fileName[fileName.length - 1],
  };
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
  return handlerServiceAction((auth) => {
    return prisma.media.findMany({
      where: { NOT: { status: "Deleted" } },
      orderBy: { modified_date: "desc" },
    });
  }, "View_Medias");
}
