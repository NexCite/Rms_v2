import { readMedia } from "@rms/service/media-service";
import { File } from "@web-std/file";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: {
    params: {
      path: string;
    };
  }
) {
  if (context.params.path) {
    var result = await readMedia(context.params.path);

    return new NextResponse(new File([result.file], result.name));
  }
  return NextResponse.error();
}
