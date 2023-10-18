"use server";

import HttpStatusCode from "@rms/models/HttpStatusCode";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { revalidatePath } from "next/cache";
import AppConfig from "../../app-config.json";
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

export async function uploadMediaTemp(fromData: FormData) {
  try {
    var file = fromData.get("file") as any;
    const date = new Date();
    var buffer = await streamToBytes(file["stream"]() as ReadableStream);
    var type = file["name"].split(".");
    const fileName = date.getTime() + "." + type[type.length - 1];
    const filePath = AppConfig.media.temp_path
      .replace("{type}", type[type.length - 1])
      .replace("{year}", date.getFullYear() + "")
      .replace("{month}", date.getMonth() + 1 + "")
      .replace("{day}", date.getDate() + "");
    const dir = path.join(process.cwd(), "..", filePath.replace("{name}", ""));
    console.log(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const fullPath = dir + "/" + fileName;
    writeFileSync(fullPath, buffer);
    console.log();
    return filePath + "/" + fileName;
  } catch (e) {
    console.log(e);
    return "error";
  }
}
export async function readMedia(filePath: string) {
  const config_id = await getConfigId();
  console.log(filePath, "hello");

  if (
    !filePath.startsWith(`/${config_id}`) &&
    !(filePath.startsWith("/temp") || filePath.startsWith("temp/"))
  ) {
    return;
  }

  const dir = path.join(process.cwd(), "..", filePath);

  var file = readFileSync(dir);

  var fileName = filePath;

  return {
    file: file,
    name: fileName[fileName.length - 1],
  };
}

export async function copyMediaTemp(filePath: string) {
  const config_id = await getConfigId();

  const dir = path.join(process.cwd(), "..", filePath);

  var newPath = filePath.replace("temp", config_id + "");
  const newDir = path.join(process.cwd(), "..", newPath);
  var tempFile = readFileSync(dir);

  writeFileSync(newDir, tempFile);

  unlinkSync(dir);

  return newPath;
}
export async function deleteMedia(filePath: string) {
  const dir = path.join(process.cwd(), "..", filePath);

  unlinkSync(dir);

  return 200;
}
