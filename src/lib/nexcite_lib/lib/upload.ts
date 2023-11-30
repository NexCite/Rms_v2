import fs, { promises as fsPromises } from "fs";
import os from "os";
import path, { resolve } from "path";
import UploadType from "../types/upload-type";
import { getMediaType } from "@rms/lib/media";

export default class NextCiteUpload {
  folderName: string;
  type: UploadType;
  private dir = os.homedir();
  private _fullPath: string;

  constructor(props: { folderName: string; type: UploadType }) {
    this.folderName = props.folderName;
    this.type = props.type;
    this._fullPath = path.join(this.dir, props.folderName);
  }

  async saveFile(filePath: string) {
    const tempFilePath = path.join(this._fullPath, filePath);
    const newFilePath = path.join(
      this._fullPath,
      filePath.replace("/temp", "").replace("\\temp", "")
    );

    this.copyFileToNewDir(tempFilePath, newFilePath);

    return {
      path: newFilePath.replace(this._fullPath, ""),
      fileName: path.basename(newFilePath),
      type: getMediaType(newFilePath),
    };
  }
  //#region init
  async init() {
    switch (this.type) {
      case "s3":
        break;
      case "local":
        const checkFolder = resolve(`${this._fullPath}`);
        await this.ensureDirectoryExists(checkFolder);
        break;

      default:
        break;
    }
    return this;
  }
  //#endregion

  //#region upload
  static getFileExtension(mimeType: string): string | null {
    const mimeToExtension: { [key: string]: string } = {
      "text/plain": ".txt",
      "text/html": ".html",
      "text/css": ".css",
      "text/javascript": ".js",
      "text/csv": ".csv",
      "application/xml": ".xml",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/bmp": ".bmp",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "video/ogg": ".ogg",
      "video/x-msvideo": ".avi",
      "video/quicktime": ".mov",
      "audio/mpeg": ".mp3",
      "audio/wav": ".wav",
      "audio/ogg": ".ogg",
      "audio/aac": ".aac",
      "audio/flac": ".flac",
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
      "application/zip": ".zip",
      "application/vnd.rar": ".rar",
      "application/x-7z-compressed": ".7z",
      "application/x-tar": ".tar",
      "application/gzip": ".gz",
      "application/vnd.microsoft.portable-executable": ".exe",
      "application/x-elf": ".elf",
      "font/ttf": ".ttf",
      "font/otf": ".otf",
      "font/woff": ".woff",
      "font/woff2": ".woff2",
    };

    return mimeToExtension[mimeType] || null;
  }
  async uploadFile(file: File) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const dateString = `${year}/${month}/${day}`;

    const dirPath = path.join(`${this._fullPath}/temp`, dateString);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const timeNow = now.getTime();
    const fileName = `${timeNow}${NextCiteUpload.getFileExtension(file.type)}`;

    const filePath = path.join(dirPath, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.promises.writeFile(filePath, buffer);

    const returnFilePath = path.join("/temp", dateString, fileName);
    return returnFilePath;
  }

  private copyFileToNewDir(
    sourceFilePath: string,
    targetDirPath: string
  ): void {
    const baseFile = path.basename(sourceFilePath);

    targetDirPath = targetDirPath.replace(`${baseFile}`, "");

    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    fs.copyFileSync(sourceFilePath, path.join(targetDirPath, baseFile));
    fs.unlinkSync(sourceFilePath);
  }

  deleteFile(filePath: string) {
    try {
      fs.unlinkSync(path.join(this._fullPath, filePath));
    } catch (error) {}
  }

  //#endregion

  //#region  libs
  private async ensureDirectoryExists(folderPath: string): Promise<void> {
    try {
      await fsPromises.access(folderPath);
      // The folder exists
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // Folder does not exist, create it
        await fsPromises.mkdir(folderPath, { recursive: true });
        await fsPromises.mkdir(`${folderPath}/temp`, { recursive: true });
      } else {
        // Re-throw the error if it is not related to folder existence
        throw error;
      }
    }
  }
  //#endregion
}
