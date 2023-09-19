import { MediaType } from "@prisma/client";

export function getMediaType(path: string): MediaType {
  const type = path.split(".");
  if (type[type.length - 1] === "pdf") {
    return "Pdf";
  } else {
    return "Image";
  }
}
