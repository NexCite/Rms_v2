import { readFileSync } from "fs";
import path from "path";
import os from "os";
import UploadType from "../types/upload-type";
import NextCiteUpload from "./upload";

export default class NexCiteMedia {
  folderName: string;
  type: UploadType;
  private dir = os.homedir();
  private _fullPath: string;
  constructor(props: { folderName: string; type: UploadType }) {
    this.folderName = props.folderName;
    this.type = props.type;
    this._fullPath = `${this.dir}/${props.folderName}`;
  }
  getMimeType(fileExtension: string): string {
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };

    return mimeTypes[fileExtension.toLowerCase()] || "application/octet-stream";
  }
  readFile(filePath: string) {
    const newFilePath = path.join(this._fullPath, filePath);

    const fileName = NexCiteMedia.getFileName(filePath);
    const data = readFileSync(newFilePath);

    return new File([Buffer.from(data)], fileName);
    // return {
    //   type,
    //   fileName,
    //   data,
    // };
  }
  static getFileType(filePath: string): string {
    // Extract the file extension
    const extension = filePath.split(".").pop();

    if (!extension) {
      return "Unknown"; // In case there's no extension
    }

    // Map extensions to file types
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "Image";
      case "txt":
        return "Text";
      case "mp3":
        return "Audio";
      case "mp4":
        return "Video";
      case "pdf":
        return "PDF";
      case "json":
        return "json";
      default:
        return "Unknown";
    }
  }
  static getFileName(filePath: string) {
    return path.basename(filePath);
  }

  // Usage example
}
