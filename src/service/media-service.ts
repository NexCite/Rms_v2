"use server";

import NexCite from "@rms/lib/nexcite_lib";
import prisma from "@rms/prisma/prisma";

import { handlerServiceAction } from "@rms/lib/handler";

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
    var uploadService = await new NexCite.UploadService({
      folderName: "NexCite/RMS",
      type: "local",
    }).init();

    var result = await uploadService.uploadFile(file);

    return result;
  } catch (e) {
    console.log(e);
    return "error";
  }
}
export async function uploadFileTemp(file: File) {
  try {
    var uploadService = await new NexCite.UploadService({
      folderName: "NexCite/RMS",
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
  return new NexCite.MediaService({
    folderName: "NexCite/RMS/",
    type: "local",
  }).readFile(filePath);
}

export async function saveFile(tempFilePath: string) {
  return await new NexCite.UploadService({
    folderName: "NexCite/RMS/",
    type: "local",
  }).saveFile(tempFilePath);
}
export async function deleteMedia(filePath: string) {
  return new NexCite.UploadService({
    folderName: "NexCite/RMS",
    type: "local",
  }).deleteFile(filePath);
}
