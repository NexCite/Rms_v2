"use server";

import prisma from "@rms/prisma/prisma";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import AppConfig from "../../app-config.json";

import { getConfigId } from "@rms/lib/config";
import { handlerServiceAction } from "@rms/lib/handler";
import path from "path";

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

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const fullPath = dir + "/" + fileName;
    writeFileSync(fullPath, buffer);
    return filePath + "/" + fileName;
  } catch (e) {
    console.log(e);
    return "error";
  }
}
export async function readMedia(filePath: string) {
  const config_id = await getConfigId();

  if (
    !filePath.startsWith(`/${config_id}`) &&
    (filePath.startsWith("/assets/temp") ||
      filePath.startsWith("/assets/temp/"))
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

export async function copyMediaTemp(tempFilePath: string, config_id?: number) {
  const config = await getConfigId();
  const paths = tempFilePath.split("/");
  const fileName = paths[paths.length - 1];

  paths.pop();
  const tempFolderPath = paths.join("/");
  const newFolderPath = tempFolderPath.replace(
    "temp",
    config ? config + "" : config_id + ""
  );

  const tempDir = path.join(process.cwd(), "..", tempFolderPath);
  const newDir = path.join(process.cwd(), "..", newFolderPath);

  if (!existsSync(newDir)) {
    mkdirSync(newDir, { recursive: true });
  }

  const readOldPathFile = readFileSync(tempDir + "/" + fileName);
  writeFileSync(newDir + "/" + fileName, readOldPathFile);

  unlinkSync(tempDir + "/" + fileName);

  return newFolderPath + "/" + fileName;
}
export async function deleteMedia(filePath: string) {
  const dir = path.join(process.cwd(), "..", filePath);

  unlinkSync(dir);

  return 200;
}
