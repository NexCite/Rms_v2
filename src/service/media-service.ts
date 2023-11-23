"use server";

import prisma from "@rms/prisma/prisma";
import NexCite from "@rms/lib/nexcite_lib";
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
  return handlerServiceAction((info, config_id) => {
    return prisma.media.findMany({
      where: { NOT: { status: "Deleted" }, config_id },
      orderBy: { modified_date: "desc" },
    });
  }, "View_Medias");
}

export async function uploadMediaTemp(fromData: FormData) {
  try {
    var file = fromData.get("file") as any;
    const config_id = await getConfigId();

    var uploadService = await new NexCite.UploadService({
      folderName: "NexCite/RMS/" + config_id,
      type: "local",
    }).init();

    var result = await uploadService.uploadFile(file);

    return result;
  } catch (e) {
    console.log(e);
    return "error";
  }
}
export async function readMedia(filePath: string) {
  const config_id = await getConfigId();

  return new NexCite.MediaService({
    folderName: "NexCite/RMS/" + config_id,
    type: "local",
  }).readFile(filePath);
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
export async function saveFile(tempFilePath: string, config_id?: number) {
  return await new NexCite.UploadService({
    folderName: "NexCite/RMS/" + config_id,
    type: "local",
  }).saveFile(tempFilePath);
}
export async function deleteMedia(filePath: string) {
  const config_id = await getConfigId();

  return new NexCite.UploadService({
    folderName: "NexCite/RMS/" + config_id,
    type: "local",
  });
}
